const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PRODUCT_ID = "06474a72-c950-49c8-ab9e-75f499d69b8d";

const MODULES = [
  "February — Sacrifice and Struggle",
  "March — Faith Under Doubt",
  "April — Integrity and Character",
  "May — Patience and Anger Management",
  "June — Friendship and Brotherhood",
  "July — Work and Vocation",
  "August — Personal Finance and Stewardship",
  "September — Leading the Household",
  "October — Marriage and Love",
  "November — Fatherhood Fundamentals",
  "December — Hope and Presence",
];

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

  for (const name of MODULES) {
    const topAddContent = page.getByRole("button", { name: /\+ ?add content/i }).first();
    await topAddContent.click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.getByText(/^Add Module$/).first().click({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.getByPlaceholder("Enter module name").fill(name);
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /^create module$/i }).first().click({ timeout: 8000 });
    await page.waitForTimeout(2000);
    console.log(`CREATED: ${name}`);
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/mem30-all-modules-added.png", fullPage: true });
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 1200).replace(/\n/g, " | "));

  await context.close();
})().catch((err) => {
  console.error("ADD_REMAINING_MODULES_ERROR", err);
  process.exit(1);
});
