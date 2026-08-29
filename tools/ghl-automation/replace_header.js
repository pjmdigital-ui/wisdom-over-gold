// Replaces the shared site header block (top of each page's hero
// Custom HTML/Javascript block) with the current content of
// site-header.html — using get_set_hero_block's approach directly
// (CodeMirror getValue/setValue) rather than shelling out twice.
// Usage: node replace_header.js "<Step Name>"
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const STEP_NAME = process.argv[2];

const OLD_HEADER = fs.readFileSync(path.join(__dirname, "old-header-exact.txt"), "utf8");
const NEW_HEADER = fs.readFileSync(path.join(__dirname, "site-header.html"), "utf8");

if (!STEP_NAME) {
  console.error("Usage: node replace_header.js <step-name>");
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

  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));
  const current = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());

  if (!current.includes(OLD_HEADER)) {
    console.error("OLD HEADER NOT FOUND IN CURRENT CONTENT — aborting without changes");
    console.error("current starts with:\n" + current.slice(0, 400));
    await context.close();
    process.exit(1);
  }
  const updated = current.replace(OLD_HEADER, NEW_HEADER);

  const result = await realFrame.evaluate((content) => {
    const cm = document.querySelector(".CodeMirror").CodeMirror;
    cm.setValue(content);
    return cm.getValue().length;
  }, updated);
  console.log("SET content, new length in editor=" + result + " (expected=" + updated.length + ")");

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `screenshots/rh-${STEP_NAME.replace(/\s+/g, "")}-saved.png`, fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("REPLACE_HEADER_ERROR", err);
  process.exit(1);
});
