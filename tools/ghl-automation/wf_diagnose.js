const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);
  console.log("URL=" + page.url());
  await page.screenshot({ path: "screenshots/diag-00.png", fullPage: true });

  const frame = page.frameLocator('iframe[src*="client-app-automation-workflows"]');
  const endCount = await frame.getByText("END", { exact: true }).count();
  console.log("END_COUNT=" + endCount);

  await context.close();
})().catch((err) => {
  console.error("WF_DIAGNOSE_ERROR", err);
  process.exit(1);
});
