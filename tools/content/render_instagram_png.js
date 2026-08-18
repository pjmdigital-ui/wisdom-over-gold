// Renders any hook-lesson-style Instagram post HTML's ".post" card to a
// high-resolution PNG at Instagram's real feed-post pixel size (1080x1350).
// Requires: npm install playwright-core (chromium is pre-fetched in this
// environment at /opt/pw-browsers — adjust CHROMIUM_PATH elsewhere) and a
// python3 with Pillow (`python3 -c "import PIL"` to check) for the final crop.
// Usage: node render_instagram_png.js [source.html] [output.png]
// Defaults to instagram-post-hook-lesson.html / sf_ig_the_ache_underneath.png.
//
// IMPORTANT — two separate bugs were found and worked around here, and
// BOTH matter even though only one is structural:
//
// 1. (Structural, always relevant) Do not "simplify" this by screenshotting
//    the element or page directly at exactly 1080x1350: elementHandle.
//    screenshot(), page.screenshot({clip}), and a plain page.screenshot()
//    whose viewport height exactly equals the content height all reliably
//    produced a compositing glitch that duplicated part of the page on this
//    Chromium build. The fix is what's below: a PLAIN, UNCROPPED
//    page.screenshot() of a viewport taller than the content (so there's
//    always scroll slack), then a real pixel crop of the saved PNG. Don't
//    remove the padding or the crop step even though it looks redundant.
//
// 2. (Content-dependent — NOT fully solved by #1) The same glitch also
//    showed up, deterministically, on a post whose highlighted ".thesis"
//    span wrapped to 5 lines, even with fix #1 in place — while a similar
//    post wrapping to 4 lines rendered clean, byte-identical across 4
//    repeated runs. Root cause not fully isolated (tested and ruled out:
//    file-write races, fsync timing, paint-settle waits, cache/filename
//    reuse — none of those changed the outcome; only cutting the copy
//    did). Practical rule until this is understood better: keep the
//    ".thesis" span to at most ~4 wrapped lines, keep total body copy near
//    the ~50-60 word budget already documented in README.md, and ALWAYS
//    look at the rendered PNG before trusting it — a script exiting 0 is
//    not evidence the image is correct.
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const CHROMIUM_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SRC = path.resolve(__dirname, process.argv[2] || "instagram-post-hook-lesson.html");
const OUT_DIR = path.join(__dirname, "..", "..", "build", "instagram");
const OUT_FILE = process.argv[3] || "sf_ig_the_ache_underneath.png";

function extractPost(html) {
  const start = html.indexOf('<div class="post">');
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = start;
  let depth = 0, m;
  while ((m = tagRe.exec(html))) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, tagRe.lastIndex);
  }
  throw new Error("could not extract .post block from " + SRC);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const src = fs.readFileSync(SRC, "utf8");
  const style = src.match(/<style>([\s\S]*?)<\/style>/)[1];
  const postHtml = extractPost(src);

  // ${style} is the ENTIRE source <style> block, including the dev-preview
  // "body { padding: 3.5rem ...; display: flex; align-items: center; ... }"
  // rule meant to center the .context/.post/.notes column in-browser. Left
  // unchecked, that padding pushes .post down inside the 1350px viewport,
  // forcing Playwright to scroll the element into view before screenshotting
  // it — which has produced compositing glitches (duplicated content) in
  // element screenshots. The override block below always wins the cascade
  // (it's pasted after ${style}) and pins .post flush to the top-left corner
  // of a viewport sized with headroom, so no scroll is ever needed.
  const exportHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #0a0a0a; }
    ${style}
    body { padding: 0; margin: 0; min-height: 0; display: block; }
    .post { width: 1080px; height: 1350px; box-shadow: none; border: none; position: absolute; top: 0; left: 0; }
  </style></head><body>${postHtml}</body></html>`;

  // Filename is unique per run (not a fixed "_export.html"). This file gets
  // rewritten and reloaded from file:// on every render call across the
  // whole session — a fixed name risks Chromium serving a stale cached
  // paint of a PREVIOUS render under that same path composited with the
  // new one, which produced exactly this kind of duplicated-content glitch
  // in testing. A fresh, never-reused filename sidesteps that entirely.
  const runId = crypto.randomBytes(8).toString("hex");
  const exportPath = path.join(OUT_DIR, `_export_${runId}.html`);
  fs.writeFileSync(exportPath, exportHtml);

  // Viewport is deliberately TALLER than .post (1400 vs 1350) — see the
  // top-of-file note on why the exact-height viewport glitches.
  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1400 },
    deviceScaleFactor: 3,
  });
  await page.goto("file://" + exportPath);
  // NOTE: deliberately NOT page.locator(".post").boundingBox() — that API
  // scrolls the element into view before measuring, which reintroduces the
  // exact compositing glitch this whole rewrite is working around. A raw
  // getBoundingClientRect() read via evaluate() never scrolls the page.
  const box = await page.evaluate(() => {
    const r = document.querySelector(".post").getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (box.x !== 0 || box.y !== 0 || box.width !== 1080 || box.height !== 1350) {
    throw new Error(
      `".post" is not pinned at (0,0) 1080x1350 — got x=${box.x} y=${box.y} w=${box.width} h=${box.height}. ` +
      `Fix the source file's CSS before trusting this render.`
    );
  }

  const rawPath = path.join(OUT_DIR, `_raw_${runId}_` + OUT_FILE);
  const finalPath = path.join(OUT_DIR, OUT_FILE);
  // Plain, UNCROPPED screenshot of the whole (padded) viewport — see the
  // top-of-file note. Do not switch this to el.screenshot() or {clip}.
  await page.screenshot({ path: rawPath });
  await browser.close();
  fs.unlinkSync(exportPath);

  // Crop the padding off for real, in pixel space, with Pillow — at 3x
  // device scale that's the top-left 3240x4050 of the 3240x4200 raw shot.
  execFileSync("python3", [
    "-c",
    "from PIL import Image; import sys; " +
      "im = Image.open(sys.argv[1]); " +
      "im.crop((0, 0, 3240, 4050)).save(sys.argv[2]); " +
      "print('cropped', im.size, '->', (3240, 4050))",
    rawPath,
    finalPath,
  ], { stdio: "inherit" });
  fs.unlinkSync(rawPath);

  console.log("wrote " + finalPath);
})();
