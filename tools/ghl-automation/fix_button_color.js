const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FORM_ID = "oIxrLZEdl80kXTwfP0hW";

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
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/form-builder-v2/${FORM_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(16000);

  await page.mouse.click(1400, 75);
  await page.waitForTimeout(1500);
  await page.mouse.click(1187, 217);
  await page.waitForTimeout(800);
  await page.mouse.click(1187, 262);
  await page.waitForTimeout(800);

  // find the checkbox precisely via DOM instead of guessing coordinates
  const iframeEl = await page.$('iframe[name="form-builder-app"]');
  const frame = page.frames().find(f => f.url().includes("leadgen-apps-form-survey-builder"));
  const iframeBox = await iframeEl.boundingBox();

  const checkboxPos = await frame.evaluate(() => {
    const cb = document.querySelector('.n-checkbox');
    if (!cb) return null;
    const r = cb.getBoundingClientRect();
    return { x: r.x + 12, y: r.y + r.height / 2 }; // left edge (the actual box, not the label text)
  });
  console.log("Checkbox position:", JSON.stringify(checkboxPos));

  if (checkboxPos) {
    await page.mouse.click(iframeBox.x + checkboxPos.x, iframeBox.y + checkboxPos.y);
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: "screenshots/fbc-00-after-checkbox.png", fullPage: true });

  await page.mouse.click(1381, 25); // page-level Save
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "screenshots/fbc-01-saved.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("FIX_BUTTON_COLOR_ERROR", err);
  process.exit(1);
});
