const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);

  // Click the "fit to view" icon (bottom-left zoom controls, the
  // 4-corners expand icon)
  await page.mouse.click(104, 1176);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "screenshots/fitview-00.png", fullPage: true });
  console.log("DONE");

  await context.close();
})().catch((err) => {
  console.error("WF_FIT_VIEW_ERROR", err);
  process.exit(1);
});
