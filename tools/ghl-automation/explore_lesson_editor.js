const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PRODUCT_ID = "06474a72-c950-49c8-ab9e-75f499d69b8d";

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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/course-creator-studio?view=manager&sub_view=outline&product_id=${PRODUCT_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(5000);

  await page.getByText(/^Lesson 1: The What$/).first().click({ timeout: 10000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/mem16-lesson-editor.png", fullPage: true });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 2500).replace(/\n/g, " | "));
  console.log("URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("LESSON_EDITOR_ERROR", err);
  process.exit(1);
});
