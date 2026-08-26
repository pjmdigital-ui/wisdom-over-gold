const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PRODUCT_ID = "06474a72-c950-49c8-ab9e-75f499d69b8d";

// Delete bottom-to-top so remaining rows above don't shift position mid-run.
const LESSONS_TO_DELETE = [
  "What's Next?",
  "Lesson 3: The How",
  "Lesson 2: The Why",
  "Lesson 1: The What",
  "Welcome Aboard!",
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

  for (const name of LESSONS_TO_DELETE) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const row = page.getByText(new RegExp(`^${escaped}$`)).first();
    const visible = await row.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      console.log(`SKIP (not found): ${name}`);
      continue;
    }
    await row.hover({ timeout: 8000 });
    await page.waitForTimeout(400);
    const box = await row.boundingBox();
    await page.mouse.click(1220, box.y + box.height / 2);
    await page.waitForTimeout(1000);
    const confirmBtn = page.getByRole("button", { name: /yes, delete/i }).first();
    await confirmBtn.click({ timeout: 8000 });
    await page.waitForTimeout(1500);
    console.log(`DELETED: ${name}`);
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/mem25-after-deletes.png", fullPage: true });
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 1200).replace(/\n/g, " | "));

  await context.close();
})().catch((err) => {
  console.error("DELETE_LESSONS_ERROR", err);
  process.exit(1);
});
