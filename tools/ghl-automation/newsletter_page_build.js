// Build the Weekly Newsletter opt-in page's content: add a 1-column row
// + Custom Code block, paste the HTML fragment, save the code modal,
// then save the page. Adapted from paste_and_save.js, but this page was
// opened via "Create from blank" which lands directly on the page-builder
// URL (not nested in the funnel-steps iframe), so we check for frames
// first instead of assuming the page-builder.leadconnectorhq.com iframe.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PAGE_ID = process.argv[2];
const CONTENT_FILE = process.argv[3];
const TAG = process.argv[4] || "newsletter";

if (!PAGE_ID || !CONTENT_FILE) {
  console.error("Usage: node newsletter_page_build.js <page-id> <content-file> [tag]");
  process.exit(1);
}
const CODE_CONTENT = fs.readFileSync(CONTENT_FILE, "utf8");

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
    `https://app.gohighlevel.com/location/${LOCATION_ID}/page-builder/${PAGE_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(8000);

  const frameUrls = page.frames().map((f) => f.url());
  console.log("FRAMES=" + JSON.stringify(frameUrls));
  await page.screenshot({ path: `screenshots/np0-${TAG}-loaded.png`, fullPage: true });

  const builderFrame = frameUrls.some((u) => u.includes("page-builder.leadconnectorhq.com"))
    ? page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first()
    : page; // top-level page already IS the builder

  const addBtn = builderFrame.locator('[class*="icon"]').first();
  // Click the canvas "+" to add a row -- the empty-canvas placeholder.
  const plusAdd = builderFrame.getByText(/add row|click here to add|^\+$/i).first();
  const plusVisible = await plusAdd.isVisible({ timeout: 8000 }).catch(() => false);
  console.log("PLUS_VISIBLE=" + plusVisible);
  if (plusVisible) {
    await plusAdd.click();
  } else {
    // fallback: the top toolbar "+" (Add Element) icon, first icon in the left toolbar
    await page.mouse.click(24, 73);
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/np1-${TAG}-add-clicked.png`, fullPage: true });

  const oneColumn = builderFrame.getByText("1 Column", { exact: true }).first();
  const oneColVisible = await oneColumn.isVisible({ timeout: 8000 }).catch(() => false);
  console.log("ONE_COLUMN_VISIBLE=" + oneColVisible);
  if (oneColVisible) {
    await oneColumn.click();
    await page.waitForTimeout(3000);
  }
  await page.screenshot({ path: `screenshots/np2-${TAG}-row-added.png`, fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("NEWSLETTER_PAGE_BUILD_ERROR", err);
  process.exit(1);
});
