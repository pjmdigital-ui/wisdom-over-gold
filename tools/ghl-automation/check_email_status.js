const { launchContext, LOCATION_ID } = require("./wf_lib");

(async () => {
  const context = await launchContext();
  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/contacts/detail/wufcMsnHswHEVulgldeW`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(12000);

  await page.mouse.click(800, 508);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/emailstatus-00.png", fullPage: true });

  await context.close();
})().catch((err) => {
  console.error("CHECK_EMAIL_STATUS_ERROR", err);
  process.exit(1);
});
