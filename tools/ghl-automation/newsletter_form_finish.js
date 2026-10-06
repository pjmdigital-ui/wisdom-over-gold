// Rename title, set On Submit -> Redirect to URL, fill URL, Save -- all
// in one continuous session (this builder's autosave is off too).
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
  await page.mouse.click(341, 118);
  await page.waitForTimeout(1000);

  // Rename
  await page.mouse.click(748, 25);
  await page.waitForTimeout(800);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Newsletter Signup");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(800);
  console.log("RENAMED");

  // Settings tab
  await page.mouse.click(585, 75);
  await page.waitForTimeout(3000);

  // Open On Submit dropdown, choose "Redirect to URL"
  await page.mouse.click(719, 243);
  await page.waitForTimeout(1000);
  await page.mouse.click(719, 289); // "Redirect to URL" option
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/finish-00-redirect-selected.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("FORM_FINISH_ERROR", err);
  process.exit(1);
});
