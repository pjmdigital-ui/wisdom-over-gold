const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const WORKFLOW_ID = "35f5adce-11b8-4143-b50f-9095338c9059";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";

const BODY_LINES = [
  "Hi {{contact.first_name}},",
  "",
  "Thank you for your order! Here is your copy of Seek First: The Four Pursuits of the Modern Catholic Man.",
  "",
  "Download your PDF: https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a921de2058f231d6af85205.pdf",
  "Download your EPUB: https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a921e66478fdaf1c7e35f05.epub",
  "",
  "If you added the audio narration to your order: it's currently in production, and we'll send it to you in a separate email as soon as it's ready.",
  "",
  "In faith,",
  "Paul Mascetta",
];

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.mouse.click(745, 932);
  await page.waitForTimeout(1500);
  await page.mouse.click(1175, 213);
  await page.keyboard.type("Send email");
  await page.waitForTimeout(1200);
  await page.mouse.click(1006, 373);
  await page.waitForTimeout(2000);
  await page.mouse.click(1158, 345);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Send Purchase Delivery Email");
  await page.waitForTimeout(300);
  await page.mouse.click(1158, 677);
  await page.keyboard.type("Your Seek First Order Is Here");
  await page.waitForTimeout(300);
  await page.mouse.click(1158, 1164);
  for (const line of BODY_LINES) {
    await page.keyboard.type(line, { delay: 5 });
    await page.keyboard.press("Enter");
  }
  await page.waitForTimeout(500);

  const saveBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveBtn.click({ timeout: 8000, force: true });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/bfpw7-01-email-saved.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("CREATE_PURCHASE_DELIVERY_WORKFLOW_ERROR", err);
  process.exit(1);
});
