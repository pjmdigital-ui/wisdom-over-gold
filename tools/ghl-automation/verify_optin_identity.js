const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";

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

  const matches = page.getByText("Opt-In", { exact: true });
  const count = await matches.count();
  let bestIdx = 0, bestY = -1;
  for (let i = 0; i < count; i++) {
    const box = await matches.nth(i).boundingBox().catch(() => null);
    if (box && box.y > bestY) { bestY = box.y; bestIdx = i; }
  }
  await matches.nth(bestIdx).click({ timeout: 15000 });
  await page.waitForTimeout(2000);

  // confirm the right panel shows Opt-In's own URL before proceeding
  const urlVisible = await page.locator('text=/wisdomovergold\\.com\\/seek-first-free-sample/i').first().isVisible().catch(() => false);
  console.log("Right panel shows Opt-In URL (seek-first-free-sample):", urlVisible);

  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  // screenshot the top toolbar to visually confirm which step name is shown
  await page.screenshot({ path: "screenshots/voi-00-toolbar.png", clip: { x: 400, y: 0, width: 640, height: 130 } });

  const builderFrame = page.frameLocator('iframe[src*="page-builder.leadconnectorhq.com"]').first();
  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));

  const blocks = builderFrame.getByText("Custom HTML/Javascript", { exact: false });
  const blockCount = await blocks.count();
  console.log("BLOCK_COUNT=" + blockCount);

  await blocks.nth(0).click({ timeout: 15000, force: true });
  await page.waitForTimeout(1500);
  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  const value = await realFrame.evaluate(() => document.querySelector(".CodeMirror")?.CodeMirror.getValue() || "");
  console.log("BLOCK0 length=" + value.length);
  console.log("BLOCK0 contains sf-optin:", value.includes("sf-optin"));
  console.log("BLOCK0 contains sf-thankyou:", value.includes("sf-thankyou"));
  console.log("BLOCK0 contains 'You\\'re In':", value.includes("You're In"));
  console.log("BLOCK0 contains 'Send Me the First Week':", value.includes("Send Me the First Week"));

  await context.close();
})().catch((err) => {
  console.error("VERIFY_OPTIN_IDENTITY_ERROR", err);
  process.exit(1);
});
