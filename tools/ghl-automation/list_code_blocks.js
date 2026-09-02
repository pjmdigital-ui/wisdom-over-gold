// Read-only diagnostic: for a given funnel step, find every
// "Custom HTML/Javascript" block on the canvas (in top-to-bottom order)
// and print a short preview of each one's content, without writing
// anything. Use this before targeting a specific block index with
// get_set_nth_code_block.js.
// Usage: node list_code_blocks.js "<Step Name>"
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const STEP_NAME = process.argv[2];

if (!STEP_NAME) {
  console.error('Usage: node list_code_blocks.js "<Step Name>"');
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

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));

  const blocks = builderFrame.getByText("Custom HTML/Javascript", { exact: false });
  const blockCount = await blocks.count();
  console.log("BLOCK_COUNT=" + blockCount);

  // Collect each block's own canvas Y position (top-to-bottom order) first
  const positions = [];
  for (let i = 0; i < blockCount; i++) {
    const box = await blocks.nth(i).boundingBox().catch(() => null);
    positions.push({ i, y: box ? box.y : 999999 });
  }
  positions.sort((a, b) => a.y - b.y);
  console.log("ORDER (index in DOM -> canvas Y):", JSON.stringify(positions));

  for (let rank = 0; rank < positions.length; rank++) {
    const { i } = positions[rank];
    await blocks.nth(i).click({ timeout: 15000, force: true });
    await page.waitForTimeout(1500);
    const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
    await openEditorBtn.click({ timeout: 15000, force: true });
    await page.waitForTimeout(3000);
    const value = await realFrame.evaluate(() => document.querySelector(".CodeMirror")?.CodeMirror.getValue() || "");
    console.log(`RANK ${rank} (domIdx ${i}): length=${value.length} preview=${JSON.stringify(value.slice(0, 120))}`);
    // close the code editor modal without saving (Escape / Cancel)
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(1000);
  }

  await context.close();
})().catch((err) => {
  console.error("LIST_CODE_BLOCKS_ERROR", err);
  process.exit(1);
});
