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
    permissions: ["clipboard-read", "clipboard-write"],
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/media-storage`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.mouse.click(356, 368);
  await page.waitForTimeout(1500);
  await page.mouse.click(1073, 749); // Copy link
  await page.waitForTimeout(1000);

  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => "ERR:" + e.message);
  console.log("CLIPBOARD=" + clip);

  await context.close();
})().catch((err) => {
  console.error("GET_PDF_URL2_ERROR", err);
  process.exit(1);
});
