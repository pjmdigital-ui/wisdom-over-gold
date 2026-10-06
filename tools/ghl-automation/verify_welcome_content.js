const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  await openWorkflow(page);

  const node = frame.getByText("Welcome Email", { exact: true }).first();
  await node.click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/verifywelcome-00.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("VERIFY_WELCOME_ERROR", err);
  process.exit(1);
});
