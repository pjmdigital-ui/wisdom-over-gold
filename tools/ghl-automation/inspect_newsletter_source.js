// Visually inspect the current draft content in the page builder's
// Custom Code editor by scrolling through it and screenshotting, since
// the CodeMirror-backed <textarea> does not reliably return its value
// via inputValue().
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PAGE_ID = "TMlZaIRSveTP6JfSqGBa";

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
  await page.waitForTimeout(10000);

  const frameUrls = page.frames().map((f) => f.url());
  const builderFrame = frameUrls.some((u) => u.includes("page-builder.leadconnectorhq.com"))
    ? page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first()
    : page;

  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2500);

  await page.mouse.click(719, 400);
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+Home");
  await page.waitForTimeout(500);

  for (let i = 0; i < 9; i++) {
    await page.screenshot({ path: `screenshots/insp-${i}.png`, fullPage: true });
    await page.mouse.move(719, 400);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(400);
  }

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("INSPECT_ERROR", err);
  process.exit(1);
});
