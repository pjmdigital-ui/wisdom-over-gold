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
    viewport: { width: 1440, height: 900 },
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
  const matches = page.getByText("Sales", { exact: true });
  const count = await matches.count();
  let bestIdx = 0, bestY = -1;
  for (let i = 0; i < count; i++) {
    const box = await matches.nth(i).boundingBox().catch(() => null);
    if (box && box.y > bestY) { bestY = box.y; bestIdx = i; }
  }
  await matches.nth(bestIdx).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  await page.mouse.move(719, 260);
  await page.waitForTimeout(600);
  await page.mouse.click(719, 264);
  await page.waitForTimeout(2000);
  await page.mouse.click(390, 226);
  await page.keyboard.type("order");
  await page.waitForTimeout(1200);
  await page.mouse.click(388, 356);
  await page.waitForTimeout(3000);

  await page.mouse.click(207, 273);
  await page.waitForTimeout(2000);
  await page.mouse.move(1278, 600);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(300);
  }
  await page.mouse.click(1386, 379);
  await page.waitForTimeout(1200);
  await page.mouse.click(1278, 444);
  await page.waitForTimeout(1500);
  await page.mouse.click(1278, 534);
  await page.waitForTimeout(1200);
  await page.mouse.click(1277, 574);
  await page.waitForTimeout(1500);
  await page.mouse.click(1278, 610);
  await page.keyboard.type("Wait! Add the Audio Narration");
  await page.waitForTimeout(300);
  await page.mouse.click(1278, 656);
  await page.keyboard.type("Every Day, Narrated in Paul's Own Voice — Just $9");
  await page.waitForTimeout(300);
  await page.mouse.click(1278, 720);
  await page.keyboard.type("Listen to each day's devotion instead of just reading it. Perfect for your commute. One-time add-on, delivered with your book.");
  await page.waitForTimeout(300);

  // Save the bump-product modal (button is at fixed position near bottom of panel)
  await page.mouse.click(1350, 887);
  await page.waitForTimeout(2000);

  // Close the settings panel, then save the page itself (autosave is off)
  await page.mouse.click(1412, 163);
  await page.waitForTimeout(1000);
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/bof-07-page-saved.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("BUILD_ORDER_FORM_ERROR", err);
  process.exit(1);
});
