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
    viewport: { width: 1440, height: 1200 },
  });

  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);

  await page.mouse.click(745, 607);
  await page.waitForTimeout(2000);

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Wait");
  await page.waitForTimeout(1200);

  const waitOption = frame.getByText("Wait", { exact: true }).first();
  await waitOption.click({ timeout: 15000 });
  await page.waitForTimeout(2000);

  const recurringOption = frame.getByText("Until a recurring window opens", { exact: false }).first();
  await recurringOption.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/wfwr-00-recurring.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_WAIT_RECURRING_ERROR", err);
  process.exit(1);
});
