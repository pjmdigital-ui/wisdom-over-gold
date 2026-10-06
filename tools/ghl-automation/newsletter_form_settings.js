// Rename the form to "Newsletter Signup" and set On Submit -> Redirect
// to URL (the Thank You page), then save.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "S6djGWBap9TqIqWjEFBi";
const THANK_YOU_URL = "https://wisdomovergold.com/thank-you-page-470466";

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
  await page.mouse.click(341, 118); // close element panel if open
  await page.waitForTimeout(1000);

  // Rename: click the pencil icon next to "Form 1" title
  await page.mouse.click(748, 25);
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/settings-00-rename-click.png", fullPage: true });

  await page.keyboard.press("Control+A");
  await page.keyboard.type("Newsletter Signup");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/settings-01-renamed.png", fullPage: true });

  // Go to Settings tab
  await page.mouse.click(585, 75);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/settings-02-tab.png", fullPage: true });

  console.log("URL=" + page.url());
  await context.close();
})().catch((err) => {
  console.error("FORM_SETTINGS_ERROR", err);
  process.exit(1);
});
