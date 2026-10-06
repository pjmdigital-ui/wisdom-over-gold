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

  for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
    const dayBox = frame.getByText(day, { exact: true }).first();
    await dayBox.click({ timeout: 10000, force: true });
    await page.waitForTimeout(300);
  }
  const sunBox = frame.getByText("Sun", { exact: true }).first();
  await sunBox.click({ timeout: 10000, force: true });
  await page.waitForTimeout(500);

  await page.mouse.click(1158, 738);
  await page.waitForTimeout(1000);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("08:00:00 PM");
  await page.waitForTimeout(800);

  const okBtn = frame.getByText("OK", { exact: true }).first();
  await okBtn.click({ timeout: 10000, force: true });
  await page.waitForTimeout(800);

  // Rename the action now that the time picker is closed (coordinate is
  // reliable here since this screen's layout is fixed once the picker closes)
  await page.mouse.click(1158, 323);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Wait Until Next Sunday 8PM");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/wfwf-00-renamed.png", fullPage: true });

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/wfwf-01-saved.png", fullPage: true });
  console.log("WAIT_ACTION_SAVED");

  await context.close();
})().catch((err) => {
  console.error("WF_WAIT_FINAL_ERROR", err);
  process.exit(1);
});
