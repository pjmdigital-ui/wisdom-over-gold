const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

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

  // click directly on Row1's visible bar (top of page, no scrolling needed)
  await page.mouse.click(720, 217);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/crn-00-row1-clicked.png", fullPage: false });

  const openEditorBtn = builderFrame.getByText("Open Code Editor", { exact: true }).first();
  await openEditorBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/crn-01-editor.png", fullPage: false });

  const realFrame = page.frames().find((f) => f.url().includes("page-builder.leadconnectorhq.com"));
  const value = await realFrame.evaluate(() => document.querySelector(".CodeMirror").CodeMirror.getValue());
  console.log("Row1 content: length=" + value.length);
  console.log("Contains sf-site-header:", value.includes("sf-site-header"));
  console.log("Contains Send Me the First Week:", value.includes("Send Me the First Week"));
  console.log("Contains What's Inside:", value.includes("What's Inside"));
  fs.writeFileSync("/tmp/row1_check_now.html", value, "utf8");

  await context.close();
})().catch((err) => {
  console.error("CHECK_ROW1_NOW_ERROR", err);
  process.exit(1);
});
