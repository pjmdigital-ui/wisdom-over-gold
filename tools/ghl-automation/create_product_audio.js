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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/payments/products/create`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(14000);

  await page.mouse.click(803, 308);
  await page.keyboard.type("Seek First - Audio Narration Add-On");
  await page.waitForTimeout(300);
  await page.mouse.click(996, 480);
  await page.keyboard.type("Every day of Seek First narrated in Paul's own voice. Added to your order as a digital add-on, delivered by email.");
  await page.waitForTimeout(300);

  await page.mouse.click(301, 210); // Pricing
  await page.waitForTimeout(1500);
  await page.mouse.click(1188, 213);
  await page.keyboard.type("9");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screenshots/pay-10-audio-price-filled.png", fullPage: true });

  await page.mouse.click(1358, 33); // Save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/pay-11-audio-saved.png", fullPage: true });
  console.log("URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("CREATE_PRODUCT_AUDIO_ERROR", err);
  process.exit(1);
});
