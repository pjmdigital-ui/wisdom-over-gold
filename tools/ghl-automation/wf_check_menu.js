const { launchContext, LOCATION_ID } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflows?listTab=all`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);

  // Click the "..." (3-dot) menu on the 3rd row (Seek First Weekly Newsletter)
  await page.mouse.click(1404, 530);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "screenshots/menuchk-00.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("WF_CHECK_MENU_ERROR", err);
  process.exit(1);
});
