const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1000 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/payments/integrations`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(14000);

  await page.mouse.click(1311, 432); // Manage (Stripe)
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/pay-02-stripe-manage.png", fullPage: true });
  console.log("URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("CHECK_STRIPE_ERROR", err);
  process.exit(1);
});
