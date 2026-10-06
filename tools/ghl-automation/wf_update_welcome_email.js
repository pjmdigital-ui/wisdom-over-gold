// Replace the existing "Welcome Email" action's body with the updated
// build/newsletter-emails/welcome.html content, via the Source Code
// editor, then save.
const fs = require("fs");
const { launchContext, openWorkflow } = require("./wf_lib");

const HTML_CONTENT = fs.readFileSync("../../build/newsletter-emails/welcome.html", "utf8");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  const node = frame.getByText("Welcome Email", { exact: true }).first();
  await node.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/uwe-00-opened.png", fullPage: true });

  // Open Source code editor
  await page.mouse.click(1024, 1115);
  await page.waitForTimeout(1500);

  await page.mouse.click(719, 275);
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/uwe-01-content.png", fullPage: true });

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(1500);

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/uwe-02-saved.png", fullPage: true });
  console.log("WELCOME_EMAIL_UPDATED");

  await context.close();
})().catch((err) => {
  console.error("WF_UPDATE_WELCOME_ERROR", err);
  process.exit(1);
});
