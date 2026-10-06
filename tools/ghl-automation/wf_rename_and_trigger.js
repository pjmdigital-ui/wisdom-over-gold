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
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);

  const frameUrls = page.frames().map((f) => f.url());
  console.log("FRAMES=" + JSON.stringify(frameUrls));

  // Rename
  await page.mouse.click(845, 28);
  await page.waitForTimeout(800);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Seek First Weekly Newsletter");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/wfr-00-renamed.png", fullPage: true });

  // Click "Add new trigger"
  await page.mouse.click(745, 687);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/wfr-01-trigger-panel.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("WF_RENAME_TRIGGER_ERROR", err);
  process.exit(1);
});
