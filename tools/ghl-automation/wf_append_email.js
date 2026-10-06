// Append a "Send email" action to the end of the chain (dynamically
// finds the insertion point above END), fill subject + paste HTML body
// via the Source code editor, and save.
// Usage: node wf_append_email.js <action-name> <subject> <html-file>
const fs = require("fs");
const { launchContext, openWorkflow, clickAppendPlus } = require("./wf_lib");

const ACTION_NAME = process.argv[2];
const SUBJECT = process.argv[3];
const HTML_FILE = process.argv[4];

if (!ACTION_NAME || !SUBJECT || !HTML_FILE) {
  console.error("Usage: node wf_append_email.js <action-name> <subject> <html-file>");
  process.exit(1);
}
const HTML_CONTENT = fs.readFileSync(HTML_FILE, "utf8");
const TAG = ACTION_NAME.replace(/\s+/g, "_");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  await clickAppendPlus(page, frame);
  await page.waitForTimeout(2000);

  const searchBox = frame.getByPlaceholder(/search/i).first();
  await searchBox.fill("Send email");
  await page.waitForTimeout(1200);

  const sendEmailOption = frame.getByText("Send email", { exact: true }).first();
  await sendEmailOption.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.mouse.click(1158, 345);
  await page.keyboard.press("Control+A");
  await page.keyboard.type(ACTION_NAME);
  await page.waitForTimeout(300);

  await page.mouse.click(1158, 677);
  await page.keyboard.type(SUBJECT);
  await page.waitForTimeout(300);

  await page.mouse.click(1024, 1115);
  await page.waitForTimeout(1500);

  await page.mouse.click(719, 275);
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `screenshots/wae2-${TAG}-00-content.png`, fullPage: true });

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(1500);

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `screenshots/wae2-${TAG}-01-saved.png`, fullPage: true });
  console.log("EMAIL_APPENDED: " + ACTION_NAME);

  await context.close();
})().catch((err) => {
  console.error("WF_APPEND_EMAIL_ERROR", err);
  process.exit(1);
});
