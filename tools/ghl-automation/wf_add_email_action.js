// Add a "Send email" action right after the given Y-coordinate "+" node,
// fill subject + paste HTML body via the Source code editor, and save.
// Usage: node wf_add_email_action.js <plus-y-coord> <action-name> <subject> <html-file>
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const WORKFLOW_ID = "ec2be1a1-9d12-4f9e-815a-b63812e3337d";

const PLUS_Y = parseInt(process.argv[2], 10);
const ACTION_NAME = process.argv[3];
const SUBJECT = process.argv[4];
const HTML_FILE = process.argv[5];
const HTML_CONTENT = fs.readFileSync(HTML_FILE, "utf8");

if (!PLUS_Y || !ACTION_NAME || !SUBJECT || !HTML_FILE) {
  console.error("Usage: node wf_add_email_action.js <plus-y> <action-name> <subject> <html-file>");
  process.exit(1);
}

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

  await page.mouse.click(745, PLUS_Y);
  await page.waitForTimeout(2000);

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Send email");
  await page.waitForTimeout(1200);

  const sendEmailOption = frame.getByText("Send email", { exact: true }).first();
  await sendEmailOption.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  // Action name
  await page.mouse.click(1158, 345);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(ACTION_NAME);
  await page.waitForTimeout(300);

  // Subject
  await page.mouse.click(1158, 677);
  await page.keyboard.type(SUBJECT);
  await page.waitForTimeout(300);

  // Open Source code editor for the body
  await page.mouse.click(1024, 1115);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/wfea-${ACTION_NAME.replace(/\s+/g, "_")}-00-code-open.png`, fullPage: true });

  // Select all existing placeholder content and replace with our HTML
  await page.mouse.click(719, 275);
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `screenshots/wfea-${ACTION_NAME.replace(/\s+/g, "_")}-01-content-inserted.png`, fullPage: true });

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/wfea-${ACTION_NAME.replace(/\s+/g, "_")}-02-modal-saved.png`, fullPage: true });

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `screenshots/wfea-${ACTION_NAME.replace(/\s+/g, "_")}-03-saved.png`, fullPage: true });
  console.log("EMAIL_ACTION_SAVED");

  await context.close();
})().catch((err) => {
  console.error("WF_ADD_EMAIL_ACTION_ERROR", err);
  process.exit(1);
});
