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

  await page.mouse.click(745, 468);
  await page.waitForTimeout(2000);

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Add contact tag");
  await page.waitForTimeout(1200);

  const addTagOption = frame.getByText("Add contact tag", { exact: true }).first();
  await addTagOption.click({ timeout: 15000 });
  await page.waitForTimeout(2000);

  const tagsField = frame.getByText("Select tags", { exact: true }).first();
  await tagsField.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1000);
  await page.keyboard.type("newsletter-subscriber");
  await page.waitForTimeout(1200);

  const addNewTagOption = frame.getByText(/Add New tag/i).first();
  await addNewTagOption.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1000);

  // Close dropdown, then save
  await page.mouse.click(1150, 700);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/wfat4-00-tag-added.png", fullPage: true });

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/wfat4-01-saved.png", fullPage: true });
  console.log("TAG_ACTION_SAVED");

  await context.close();
})().catch((err) => {
  console.error("WF_ADD_TAG4_ERROR", err);
  process.exit(1);
});
