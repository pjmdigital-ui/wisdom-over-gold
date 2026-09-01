// Fixes both Custom Code rows on Opt-In using DIRECT canvas coordinates
// (not Layers search, which has proven unreliable for disambiguating
// multiple Custom Code elements). The whole page fits in a 900px-tall
// viewport without scrolling, so both bars are simultaneously visible
// at fixed, unambiguous positions: Row1 (hero) top bar ~y=217, Row3
// (what's-inside+footer) bottom bar further down.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const ROW1_CONTENT = fs.readFileSync("/tmp/optin_row1_hero_only.html", "utf8");
const ROW3_CONTENT = fs.readFileSync("/tmp/optin_row3_whatsinside_footer.html", "utf8");

async function setCustomCodeAt(page, builderFrame, realFrame, x, y, content, label) {
  await page.mouse.click(x, y);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `screenshots/fbrd-${label}-00-clicked.png`, fullPage: false });

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);

  const before = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
  console.log(`[${label}] BEFORE: length=${before.length}`);

  const result = await realFrame.evaluate((c) => {
    const cm = document.querySelector(".CodeMirror").CodeMirror;
    cm.setValue(c);
    return cm.getValue().length;
  }, content);
  console.log(`[${label}] SET: new length=${result} (expected ${content.length})`);

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/fbrd-${label}-01-modal-saved.png`, fullPage: false });
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
  await page.waitForTimeout(2000);

  const listRow = page.locator('text="Opt-In"').first();
  await listRow.click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  const urlText = await page.locator('text=/wisdomovergold\\.com\\/seek-first-free-sample/i').first().isVisible().catch(() => false);
  console.log("Right panel shows Opt-In URL:", urlText);
  if (!urlText) {
    console.error("SAFETY ABORT: wrong step in right panel");
    await context.close();
    process.exit(1);
  }

  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);
  await page.screenshot({ path: "screenshots/fbrd-full-layout.png", fullPage: true });

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));

  // Row1 (hero) -- top bar, unambiguous
  await setCustomCodeAt(page, builderFrame, realFrame, 720, 217, ROW1_CONTENT, "row1");

  // close any lingering modal state fully before moving to Row3
  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);

  // Row3 (what's-inside+footer) -- bottom bar, in the second Section
  await setCustomCodeAt(page, builderFrame, realFrame, 720, 750, ROW3_CONTENT, "row3");

  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/fbrd-final-saved.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("FIX_BOTH_ROWS_DIRECT_ERROR", err);
  process.exit(1);
});
