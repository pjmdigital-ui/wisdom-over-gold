// One continuous session: Blank Section -> 1 Column row -> Custom Code
// element -> paste content -> save modal -> save page. This builder's
// autosave is off (same as the funnel step builder), so everything has
// to happen in one browser session ending with an explicit page save.
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
  await page.waitForTimeout(14000);

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();

  // Close the "Ask AI" panel if it auto-opened
  const aiCloseBtn = page.locator('text="Ask AI"').first();
  if (await aiCloseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.mouse.click(325, 143);
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: "screenshots/full2-00-start.png", fullPage: true });

  // Is the canvas already empty (first time) or does a section exist?
  const blankSectionBtn = builderFrame.getByText("Blank Section", { exact: true }).first();
  const needsSection = await blankSectionBtn.isVisible({ timeout: 10000 }).catch(() => false);
  console.log("NEEDS_SECTION=" + needsSection);
  if (needsSection) {
    await blankSectionBtn.click({ timeout: 15000 });
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: "screenshots/full2-01-section.png", fullPage: true });

  // Click the section's own "+" to add a row (plain icon, centered in
  // the empty section, full-width canvas since no side panel is open).
  await page.mouse.click(720, 215);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/full2-02-row-picker.png", fullPage: true });

  const oneColumn = builderFrame.getByText("1 Column", { exact: true }).first();
  const oneColVisible = await oneColumn.isVisible({ timeout: 8000 }).catch(() => false);
  console.log("ONE_COLUMN_VISIBLE=" + oneColVisible);
  if (oneColVisible) {
    await oneColumn.click();
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: "screenshots/full2-03-row-added.png", fullPage: true });

  // Open the element-add panel scoped to this new column/row -- the
  // column's own "+ Add" button, found by text (its pixel position
  // shifts depending on whether a settings side-panel is open).
  const columnAddBtn = builderFrame.getByText("Add", { exact: true }).first();
  await columnAddBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/full2-04-add-element-panel.png", fullPage: true });

  const searchBox = builderFrame.getByPlaceholder(/search/i).first();
  const searchVisible = await searchBox.isVisible({ timeout: 5000 }).catch(() => false);
  console.log("SEARCH_VISIBLE=" + searchVisible);
  if (searchVisible) {
    await searchBox.fill("Code");
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: "screenshots/full2-05-code-search.png", fullPage: true });

  const codeCardContainer = builderFrame
    .locator('[class*="gui__builder-card"]')
    .filter({ hasText: "Code" })
    .first();
  await codeCardContainer.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/full2-06-code-added.png", fullPage: true });

  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/full2-07-editor-open.png", fullPage: true });

  await page.mouse.click(719, 400);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(CODE_CONTENT);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/full2-08-content-inserted.png", fullPage: true });

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/full2-09-modal-saved.png", fullPage: true });

  // Save the page itself (disk icon in the top toolbar)
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/full2-10-page-saved.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("NEWSLETTER_PAGE_FULL_ERROR", err);
  process.exit(1);
});
