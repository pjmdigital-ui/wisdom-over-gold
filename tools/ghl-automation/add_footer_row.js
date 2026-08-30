// Adds a new 1-column row AFTER the 2-column order section (so it's
// the very last thing on the page) and drops a Custom Code element
// into it containing the footer, then types the footer content
// (fresh/empty editor, so plain keyboard typing works fine — see
// README for why that's NOT true of populated editors).
//
// Uses the Layers panel's own search box to find the new "Custom Code"
// element by name instead of expanding the tree level by level — the
// tree's expand/collapse state is not reliably predictable (GHL seems
// to auto-expand to reveal a just-added element sometimes), so a flat
// search result is much more robust than counting expand-arrow clicks.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const FOOTER_CONTENT = fs.readFileSync(path.join(__dirname, "footer-content.html"), "utf8");

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
  const secureText = frame.locator("text=/100% Secure & Safe Payments/i").first();
  const secureBox = await secureText.boundingBox({ timeout: 15000 }).catch(() => null);
  if (!secureBox) {
    console.error("SAFETY ABORT: could not find bottom of order form (not on Sales page?)");
    await page.screenshot({ path: "screenshots/afr-abort.png", fullPage: false });
    await context.close();
    process.exit(1);
  }
  await page.mouse.wheel(0, secureBox.y - 900);
  await page.waitForTimeout(1500);

  await page.mouse.click(24, 72); // Add Elements
  await page.waitForTimeout(1500);

  // drag "1 Column" row preset to the very bottom of the page content
  await page.mouse.move(236, 310);
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(500, 900, { steps: 10 });
  await page.waitForTimeout(300);
  await page.mouse.move(900, 1600, { steps: 10 });
  await page.waitForTimeout(300);
  await page.mouse.move(950, 1850, { steps: 10 });
  await page.waitForTimeout(500);
  await page.mouse.move(950, 1856, { steps: 5 });
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.waitForTimeout(1500);

  // select the new row's column by clicking its own "+" (selects + scopes
  // Quick Add in one action — proven reliable earlier in this project)
  await page.mouse.move(700, 900);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/afr-05-scrolled.png", fullPage: false });

  await page.mouse.click(719, 1858); // the new empty row's "+" placeholder
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/afr-06-plus-clicked.png", fullPage: false });

  await page.mouse.click(24, 72); // open Quick Add, scoped to the now-selected column
  await page.waitForTimeout(1500);
  await page.mouse.click(390, 226); // search box in Quick Add
  await page.keyboard.type("code");
  await page.waitForTimeout(1200);
  await page.mouse.click(248, 362); // "Code" (filtered, single result)
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/afr-07-code-added.png", fullPage: false });

  // now use Layers SEARCH to find our new "Custom Code" element by name,
  // rather than expanding the tree
  await page.mouse.click(55, 72); // Layers
  await page.waitForTimeout(1000);
  await page.mouse.click(225, 226); // search field
  await page.keyboard.type("Custom Code");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/afr-08-layers-search.png", fullPage: false });

  const codeMatches = frame.getByText("Custom Code", { exact: true });
  const codeCount = await codeMatches.count();
  console.log("Custom Code matches:", codeCount);
  await codeMatches.nth(codeCount - 1).click({ timeout: 8000 }); // the most recently added one
  await page.waitForTimeout(1000);
  await page.mouse.click(423, 163); // close layers
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/afr-09-code-selected.png", fullPage: false });

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/afr-10-editor-open.png", fullPage: false });

  await page.mouse.click(719, 900);
  await page.waitForTimeout(500);
  await page.mouse.dblclick(719, 900);
  await page.waitForTimeout(500);
  await page.keyboard.press("Home");
  await page.waitForTimeout(300);
  await page.keyboard.type(FOOTER_CONTENT, { delay: 2 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/afr-11-footer-typed.png", fullPage: false });

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.mouse.click(1305, 25); // page-level save
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/afr-12-page-saved.png", fullPage: false });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("ADD_FOOTER_ROW_ERROR", err);
  process.exit(1);
});
