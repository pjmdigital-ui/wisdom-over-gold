// Reads or writes the Sales page's LEFT-COLUMN Custom Code block
// (the one next to the order form) directly through its CodeMirror
// instance. Distinct from get_set_hero_block.js because the Sales page
// now has two Custom HTML/Javascript blocks — this one is found by
// clicking on its own rendered content (unique bullet text), not by
// "first() on the page".
//
// Usage:
//   node get_set_left_col.js get <output-file>
//   node get_set_left_col.js set <input-file>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";

const MODE = process.argv[2];
const FILE_ARG = process.argv[3];

if (!MODE || !FILE_ARG) {
  console.error("Usage: node get_set_left_col.js get|set <file>");
  process.exit(1);
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/funnels-websites/funnels/${FUNNEL_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  const stepsTab = page.getByText(/^Steps$/i).first();
  await stepsTab.click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.mouse.click(334, 427); // "Sales" row
  await page.waitForTimeout(1500);
  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  const frame = page.frameLocator('iframe[src*="page-builder"]');
  const orderEl = frame.locator('text=/Wait! Add the Audio Narration/i').first();
  const orderBox = await orderEl.boundingBox({ timeout: 15000 }).catch(() => null);
  if (!orderBox) {
    console.error("SAFETY ABORT: not on Sales page");
    await page.screenshot({ path: "screenshots/gslc-abort.png", fullPage: false });
    await context.close();
    process.exit(1);
  }
  // Custom HTML/Javascript elements never render their actual content in
  // the builder canvas (confirmed earlier in this project) — the left
  // column here is just an empty-looking placeholder bar, so we can't
  // locate it by its rendered text. Use the known scroll position + a
  // fixed coordinate on that placeholder bar instead.
  await page.mouse.wheel(0, orderBox.y - 800);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/gslc-pre-click.png", fullPage: true });
  await page.mouse.click(430, 1109);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/gslc-00-selected.png", fullPage: false });

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/gslc-01-editor-open.png", fullPage: false });

  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));

  if (MODE === "get") {
    const value = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
    fs.writeFileSync(FILE_ARG, value, "utf8");
    console.log("WROTE " + value.length + " chars to " + FILE_ARG);
  } else if (MODE === "set") {
    const newContent = fs.readFileSync(FILE_ARG, "utf8");
    const result = await realFrame.evaluate((content) => {
      const cm = document.querySelector(".CodeMirror").CodeMirror;
      cm.setValue(content);
      return cm.getValue().length;
    }, newContent);
    console.log("SET content, new length in editor=" + result + " (source file length=" + newContent.length + ")");

    const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
    await saveModalBtn.click({ timeout: 15000 });
    await page.waitForTimeout(2500);

    await page.mouse.click(1305, 25); // page-level save (1900 viewport toolbar coordinate)
    await page.waitForTimeout(4000);
    await page.screenshot({ path: "screenshots/gslc-page-saved.png", fullPage: false });
  } else {
    console.error("MODE must be 'get' or 'set'");
  }

  await context.close();
})().catch((err) => {
  console.error("GET_SET_LEFT_COL_ERROR", err);
  process.exit(1);
});
