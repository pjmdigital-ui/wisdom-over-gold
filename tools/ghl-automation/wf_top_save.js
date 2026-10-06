const { launchContext, openWorkflow } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await openWorkflow(page);
  await page.screenshot({ path: "screenshots/topsave-00-before.png", fullPage: true });

  await page.mouse.click(1378, 28);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/topsave-01-after.png", fullPage: true });
  console.log("DONE");

  await context.close();
})().catch((err) => {
  console.error("WF_TOP_SAVE_ERROR", err);
  process.exit(1);
});
