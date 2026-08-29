// Grabs the CDN link for the most recently uploaded file in GHL Media
// Storage (newest-first sort), without uploading anything itself. Use
// this when the user has already uploaded a file through the GHL UI
// and just needs its public link.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";

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
  await page.screenshot({ path: "screenshots/glm-00-media-list.png", fullPage: true });

  // Newest-first sort puts the most recent file in the first grid slot —
  // its card spans roughly x=250-463, y=263-475 at this viewport.
  await page.mouse.click(356, 369);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/glm-01-card-opened.png", fullPage: true });

  const copyBtn = page.getByText("Copy link", { exact: true }).first();
  await copyBtn.click({ timeout: 8000 });
  await page.waitForTimeout(800);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => "ERR:" + e.message);
  console.log("MEDIA_URL=" + clip);

  await context.close();
})().catch((err) => {
  console.error("GET_LATEST_MEDIA_LINK_ERROR", err);
  process.exit(1);
});
