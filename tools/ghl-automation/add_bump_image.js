// Adds the order-bump product image to the existing "Wait! Add the Audio
// Narration" bump on the Sales page's order-form element (Order Bump
// Options > edit the existing bump > Image URL field).
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const BUMP_IMAGE_URL = "https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a932cac0914f112150be70d.png";

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
  await page.mouse.click(334, 427); // "Sales" row, fixed coordinate
  await page.waitForTimeout(1500);
  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  const frame = page.frameLocator('iframe[src*="page-builder"]');
  const orderEl = frame.locator('text=/Wait! Add the Audio Narration/i').first();
  const orderBox = await orderEl.boundingBox({ timeout: 15000 }).catch(() => null);
  if (!orderBox) {
    console.error("SAFETY ABORT: not on Sales page, or order-form row not found");
    await page.screenshot({ path: "screenshots/abi-abort.png", fullPage: false });
    await context.close();
    process.exit(1);
  }
  await page.mouse.wheel(0, orderBox.y - 500);
  await page.waitForTimeout(1500);

  // click the order form's headline to select the element and open its settings
  const headline = frame.locator("text=/^Shipping & Your Info$/").first();
  await headline.click({ timeout: 10000, force: true });
  await page.waitForTimeout(1500);

  // scroll the settings panel down to "Order Bump Options"
  await page.mouse.move(1278, 900);
  await page.mouse.wheel(0, 3500);
  await page.waitForTimeout(1500);
  await page.mouse.click(1372, 1314); // edit (pencil) icon on the existing bump
  await page.waitForTimeout(1500);

  await page.mouse.click(1247, 1735); // Image URL field
  await page.keyboard.press("Control+A");
  await page.keyboard.type(BUMP_IMAGE_URL);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/abi-04-url-filled.png", fullPage: false });

  await page.mouse.click(1351, 1817); // "Update" button
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/abi-05-updated.png", fullPage: false });

  // save the page itself (autosave is off)
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/abi-06-page-saved.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("ADD_BUMP_IMAGE_ERROR", err);
  process.exit(1);
});
