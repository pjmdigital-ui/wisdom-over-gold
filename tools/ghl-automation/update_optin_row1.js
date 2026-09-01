// Updates Opt-In's Row1 (hero) Custom Code block from
// tools/funnel/optin.html. Uses the direct-canvas-coordinate technique
// (see README "Opt-In page" section) since the whole page fits in an
// unscrolled 900px viewport, making Row1's bar position unambiguous.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const CONTENT = fs.readFileSync(path.join(__dirname, "..", "funnel", "optin.html"), "utf8");

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

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));

  await page.mouse.click(720, 217); // Row1's bar (top, unambiguous)
  await page.waitForTimeout(1000);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);

  const before = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
  console.log("BEFORE: length=" + before.length);

  const result = await realFrame.evaluate((c) => {
    const cm = document.querySelector(".CodeMirror").CodeMirror;
    cm.setValue(c);
    return cm.getValue().length;
  }, CONTENT);
  console.log("SET: new length=" + result + " (expected " + CONTENT.length + ")");

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.mouse.click(1305, 25); // page-level save
  // generous wait -- a 4s wait previously let the browser close mid-save,
  // silently dropping the change (save icon still showed a spinner in the
  // screenshot taken right after)
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "screenshots/uor1-saved.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("UPDATE_OPTIN_ROW1_ERROR", err);
  process.exit(1);
});
