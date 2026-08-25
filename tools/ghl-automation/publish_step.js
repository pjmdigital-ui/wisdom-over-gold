// Click Publish on a funnel step's page builder so draft saves actually
// go live on the connected custom domain (draft saves alone only update
// what you see inside the builder / the raw leadconnectorhq preview URL).
// Usage: node publish_step.js "<Step Name>"
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const STEP_NAME = process.argv[2];

if (!STEP_NAME) {
  console.error("Usage: node publish_step.js <step-name>");
  process.exit(1);
}

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

  const matches = page.getByText(STEP_NAME, { exact: true });
  const count = await matches.count();
  let bestIdx = 0;
  let bestY = -1;
  for (let i = 0; i < count; i++) {
    const box = await matches.nth(i).boundingBox().catch(() => null);
    if (box && box.y > bestY) {
      bestY = box.y;
      bestIdx = i;
    }
  }
  await matches.nth(bestIdx).click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);
  await page.screenshot({ path: `screenshots/pub1-${STEP_NAME.replace(/\s+/g, "")}-before.png`, fullPage: true });

  // Publish lives inside the same cross-origin builder iframe as the rest
  // of the toolbar — coordinate click (matches the visual position
  // confirmed in screenshots), same approach as the page-save icon.
  await page.mouse.click(1381, 25);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `screenshots/pub2-${STEP_NAME.replace(/\s+/g, "")}-after.png`, fullPage: true });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("AFTER_PUBLISH_SNIPPET=" + bodyText.slice(0, 300).replace(/\n/g, " | "));

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("PUBLISH_ERROR", err);
  process.exit(1);
});
