// Renders any hook-lesson-style Instagram post HTML's ".post" card to a
// high-resolution PNG at Instagram's real feed-post pixel size (1080x1350).
// Requires: npm install playwright-core (chromium is pre-fetched in this
// environment at /opt/pw-browsers — adjust CHROMIUM_PATH elsewhere).
// Usage: node render_instagram_png.js [source.html] [output.png]
// Defaults to instagram-post-hook-lesson.html / sf_ig_the_ache_underneath.png.
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

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

  const exportHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #0a0a0a; }
    ${style}
    .post { width: 1080px; height: 1350px; box-shadow: none; border: none; }
  </style></head><body>${postHtml}</body></html>`;

  const exportPath = path.join(OUT_DIR, "_export.html");
  fs.writeFileSync(exportPath, exportHtml);

  const browser = await chromium.launch({ executablePath: CHROMIUM_PATH });
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 3,
  });
  await page.goto("file://" + exportPath);
  const el = await page.$(".post");
  await el.screenshot({ path: path.join(OUT_DIR, OUT_FILE) });
  await browser.close();
  fs.unlinkSync(exportPath);

  console.log("wrote " + path.join(OUT_DIR, OUT_FILE));
})();
