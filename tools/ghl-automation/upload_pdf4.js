const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const PDF_PATH = "/home/user/wisdom-over-gold/build/Seek First - First 7 Days Sample.pdf";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1000 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/media-storage`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.mouse.click(1288, 63);
  await page.waitForTimeout(1000);

  const fileChooserPromise = page.waitForEvent("filechooser", { timeout: 15000 });
  await page.mouse.click(1225, 112); // "Upload file"
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(PDF_PATH);
  await page.waitForTimeout(10000);
  await page.screenshot({ path: "screenshots/m4-pdf-uploaded.png", fullPage: true });

  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 800).replace(/\n/g, " | "));

  await context.close();
})().catch((err) => {
  console.error("UPLOAD_PDF4_ERROR", err);
  process.exit(1);
});
