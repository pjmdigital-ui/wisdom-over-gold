const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1280, height: 1400 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(`https://wisdomovergold.com/seek-first-weekly?nocache=${Date.now()}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "screenshots/live-newsletter-page.png", fullPage: true });
  console.log("DONE");

  await context.close();
})().catch((err) => {
  console.error("SCREENSHOT_ERROR", err);
  process.exit(1);
});
