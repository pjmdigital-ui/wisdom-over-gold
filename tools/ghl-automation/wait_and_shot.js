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
    viewport: { width: 1440, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(process.argv[2], { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(12000);
  await page.screenshot({ path: process.argv[3] || "screenshots/wait-shot.png", fullPage: true });
  console.log("URL=" + page.url());
  await context.close();
})().catch((err) => {
  console.error("WAIT_ERROR", err);
  process.exit(1);
});
