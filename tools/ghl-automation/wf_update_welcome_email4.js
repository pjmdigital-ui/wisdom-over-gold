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

  await page.mouse.click(1024, 1115);
  await page.waitForTimeout(1500);

  await page.mouse.click(719, 275);
  await page.waitForTimeout(500);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await page.waitForTimeout(500);
  await page.keyboard.insertText(HTML_CONTENT);
  await page.waitForTimeout(1500);

  const saveModalBtn = frame.getByRole("button", { name: /^save$/i }).first();
  await saveModalBtn.click({ timeout: 15000 });
  await page.waitForTimeout(2000);

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/uwe4-00-action-saved.png", fullPage: true });

  // Explicit top-level workflow Save (the missing step)
  await page.mouse.click(1378, 28);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/uwe4-01-top-saved.png", fullPage: true });

  await context.close();

  // Fresh verify
  const context2 = await launchContext();
  const page2 = context2.pages()[0] || (await context2.newPage());
  const frame2 = page2.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page2);
  const node2 = frame2.getByText("Welcome Email", { exact: true }).first();
  await node2.click({ timeout: 15000 });
  await page2.waitForTimeout(2500);
  await page2.screenshot({ path: "screenshots/uwe4-02-fresh-verify.png", fullPage: true });
  const freshCharCount = await frame2.locator('text=/characters.*words/').first().textContent().catch(() => "N/A");
  console.log("FRESH_RELOAD_CHAR_COUNT=" + freshCharCount);

  await context2.close();
})().catch((err) => {
  console.error("WF_UPDATE_WELCOME4_ERROR", err);
  process.exit(1);
});
