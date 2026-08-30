// Updates the Opt-in form's "On Submit -> Redirect to URL" target.
// Usage: node update_form_redirect.js <new-url>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "oIxrLZEdl80kXTwfP0hW";
const NEW_URL = process.argv[2];

if (!NEW_URL) {
  console.error("Usage: node update_form_redirect.js <new-url>");
  process.exit(1);
}

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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/form-builder-v2/${FORM_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);

  await page.mouse.click(585, 75); // "Settings" tab (coordinate, per screenshot)
  await page.waitForTimeout(2000);

  await page.mouse.click(719, 291); // Redirect URL field
  await page.keyboard.press("Control+A");
  await page.keyboard.type(NEW_URL);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/ufr-02-url-filled.png", fullPage: true });

  await page.mouse.click(1381, 25); // Save button (coordinate)
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/ufr-03-saved.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("UPDATE_FORM_REDIRECT_ERROR", err);
  process.exit(1);
});
