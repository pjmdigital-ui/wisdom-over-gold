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
    viewport: { width: 1440, height: 900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/dashboard`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(8000);
  await page.screenshot({ path: "screenshots/forms-dash.png", fullPage: true });

  const sitesNav = page.getByText(/^Sites$/i).first();
  await sitesNav.click({ timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "screenshots/forms-sites.png", fullPage: true });

  await page.mouse.click(984, 65);
  await page.waitForTimeout(8000);
  console.log("URL=" + page.url());
  await page.screenshot({ path: "screenshots/forms-00-list.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("EXPLORE_FORMS_ERROR", err);
  process.exit(1);
});
