// Opens a given "Send email" action and sends a test email via its
// built-in "Test Emails" field + "Send test mail" button.
// Usage: node wf_send_test_email.js <action-label> <test-email>
const { launchContext, openWorkflow } = require("./wf_lib");

const ACTION_LABEL = process.argv[2];
const TEST_EMAIL = process.argv[3];

if (!ACTION_LABEL || !TEST_EMAIL) {
  console.error("Usage: node wf_send_test_email.js <action-label> <test-email>");
  process.exit(1);
}

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  const node = frame.getByText(ACTION_LABEL, { exact: true }).first();
  await node.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/test-email-00-opened.png", fullPage: true });

  // Test Emails field + "Send test mail" button, near the bottom of the panel
  const testEmailField = frame.getByPlaceholder("Test emails").first();
  await testEmailField.click({ timeout: 15000 });
  await page.keyboard.type(TEST_EMAIL);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screenshots/test-email-01-filled.png", fullPage: true });

  const sendTestBtn = frame.getByRole("button", { name: /send test mail/i }).first();
  await sendTestBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/test-email-02-sent.png", fullPage: true });
  console.log("TEST_EMAIL_SENT to " + TEST_EMAIL);

  await context.close();
})().catch((err) => {
  console.error("WF_SEND_TEST_EMAIL_ERROR", err);
  process.exit(1);
});
