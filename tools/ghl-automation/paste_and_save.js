const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const CONTENT_FILE = process.argv[2];
const TAG = process.argv[3] || "optin";
const STEP_NAME = process.argv[4]; // exact sidebar step name to select first, if given

if (!CONTENT_FILE) {
  console.error("Usage: node paste_and_save.js <content-file> <tag> [step-name]");
  process.exit(1);
}
const CODE_CONTENT = fs.readFileSync(CONTENT_FILE, "utf8");

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

  if (STEP_NAME) {
    // "Steps" tab first — a top-level funnel tab can share the step's name
    // (e.g. a "Sales" analytics tab vs. a step named "Sales").
    const stepsTab = page.getByText(/^Steps$/i).first();
    await stepsTab.click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // Multiple elements can match this text (a top tab vs. the sidebar
    // step row) — the sidebar row is always further down the page, so
    // pick the match with the largest Y coordinate.
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
    console.log("STEP_NAME_MATCHES=" + count + " bestIdx=" + bestIdx + " bestY=" + bestY);
    await matches.nth(bestIdx).click({ timeout: 15000 });
    await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: `screenshots/p0-${TAG}-step-selected.png`, fullPage: true });

  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();

  // Rebuild the row + Custom Code block (autosave is off, so a fresh
  // session always starts from the last SAVED state).
  const oneColumn = builderFrame.getByText("1 Column", { exact: true }).first();
  await oneColumn.waitFor({ state: "visible", timeout: 15000 });
  await oneColumn.click();
  await page.waitForTimeout(3000);

  await page.mouse.click(719, 238);
  await page.waitForTimeout(2500);

  const searchBox = builderFrame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Code");
  await page.waitForTimeout(1500);

  const codeCardContainer = builderFrame
    .locator('[class*="gui__builder-card"]')
    .filter({ hasText: "Code" })
    .first();
  await codeCardContainer.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);

  // Click the block to open its settings, then Open Code Editor.
  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/p1-${TAG}-editor-open.png`, fullPage: true });

  // Click into the code editor area (dark textbox in the modal) by fixed
  // coordinate — generic contenteditable selectors matched an unrelated
  // "Ask AI" chat box instead of the CodeMirror instance.
  await page.mouse.click(719, 400);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(CODE_CONTENT);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/p2-${TAG}-content-inserted.png`, fullPage: true });

  // Save the code modal.
  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/p3-${TAG}-modal-saved.png`, fullPage: true });

  // Save the page itself (Autosave is off) via the toolbar disk icon.
  const saveIcon = page.locator('button:has(svg)').nth(1);
  await page.getByRole("button").filter({ has: page.locator("svg") }).nth(0);
  // Fall back to fixed coordinate for the save icon in the top toolbar.
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `screenshots/p4-${TAG}-page-saved.png`, fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("PASTE_SAVE_ERROR", err);
  process.exit(1);
});
