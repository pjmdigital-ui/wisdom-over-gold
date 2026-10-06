const { launchContext } = require("./wf_lib");
const { LOCATION_ID } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflows?listTab=all`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  await page.screenshot({ path: "screenshots/clonechk-00-list.png", fullPage: true });

  // Click the "..." menu on the "Seek First Weekly Newsletter" row
  const row = page.getByText("Seek First Weekly Newsletter", { exact: true }).first();
  await row.scrollIntoViewIfNeeded();
  const box = await row.boundingBox();
  console.log("ROW_BOX=" + JSON.stringify(box));
  await page.mouse.click(1404, box.y + box.height / 2);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/clonechk-01-menu.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_CHECK_CLONE_ERROR", err);
  process.exit(1);
});
