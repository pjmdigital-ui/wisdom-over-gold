// One continuous session: delete Last Name, Phone, and the combined SMS
// consent block, then Save. Doing all deletes + Save in one browser
// session matters because this form builder has autosave off too --
// a fresh page load reverts to the last SAVED state.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "S6djGWBap9TqIqWjEFBi";

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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/form-builder-v2/${FORM_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  await page.mouse.click(341, 118); // close element panel if auto-open
  await page.waitForTimeout(1000);

  const frame = page.frameLocator('iframe[src*="leadgen-apps-form-survey-builder"]').first();

  // --- Delete Last Name ---
  let el = frame.getByText("Last Name", { exact: true }).first();
  await el.click({ timeout: 15000 });
  await page.waitForTimeout(600);
  let box = await el.boundingBox();
  await page.mouse.click(box.x + 753, box.y);
  await page.waitForTimeout(1000);
  console.log("DELETED_LAST_NAME");

  // --- Delete Phone ---
  el = frame.getByText("Phone", { exact: false }).first();
  await el.click({ timeout: 15000 });
  await page.waitForTimeout(600);
  box = await el.boundingBox();
  await page.mouse.click(box.x + 753, box.y);
  await page.waitForTimeout(1000);
  console.log("DELETED_PHONE");

  // --- Delete combined SMS consent block (both checkboxes) ---
  el = frame.getByText(/By checking this box, I consent to receive non-marketing/i).first();
  await el.click({ timeout: 15000 });
  await page.waitForTimeout(600);
  box = await el.boundingBox();
  await page.screenshot({ path: "screenshots/full-before-consent-delete.png", fullPage: true });
  // the whole merged block's trash icon sits at the block's own top-right,
  // not relative to this paragraph's box -- use the outer block's bounding
  // box via a stable ancestor instead: the toolbar/gear+trash row sits
  // ~38px above this paragraph's own toolbar row, at a fixed x far right.
  await page.mouse.click(1091, box.y - 58);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/full-after-consent-delete.png", fullPage: true });
  console.log("DELETED_CONSENT_ATTEMPT");

  // --- Save ---
  await page.mouse.click(1381, 25);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/full-after-save.png", fullPage: true });
  console.log("SAVE_CLICKED");

  await context.close();
})().catch((err) => {
  console.error("FULL_BUILD_ERROR", err);
  process.exit(1);
});
