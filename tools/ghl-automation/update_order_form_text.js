// Sales page order form: changes the "Headline" text and disables coupon
// codes. Both are settings on the "One Step Order" element itself
// (General tab, Form Options / Coupon Options sections) -- not custom code.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const NEW_HEADLINE = "Enter Your Info for Immediate Access";

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
    console.error("SAFETY ABORT: order-form row not found");
    await page.screenshot({ path: "screenshots/uof-abort.png", fullPage: false });
    await context.close();
    process.exit(1);
  }
  await page.mouse.wheel(0, orderBox.y - 700);
  await page.waitForTimeout(1500);

  const heading = frame.locator('text=/Shipping & Your Info/i').first();
  const hbox = await heading.boundingBox({ timeout: 8000 });
  await page.mouse.click(hbox.x + hbox.width / 2, hbox.y + hbox.height / 2);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/uof-01-selected.png", fullPage: false });

  // "Headline" field -- coordinate click (locator-based lookups have
  // repeatedly timed out against this settings panel's fields; see README)
  await page.mouse.click(1279, 891);
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(NEW_HEADLINE);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/uof-02-headline-set.png", fullPage: false });

  // scroll the settings panel down to the Coupon Options toggle
  await page.mouse.move(1278, 1000);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/uof-03-scrolled-to-coupon.png", fullPage: false });

  await page.mouse.click(1387, 1809); // "Enable Coupon Codes" toggle
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/uof-04-coupon-toggled.png", fullPage: false });

  // save the page
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/uof-05-saved.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("UPDATE_ORDER_FORM_TEXT_ERROR", err);
  process.exit(1);
});
