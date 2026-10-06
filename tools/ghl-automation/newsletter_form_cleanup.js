// Delete Last Name, Phone, and both SMS consent checkboxes from the new
// newsletter signup form, leaving First Name + Email + Submit.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "S6djGWBap9TqIqWjEFBi";

async function deleteByLabel(page, frame, label, tag) {
  const el = frame.getByText(label, { exact: true }).first();
  await el.click({ timeout: 15000 });
  await page.waitForTimeout(700);
  const box = await el.boundingBox();
  // trash icon sits near the top-right of the selected block, same row
  // as the label, roughly 50px right of the gear icon which is right at
  // the block's right edge -- click near (block right edge area).
  await page.screenshot({ path: `screenshots/cu-${tag}-selected.png`, fullPage: true });
  const trashBtn = frame.locator('button:has(svg)').filter({ hasText: "" });
  // Use a coordinate relative to the label's box: trash sits ~ (rightEdge-15, label.y)
  // We computed from the Last Name probe: label at x=338,y=230 -> trash at ~1091,230
  // offset from label: trash.x - label.x = 753, trash.y - label.y = -1 (same row)
  const trashX = box.x + 753;
  const trashY = box.y + 0;
  await page.mouse.click(trashX, trashY);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `screenshots/cu-${tag}-after-delete.png`, fullPage: true });
}

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

  // Delete Last Name
  await deleteByLabel(page, frame, "Last Name", "lastname");
  await page.waitForTimeout(1000);

  // Delete Phone (its label text is "Phone *" -- match loosely)
  const phoneLabel = frame.getByText("Phone", { exact: false }).first();
  await phoneLabel.click({ timeout: 15000 });
  await page.waitForTimeout(700);
  let box = await phoneLabel.boundingBox();
  await page.screenshot({ path: "screenshots/cu-phone-selected.png", fullPage: true });
  await page.mouse.click(box.x + 753, box.y);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/cu-phone-after-delete.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("NEWSLETTER_FORM_CLEANUP_ERROR", err);
  process.exit(1);
});
