const { launchContext, openWorkflow } = require("./wf_lib");
(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);
  await page.screenshot({ path: "screenshots/debug-00.png", fullPage: true });
  await context.close();
})().catch((err) => { console.error(err); process.exit(1); });
