const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PRODUCT_ID = "06474a72-c950-49c8-ab9e-75f499d69b8d";

const TITLE = "January — God First";
const DESC = "Pursuit I: Piety. Seeking God first — ordering your life around Him instead of yourself.";

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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/course-creator-studio?view=manager&sub_view=outline&product_id=${PRODUCT_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(16000);

  const skipTour = page.getByText(/skip tour/i).first();
  if (await skipTour.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipTour.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
  }

  const moduleRow = page.getByText(/^Course Contents$/).first();
  await moduleRow.hover({ timeout: 8000 });
  await page.waitForTimeout(500);
  const box = await moduleRow.boundingBox();
  await page.mouse.click(1047, box.y + box.height / 2);
  await page.waitForTimeout(1200);

  const input = page.locator('input[maxlength="255"]').first();
  await input.fill(TITLE);
  const descArea = page.locator('textarea').first();
  await descArea.fill(DESC);
  await page.waitForTimeout(400);
  await page.screenshot({ path: "screenshots/mem26-module-renamed-filled.png", fullPage: true });

  await page.getByRole("button", { name: /save changes/i }).first().click({ timeout: 8000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/mem27-module-renamed-saved.png", fullPage: true });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 1200).replace(/\n/g, " | "));

  await context.close();
})().catch((err) => {
  console.error("RENAME_FIRST_MODULE_ERROR", err);
  process.exit(1);
});
