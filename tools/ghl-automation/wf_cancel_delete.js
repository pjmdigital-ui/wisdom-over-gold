const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  const node = frame.getByText("Welcome Email", { exact: true }).first();
  await node.click({ timeout: 15000 });
  await page.waitForTimeout(2500);

  const deleteBtn = frame.getByRole("button", { name: /^delete$/i }).first();
  await deleteBtn.click({ timeout: 15000, force: true });
  await page.waitForTimeout(1200);

  await page.mouse.click(845, 1009); // Cancel
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/canceldel-00.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_CANCEL_DELETE_ERROR", err);
  process.exit(1);
});
