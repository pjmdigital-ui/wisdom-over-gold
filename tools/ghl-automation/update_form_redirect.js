// Updates the Opt-in form's "On Submit -> Redirect to URL" target.
// Usage: node update_form_redirect.js <new-url>
//
// Uses text/attribute-based frame locators (not blind coordinates) to
// find the Settings tab and the URL field — coordinate clicks in this
// builder have drifted between sessions before and once silently
// overwrote a live field's label instead of the redirect URL. See
// README "Pausing the sale..." section for the incident.
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

  const frame = page.frames().find((f) => f.url().includes("leadgen-apps-form-survey-builder"));
  if (!frame) throw new Error("form-builder iframe not found");

  const settingsTab = frame.getByText("Settings", { exact: true }).first();
  await settingsTab.click({ timeout: 10000 });
  await page.waitForTimeout(2000);

  const urlInput = frame.locator('input[value*="wisdomovergold.com"]').first();
  const beforeVal = await urlInput.inputValue();
  console.log("BEFORE value:", beforeVal);

  await urlInput.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type(NEW_URL, { delay: 15 });
  await page.waitForTimeout(500);

  const afterVal = await urlInput.inputValue();
  console.log("AFTER value:", afterVal);
  await page.screenshot({ path: "screenshots/ufr-02-url-filled.png", fullPage: true });

  const saveBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveBtn.click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/ufr-03-saved.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("UPDATE_FORM_REDIRECT_ERROR", err);
  process.exit(1);
});
