const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const WORKFLOW_ID = "ec2be1a1-9d12-4f9e-815a-b63812e3337d";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.screenshot({ path: "screenshots/wae-00-canvas.png", fullPage: true });

  // Click "+" between Wait and END
  await page.mouse.click(745, 767);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/wae-01-action-panel.png", fullPage: true });

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Send email");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/wae-02-search.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_ADD_EMAIL_ERROR", err);
  process.exit(1);
});
