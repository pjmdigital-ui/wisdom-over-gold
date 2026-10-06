// Click "Create from blank" on a funnel step's Overview tab to initialize
// an empty page (needed once before paste_and_save.js can Edit it).
// Usage: node create_blank_page.js <step-id>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const STEP_ID = process.argv[2];

if (!STEP_ID) {
  console.error("Usage: node create_blank_page.js <step-id>");
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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/funnels-websites/funnels/${FUNNEL_ID}/steps/${STEP_ID}/overview`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "screenshots/blank-00-before.png" });

  const createBlankBtn = page.getByRole("button", { name: /create from blank/i }).first();
  await createBlankBtn.click({ timeout: 15000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "screenshots/blank-01-after.png", fullPage: true });

  console.log("URL_AFTER=" + page.url());
  await context.close();
})().catch((err) => {
  console.error("CREATE_BLANK_ERROR", err);
  process.exit(1);
});
