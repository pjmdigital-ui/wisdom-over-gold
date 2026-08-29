// Replaces the native "Image" + "Bullet List" elements in the Sales
// page's two-column order section (left column) with a single Custom
// HTML/Javascript element styled to match the rest of the page's design
// system (Spectral/Source Serif 4 fonts, paper/gold/ink palette, gold
// checkmark bullets) instead of GHL's default native-widget styling.
// Content comes from left-col-content.html (kept alongside this script
// so the HTML/CSS is easy to review and edit without touching the
// automation code).
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const CODE_CONTENT = fs.readFileSync(path.join(__dirname, "left-col-content.html"), "utf8");

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
    await page.screenshot({ path: "screenshots/rlcf-abort.png", fullPage: false });
    await context.close();
    process.exit(1);
  }
  await page.mouse.wheel(0, orderBox.y - 500);
  await page.waitForTimeout(1500);

  // delete the Bullet List element (there is exactly one on this page)
  await page.mouse.click(55, 72); // Layers
  await page.waitForTimeout(1000);
  await page.mouse.click(225, 226); // search field
  await page.keyboard.type("Bullet List");
  await page.waitForTimeout(1000);
  await page.mouse.click(417, 326); // "..." on the single match
  await page.waitForTimeout(800);
  await page.mouse.click(397, 248); // "Delete" (element menu: Hide/Edit/Clone/Delete/Save Element)
  await page.waitForTimeout(1000);
  await page.mouse.click(933, 1010); // confirm dialog
  await page.waitForTimeout(1500);

  // delete the Image element (there is exactly one on this page)
  await page.mouse.click(413, 226); // clear search field
  await page.waitForTimeout(500);
  await page.mouse.click(225, 226);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Image");
  await page.waitForTimeout(1000);
  await page.mouse.click(417, 326); // "..." on the single match
  await page.waitForTimeout(800);
  await page.mouse.click(397, 248); // "Delete"
  await page.waitForTimeout(1000);
  await page.mouse.click(933, 1010); // confirm dialog
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/rlcf-00-both-deleted.png", fullPage: false });

  // select the now-empty left column and add a Custom HTML/Javascript element
  await page.mouse.click(423, 163); // close Layers panel
  await page.waitForTimeout(800);
  await page.mouse.click(300, 300); // click inside the empty left column area to select it
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/rlcf-01-left-col-selected.png", fullPage: false });

  await page.mouse.click(24, 72); // Quick Add, scoped to the selected column
  await page.waitForTimeout(1500);
  await page.mouse.click(390, 226); // search box
  await page.keyboard.type("code");
  await page.waitForTimeout(1200);
  await page.mouse.click(248, 362); // "Code" element (Custom category)
  await page.waitForTimeout(2000);

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/rlcf-04-editor-open.png", fullPage: false });

  await page.mouse.click(719, 900); // inside the code editor textarea (viewport is 1900 tall, modal is vertically centered)
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(CODE_CONTENT);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/rlcf-05-content-inserted.png", fullPage: false });

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/rlcf-06-modal-saved.png", fullPage: false });

  // save the page itself (autosave is off)
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/rlcf-07-page-saved.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("RESTYLE_LEFT_COL_FULL_ERROR", err);
  process.exit(1);
});
