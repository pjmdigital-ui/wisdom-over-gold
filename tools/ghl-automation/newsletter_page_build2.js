const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PAGE_ID = "TMlZaIRSveTP6JfSqGBa";
const CONTENT_FILE = process.argv[2];
const CODE_CONTENT = fs.readFileSync(CONTENT_FILE, "utf8");

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
    `https://app.gohighlevel.com/location/${LOCATION_ID}/page-builder/${PAGE_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();

  // Close the "Ask AI" panel if it auto-opened
  await page.mouse.click(325, 168).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/np3-ai-closed.png", fullPage: true });

  // Click "Blank Section" to start the canvas
  const blankSectionBtn = builderFrame.getByText("Blank Section", { exact: true }).first();
  await blankSectionBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/np4-blank-section.png", fullPage: true });

  // Choose a 1-column layout
  const oneColumn = builderFrame.getByText("1 Column", { exact: true }).first();
  const oneColVisible = await oneColumn.isVisible({ timeout: 8000 }).catch(() => false);
  console.log("ONE_COLUMN_VISIBLE=" + oneColVisible);
  if (oneColVisible) {
    await oneColumn.click();
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: "screenshots/np5-row-chosen.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("NEWSLETTER_PAGE_BUILD2_ERROR", err);
  process.exit(1);
});
