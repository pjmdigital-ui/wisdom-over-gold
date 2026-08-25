// Replace the content of an EXISTING Custom Code block on a funnel step
// (rather than adding a new row/element, which would duplicate content
// since the step already has one from a prior paste_and_save.js run).
// Usage: node update_existing_block.js <content-file.html> <tag> "<Step Name>"
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const CONTENT_FILE = process.argv[2];
const TAG = process.argv[3] || "update";
const STEP_NAME = process.argv[4];

if (!CONTENT_FILE) {
  console.error("Usage: node update_existing_block.js <content-file> <tag> [step-name]");
  process.exit(1);
}
const CODE_CONTENT = fs.readFileSync(CONTENT_FILE, "utf8");

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

  if (STEP_NAME) {
    const stepsTab = page.getByText(/^Steps$/i).first();
    await stepsTab.click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const matches = page.getByText(STEP_NAME, { exact: true });
    const count = await matches.count();
    let bestIdx = 0;
    let bestY = -1;
    for (let i = 0; i < count; i++) {
      const box = await matches.nth(i).boundingBox().catch(() => null);
      if (box && box.y > bestY) {
        bestY = box.y;
        bestIdx = i;
      }
    }
    console.log("STEP_NAME_MATCHES=" + count + " bestIdx=" + bestIdx);
    await matches.nth(bestIdx).click({ timeout: 15000 });
    await page.waitForTimeout(2500);
  }

  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);
  await page.screenshot({ path: `screenshots/u1-${TAG}-loaded.png`, fullPage: true });

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();

  // Click the EXISTING Custom HTML/Javascript block already on the canvas.
  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `screenshots/u2-${TAG}-block-clicked.png`, fullPage: true });

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/u3-${TAG}-editor-open.png`, fullPage: true });

  await page.mouse.click(719, 400);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(CODE_CONTENT);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/u4-${TAG}-content-inserted.png`, fullPage: true });

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  // Save the page itself.
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `screenshots/u5-${TAG}-page-saved.png`, fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("UPDATE_BLOCK_ERROR", err);
  process.exit(1);
});
