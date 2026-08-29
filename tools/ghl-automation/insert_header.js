// Inserts the shared site header (Wisdom Over Gold logo) at the very
// top of a funnel step's first Custom HTML/Javascript block, WITHOUT
// touching any existing content in that block.
//
// Why insert-only, not full-file replace: this code editor's Ctrl+A /
// Backspace / Ctrl+C do nothing to its actual content — visually it
// looks like text gets selected, but nothing is copied or deleted
// (the editor isn't using real browser text selection under the hood).
// Only real character-by-character typing (page.keyboard.type) actually
// reaches its model. That's fine for inserting new text at the cursor,
// but makes "clear it and retype everything" impractical here. See
// README for the full story, including that this also means the live
// content on all three funnel pages has quietly diverged from the
// tools/funnel/*.html files checked into this repo (a prior session's
// edits never got synced back) — this script does not attempt to fix
// that, only to add the header on top of whatever is actually live.
//
// Usage: node insert_header.js "<Step Name>"
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const STEP_NAME = process.argv[2];
const HEADER_SNIPPET = fs.readFileSync(path.join(__dirname, "site-header.html"), "utf8");

if (!STEP_NAME) {
  console.error("Usage: node insert_header.js <step-name>");
  process.exit(1);
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 900 },
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

  const matches = page.getByText(STEP_NAME, { exact: true });
  const count = await matches.count();
  let bestIdx = 0, bestY = -1;
  for (let i = 0; i < count; i++) {
    const box = await matches.nth(i).boundingBox().catch(() => null);
    if (box && box.y > bestY) { bestY = box.y; bestIdx = i; }
  }
  await matches.nth(bestIdx).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);

  await page.mouse.click(719, 260);
  await page.waitForTimeout(500);
  await page.mouse.dblclick(719, 260); // real focus needs a double-click, not just a single click
  await page.waitForTimeout(500);
  await page.keyboard.press("Home"); // cursor to the very start of line 1 == start of document
  await page.waitForTimeout(300);
  await page.keyboard.type(HEADER_SNIPPET, { delay: 3 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `screenshots/ih-${STEP_NAME.replace(/\s+/g, "")}-01-inserted.png`, fullPage: true });

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  // save the page itself (autosave is off)
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `screenshots/ih-${STEP_NAME.replace(/\s+/g, "")}-02-page-saved.png`, fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("INSERT_HEADER_ERROR", err);
  process.exit(1);
});
