// Add one funnel step and click Edit to open its page builder.
// Usage: node build_step.js "<Step Name>" "<path-slug>"
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";

const STEP_NAME = process.argv[2];
const STEP_PATH = process.argv[3];
if (!STEP_NAME || !STEP_PATH) {
  console.error("Usage: node build_step.js <name> <path>");
  process.exit(1);
}

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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/funnels-websites/funnels/${FUNNEL_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(8000);

  const beforeCount = await page.locator(".hr-button", { hasText: "Add new step or import" }).count();
  console.log("PAGE_READY=" + beforeCount);

  const addStepBtn = page.getByRole("button", { name: /add new step or import/i }).first();
  await addStepBtn.click();
  await page.waitForTimeout(2000);

  await page.getByPlaceholder("Name for page").first().fill(STEP_NAME);
  await page.getByPlaceholder("Path").first().fill(STEP_PATH);
  await page.screenshot({ path: `screenshots/step-${STEP_PATH}-01-filled.png` });

  const createStepBtn = page.getByRole("button", { name: /create funnel step/i }).first();
  await createStepBtn.click();
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `screenshots/step-${STEP_PATH}-02-created.png`, fullPage: true });

  const stepRows = page.locator(".funnel-step-item, [class*='step-item'], [class*='StepItem']");
  console.log("STEP_ROWS_GENERIC=" + (await stepRows.count()));

  console.log("URL_AFTER_CREATE=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("BUILD_STEP_ERROR", err);
  process.exit(1);
});
