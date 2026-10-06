// Fresh-context check of what's actually live on the Weekly Newsletter
// opt-in page builder right now (not just what the edit session shows).
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PAGE_ID = "TMlZaIRSveTP6JfSqGBa";
const TAG = process.argv[2] || "verify";

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
    `https://app.gohighlevel.com/location/${LOCATION_ID}/page-builder/${PAGE_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `screenshots/vnp-${TAG}-00-topbar.png` });

  // Preview mode (eye icon) renders the actual rendered page in-canvas.
  await page.mouse.click(1259, 25);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `screenshots/vnp-${TAG}-01-preview.png`, fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("VERIFY_NEWSLETTER_PAGE_ERROR", err);
  process.exit(1);
});
