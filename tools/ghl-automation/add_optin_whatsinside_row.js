// Adds a new 1-column row AFTER the Form row on the Opt-In page,
// containing the "What's Inside the First Week" + footer content that
// was trimmed out of the hero block by fix_optin_row1.js. This completes
// the fix: hero pitch -> real Form -> What's Inside + footer, instead of
// the Form trailing after everything.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const CONTENT = fs.readFileSync("/tmp/optin_row3_whatsinside_footer.html", "utf8");

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

  const frame = page.frameLocator('iframe[src*="page-builder"]');
  await page.screenshot({ path: "screenshots/aowi-01-scrolled.png", fullPage: false });

  await page.mouse.click(24, 72); // Add Elements
  await page.waitForTimeout(1500);

  // drag "1 Column" row preset to just below the existing Section (whole
  // page fits in view already -- no scrolling needed)
  await page.mouse.move(236, 310);
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(500, 500, { steps: 10 });
  await page.waitForTimeout(300);
  await page.mouse.move(900, 670, { steps: 10 });
  await page.waitForTimeout(300);
  await page.mouse.move(950, 690, { steps: 10 });
  await page.waitForTimeout(500);
  await page.mouse.move(950, 696, { steps: 5 });
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/aowi-05-dropped.png", fullPage: true });

  await page.mouse.click(719, 772); // the new empty row's "+" placeholder
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/aowi-06-plus-clicked.png", fullPage: false });

  await page.mouse.click(24, 72); // open Quick Add, scoped to the now-selected column
  await page.waitForTimeout(1500);
  await page.mouse.click(390, 226); // search box in Quick Add
  await page.keyboard.type("code");
  await page.waitForTimeout(1200);
  await page.mouse.click(248, 362); // "Code" (filtered, single result)
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/aowi-07-code-added.png", fullPage: false });

  await page.mouse.click(55, 72); // Layers
  await page.waitForTimeout(1000);
  await page.mouse.click(225, 226); // search field
  await page.keyboard.type("Custom Code");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/aowi-08-layers-search.png", fullPage: false });

  const codeMatches = frame.getByText("Custom Code", { exact: true });
  const codeCount = await codeMatches.count();
  console.log("Custom Code matches:", codeCount);
  await codeMatches.nth(codeCount - 1).click({ timeout: 8000 }); // the most recently added one
  await page.waitForTimeout(1000);
  await page.mouse.click(423, 163); // close layers
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/aowi-09-code-selected.png", fullPage: false });

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/aowi-10-editor-open.png", fullPage: false });

  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));
  const result = await realFrame.evaluate((content) => {
    const cm = document.querySelector(".CodeMirror").CodeMirror;
    cm.setValue(content);
    return cm.getValue().length;
  }, CONTENT);
  console.log("SET content, new length in editor=" + result + " (source=" + CONTENT.length + ")");

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/aowi-12-page-saved.png", fullPage: false });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("ADD_OPTIN_WHATSINSIDE_ROW_ERROR", err);
  process.exit(1);
});
