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

  await page.mouse.click(55, 72); // Layers
  await page.waitForTimeout(1000);
  await page.mouse.click(22, 277); // expand Page
  await page.waitForTimeout(800);
  await page.mouse.click(42, 317); // expand Section (1)
  await page.waitForTimeout(800);

  await page.mouse.click(427, 395); // "..." on the SECOND "1 Column Row" (the Form row)
  await page.waitForTimeout(800);
  await page.mouse.click(427, 356); // "Delete" in the menu
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/dofr3-00-confirm-dialog.png", fullPage: true });

  // confirm dialog -- click its own "Delete" button
  const confirmDeleteBtn = page.getByRole("button", { name: /^delete$/i }).last();
  await confirmDeleteBtn.click({ timeout: 8000 }).catch(async () => {
    console.log("getByRole delete failed, trying coordinate fallback");
    await page.mouse.click(933, 1010);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/dofr3-01-after-delete.png", fullPage: true });

  await page.mouse.click(1305, 25); // page-level save (1900 viewport toolbar coordinate)
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "screenshots/dofr3-02-saved.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("DELETE_OLD_FORM_ROW3_ERROR", err);
  process.exit(1);
});
