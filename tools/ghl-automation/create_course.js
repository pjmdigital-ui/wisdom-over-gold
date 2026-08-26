const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";

const TITLE = "Seek First: The Four Pursuits of the Modern Catholic Man";
const DESC =
  "A 365-day devotional for Catholic men, built around four pursuits: Piety, Protection, Provision, and Posterity. One short devotion a day.";
const OFFER_TITLE = "Seek First Member Access";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("PAGE_CONSOLE_ERROR: " + msg.text().slice(0, 300));
  });

  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/products-v2`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(6000);

  await page.getByRole("button", { name: /create new course/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.getByText(/start from scratch/i).first().click({ timeout: 10000 });
  await page.waitForTimeout(4000);

  await page.getByPlaceholder("Enter course title").fill(TITLE);
  await page.getByPlaceholder("Tell members about this course").fill(DESC);
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /upload thumbnail/i }).last().click({ timeout: 10000 });
  await page.waitForTimeout(3000);

  await page.getByRole("button", { name: /set up pricing/i }).last().click({ timeout: 10000 });
  await page.waitForTimeout(3000);

  const offerTitleInput = page.locator('input[maxlength="255"]').first();
  await offerTitleInput.fill(OFFER_TITLE).catch(() => {});
  await page.waitForTimeout(500);
  await page.getByText(/^Free$/).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);

  // Find the actual submit button precisely: the one with an arrow icon, near bottom, not the breadcrumb.
  const allCreateBtns = await page.getByRole("button", { name: /create course/i }).all();
  console.log("MATCH_COUNT=" + allCreateBtns.length);
  for (let i = 0; i < allCreateBtns.length; i++) {
    const box = await allCreateBtns[i].boundingBox().catch(() => null);
    console.log(`BTN[${i}] box=` + JSON.stringify(box));
  }

  // Pick the one with the largest Y (lowest on page = the real submit button).
  let target = null;
  let maxY = -1;
  for (const btn of allCreateBtns) {
    const box = await btn.boundingBox().catch(() => null);
    if (box && box.y > maxY) {
      maxY = box.y;
      target = btn;
    }
  }
  if (!target) throw new Error("No Create Course button found");

  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await target.click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/mem-course-created-immediate.png", fullPage: true });

  await page.waitForTimeout(5000);
  await page.screenshot({ path: "screenshots/mem-course-created.png", fullPage: true });
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log("SNIPPET=" + bodyText.slice(0, 2500).replace(/\n/g, " | "));
  console.log("URL=" + page.url());

  await context.close();
})().catch((err) => {
  console.error("CREATE_COURSE_ERROR", err);
  process.exit(1);
});
