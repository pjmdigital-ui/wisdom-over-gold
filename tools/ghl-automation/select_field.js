// Click a field's label text to select it, screenshot to find the
// gear+trash icons that appear at the top-right of the selected block.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "S6djGWBap9TqIqWjEFBi";
const LABEL_TEXT = process.argv[2];
const TAG = process.argv[3] || "field";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1200 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/form-builder-v2/${FORM_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  await page.mouse.click(341, 118); // close element panel if auto-open
  await page.waitForTimeout(1000);

  const frame = page.frameLocator('iframe[src*="leadgen-apps-form-survey-builder"]').first();
  const label = frame.getByText(LABEL_TEXT, { exact: true }).first();
  await label.click({ timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `screenshots/sel-${TAG}.png`, fullPage: true });

  const box = await label.boundingBox();
  console.log("LABEL_BOX=" + JSON.stringify(box));

  await context.close();
})().catch((err) => {
  console.error("SELECT_FIELD_ERROR", err);
  process.exit(1);
});
