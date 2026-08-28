// Upload a local file to GHL Media Storage and print its public CDN link.
// Usage: node upload_and_get_link.js <file-path>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FILE_PATH = process.argv[2];

if (!FILE_PATH) {
  console.error("Usage: node upload_and_get_link.js <file-path>");
  process.exit(1);
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/media-storage`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.mouse.click(1288, 63); // Upload split-button
  await page.waitForTimeout(1000);

  const fileChooserPromise = page.waitForEvent("filechooser", { timeout: 20000 });
  await page.mouse.click(1225, 112); // "Upload file"
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(FILE_PATH);
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "screenshots/upl-uploaded.png", fullPage: true });

  // Newest-first sort puts the fresh upload in the first grid slot — its
  // card spans roughly x=250-463, y=263-475 at this viewport, so click
  // near its center (203,468 — an easy first guess — is actually just
  // outside the card and silently misses everything downstream).
  await page.mouse.click(356, 369);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/upl-card-opened.png", fullPage: true });

  const copyBtn = page.getByText("Copy link", { exact: true }).first();
  await copyBtn.click({ timeout: 8000 });
  await page.waitForTimeout(800);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => "ERR:" + e.message);
  console.log("MEDIA_URL=" + clip);

  await context.close();
})().catch((err) => {
  console.error("UPLOAD_AND_GET_LINK_ERROR", err);
  process.exit(1);
});
