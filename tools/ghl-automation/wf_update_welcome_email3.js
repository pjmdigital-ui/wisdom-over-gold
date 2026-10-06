// Rigorous version: verify the actual rendered text content (not just
// screenshots) at each step, inside the SAME session, before and after
// each save, to catch the "looks right but silently saved empty" bug.
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

  const charCountBefore = await frame.locator('text=/characters.*words/').first().textContent().catch(() => "N/A");
  console.log("CHAR_COUNT_BEFORE_EDIT=" + charCountBefore);

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
  await page.waitForTimeout(2500);

  const charCountAfterModal = await frame.locator('text=/characters.*words/').first().textContent().catch(() => "N/A");
  console.log("CHAR_COUNT_AFTER_MODAL_SAVE=" + charCountAfterModal);

  // Verify preview pane actually has our text before saving the action
  const previewText = await frame.locator('text=/You\'re In/').first().textContent().catch(() => null);
  console.log("PREVIEW_HAS_CONTENT=" + (previewText !== null));
  if (!previewText) {
    throw new Error("Preview pane does not show expected content before Save action -- aborting to avoid saving empty body");
  }

  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/uwe3-00-saved.png", fullPage: true });

  await context.close();

  // Fresh, separate session/context for the real verification
  const context2 = await launchContext();
  const page2 = context2.pages()[0] || (await context2.newPage());
  const frame2 = page2.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page2);
  const node2 = frame2.getByText("Welcome Email", { exact: true }).first();
  await node2.click({ timeout: 15000 });
  await page2.waitForTimeout(2500);
  await page2.screenshot({ path: "screenshots/uwe3-01-fresh-verify.png", fullPage: true });
  const freshCharCount = await frame2.locator('text=/characters.*words/').first().textContent().catch(() => "N/A");
  console.log("FRESH_RELOAD_CHAR_COUNT=" + freshCharCount);
  const freshPreviewText = await frame2.locator('text=/You\'re In/').first().textContent().catch(() => null);
  console.log("FRESH_RELOAD_HAS_CONTENT=" + (freshPreviewText !== null));

  await context2.close();
})().catch((err) => {
  console.error("WF_UPDATE_WELCOME3_ERROR", err);
  process.exit(1);
});
