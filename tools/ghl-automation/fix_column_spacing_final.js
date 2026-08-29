// Fixes excess whitespace above the Sales page order section's left
// column content: the column's "Content Spacing" (justify-content on a
// column-direction flexbox) was "Center", vertically centering the
// short copy block within a much taller column (matched to the order
// form's height) and leaving a large empty gap above it. Sets it to
// "Left" (flex-start — the label is reused from the horizontal-layout
// version of this control, but it's really "top" since Content
// Alignment here is Vertical).
//
// This is a native <select id="dropdown-Content Spacing">, and
// coordinate-clicking its rendered options list does NOT work
// (confirmed: the dropdown opens, but clicking the visible "Left" row
// leaves the value unchanged) — native <select> popups aren't part of
// the normal page rendering layer in headless Chromium. Use
// Playwright's selectOption() directly instead.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
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
  await page.mouse.click(334, 427); // "Sales" row
  await page.waitForTimeout(1500);
  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  const frame = page.frameLocator('iframe[src*="page-builder"]');
  const orderEl = frame.locator('text=/Wait! Add the Audio Narration/i').first();
  const orderBox = await orderEl.boundingBox({ timeout: 15000 }).catch(() => null);
  if (!orderBox) {
    console.error("SAFETY ABORT: not on Sales page");
    await context.close();
    process.exit(1);
  }
  await page.mouse.wheel(0, orderBox.y - 500);
  await page.waitForTimeout(1500);

  // select the left column by clicking its empty canvas background
  await page.mouse.click(430, 300);
  await page.waitForTimeout(1500);

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const select = builderFrame.locator("#dropdown-Content\\ Spacing");
  await select.selectOption("flex-start");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/fcsf-00-after-select.png", fullPage: false });

  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/fcsf-01-saved.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("FIX_COLUMN_SPACING_FINAL_ERROR", err);
  process.exit(1);
});
