// Changes a funnel step's live URL slug via its Publishing tab
// (Step name / Step url fields, "Update step" button) — this lives one
// level up from the page builder, in the funnel step's own settings.
// Usage: node change_step_url.js "<Step Name>" <new-path-slug>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const STEP_NAME = process.argv[2];
const NEW_SLUG = process.argv[3];

if (!STEP_NAME || !NEW_SLUG) {
  console.error("Usage: node change_step_url.js <step-name> <new-path-slug>");
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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/funnels-websites/funnels/${FUNNEL_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  const stepsTab = page.getByText(/^Steps$/i).first();
  await stepsTab.click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const matches = page.getByText(STEP_NAME, { exact: true });
  const count = await matches.count();
  let bestIdx = 0, bestY = -1;
  for (let i = 0; i < count; i++) {
    const box = await matches.nth(i).boundingBox().catch(() => null);
    if (box && box.y > bestY) { bestY = box.y; bestIdx = i; }
  }
  await matches.nth(bestIdx).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/csu-00-step-selected.png`, fullPage: true });

  // find the "Publishing" tab within the step detail panel
  const publishingTab = page.getByText(/^Publishing$/i).first();
  await publishingTab.click({ timeout: 10000 });
  await page.waitForTimeout(1500);

  const urlField = page.locator('input[value^="/"]').first();
  const currentValue = await urlField.inputValue();
  console.log("CURRENT_STEP_URL=" + currentValue);

  await urlField.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("/" + NEW_SLUG.replace(/^\//, ""));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `screenshots/csu-02-url-filled.png`, fullPage: true });

  const updateBtn = page.getByRole("button", { name: /^update step$/i }).first();
  await updateBtn.click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `screenshots/csu-03-updated.png`, fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("CHANGE_STEP_URL_ERROR", err);
  process.exit(1);
});
