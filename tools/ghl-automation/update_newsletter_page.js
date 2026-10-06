// Replace the content of the EXISTING Custom HTML/Javascript block on
// the Weekly Newsletter opt-in page (direct page-builder URL, built via
// newsletter_page_build.js originally -- not nested under a funnel step).
// Usage: node update_newsletter_page.js <content-file.html> [tag]
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PAGE_ID = "TMlZaIRSveTP6JfSqGBa";
const CONTENT_FILE = process.argv[2];
const TAG = process.argv[3] || "update";

if (!CONTENT_FILE) {
  console.error("Usage: node update_newsletter_page.js <content-file> [tag]");
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
    `https://app.gohighlevel.com/location/${LOCATION_ID}/page-builder/${PAGE_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);

  const frameUrls = page.frames().map((f) => f.url());
  console.log("FRAMES=" + JSON.stringify(frameUrls));
  const builderFrame = frameUrls.some((u) => u.includes("page-builder.leadconnectorhq.com"))
    ? page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first()
    : page; // top-level page already IS the builder

  await page.screenshot({ path: `screenshots/unp-${TAG}-00-loaded.png`, fullPage: true });

  const block = builderFrame.getByText("Custom HTML/Javascript", { exact: false }).first();
  await block.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `screenshots/unp-${TAG}-01-block-clicked.png`, fullPage: true });

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(2500);

  // The CodeMirror editor's backing <textarea> is intentionally
  // display:hidden (CodeMirror renders its own editable DOM on top of
  // it) -- wait for it to be attached, not visible.
  const sourceArea = builderFrame.locator("textarea").first();
  await sourceArea.waitFor({ state: "attached", timeout: 15000 });
  await page.screenshot({ path: `screenshots/unp-${TAG}-02-editor-open.png`, fullPage: true });

  await page.mouse.click(719, 400);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(CODE_CONTENT);
  await page.waitForTimeout(1500);

  let textareaVal = "";
  for (let i = 0; i < 20; i++) {
    textareaVal = await sourceArea.inputValue().catch(() => "");
    if (textareaVal.length > CODE_CONTENT.length * 0.9) break;
    await page.waitForTimeout(300);
  }
  console.log(`TEXTAREA_LEN=${textareaVal.length} EXPECTED=${CODE_CONTENT.length}`);
  await page.screenshot({ path: `screenshots/unp-${TAG}-03-content-inserted.png`, fullPage: true });

  const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `screenshots/unp-${TAG}-04-modal-saved.png`, fullPage: true });

  // Save the page itself, then wait for the save to actually complete
  // (not a fixed sleep) -- closing the browser mid-save has silently
  // discarded edits before.
  await page.mouse.click(1305, 25);
  await page.waitForTimeout(1500);
  const topSaveBtn = builderFrame.getByText(/^(Save|Saved|Saving)/).first();
  for (let i = 0; i < 20; i++) {
    const txt = await topSaveBtn.textContent().catch(() => "");
    if (/^Saved\s*$/.test((txt || "").trim())) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `screenshots/unp-${TAG}-05-page-saved.png`, fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("UPDATE_NEWSLETTER_PAGE_ERROR", err);
  process.exit(1);
});
