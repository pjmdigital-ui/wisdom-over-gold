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

  // Open Source code editor
  await page.mouse.click(1024, 1115);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/uwe2-00-code-open.png", fullPage: true });

  await page.mouse.click(719, 275);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screenshots/uwe2-01-cleared.png", fullPage: true });
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/uwe2-02-inserted.png", fullPage: true });

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/uwe2-03-modal-saved.png", fullPage: true });

  // Confirm preview pane updated before saving the action
  await page.screenshot({ path: "screenshots/uwe2-04-preview-check.png", fullPage: true });

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/uwe2-05-action-saved.png", fullPage: true });

  // Re-open the SAME action immediately, same session, to confirm it stuck
  const node2 = frame.getByText("Welcome Email", { exact: true }).first();
  await node2.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/uwe2-06-reopened.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("WF_UPDATE_WELCOME2_ERROR", err);
  process.exit(1);
});
