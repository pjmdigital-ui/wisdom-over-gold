// Like get_set_hero_block.js, but targets the Nth "Custom HTML/Javascript"
// block on a step (0-based, in top-to-bottom canvas order) instead of
// always the first. Use list_code_blocks.js first to confirm which
// index holds the content you actually want to touch — some steps
// (Opt-In, Sales) have more than one Custom Code block now (hero row +
// a separate whats-inside/footer row), and mistargeting one has
// corrupted a different block's content before (see README).
//
// Usage:
//   node get_set_nth_code_block.js get "<Step Name>" <index> <output-file>
//   node get_set_nth_code_block.js set "<Step Name>" <index> <input-file>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";

const MODE = process.argv[2];
const STEP_NAME = process.argv[3];
const INDEX = parseInt(process.argv[4], 10);
const FILE_ARG = process.argv[5];

if (!MODE || !STEP_NAME || Number.isNaN(INDEX) || !FILE_ARG) {
  console.error('Usage: node get_set_nth_code_block.js get|set "<Step Name>" <index> <file>');
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
  if (INDEX >= blockCount) {
    console.error(`SAFETY ABORT: index ${INDEX} out of range (only ${blockCount} blocks)`);
    await context.close();
    process.exit(1);
  }

  await blocks.nth(INDEX).click({ timeout: 15000, force: true });
  await page.waitForTimeout(1500);

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);

  const before = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
  console.log("BEFORE: length=" + before.length);

  if (MODE === "get") {
    fs.writeFileSync(FILE_ARG, before, "utf8");
    console.log("WROTE " + before.length + " chars to " + FILE_ARG);
  } else if (MODE === "set") {
    const newContent = fs.readFileSync(FILE_ARG, "utf8");
    const result = await realFrame.evaluate((content) => {
      const cm = document.querySelector(".CodeMirror").CodeMirror;
      cm.setValue(content);
      return cm.getValue().length;
    }, newContent);
    console.log("SET content, new length in editor=" + result + " (source file length=" + newContent.length + ")");
    await page.waitForTimeout(1000);

    const saveModalBtn = builderFrame.getByRole("button", { name: /^save$/i }).first();
    await saveModalBtn.click({ timeout: 15000 });
    await page.waitForTimeout(2500);

    await page.mouse.click(1305, 25); // page-level save
    await page.waitForTimeout(12000);
    await page.screenshot({ path: "screenshots/gsnb-page-saved.png", fullPage: true });
  } else {
    console.error("MODE must be 'get' or 'set'");
  }

  await context.close();
})().catch((err) => {
  console.error("GET_SET_NTH_CODE_BLOCK_ERROR", err);
  process.exit(1);
});
