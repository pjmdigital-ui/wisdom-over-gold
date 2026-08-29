// Restructures the Sales page's order-form section into two columns:
// left = book cover image + benefit bullets, right = the real order form
// (with the $9 audio order bump). Idempotent only in the sense that it
// always rebuilds from a fresh page load — do not re-run against a page
// that already has this two-column row, or it will duplicate it.
//
// Approach (see README "Two-column order section" for why): a fresh
// "One Step Order" element added via Quick Add automatically uses
// whatever products are attached at the funnel step level, but does NOT
// inherit the order-bump's own headline/description/product selection —
// that lives on the element instance, so it has to be reconfigured here.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const FUNNEL_ID = "jhYyaoVGGGAsks0EcrQf";
const COVER_URL = "https://assets.cdn.filesafe.space/Pie9yvZA1BYJnWPk99Yj/media/6a8de618cdd4b797a364dfca.png";

const BULLETS = [
  "365 daily devotions for Catholic men",
  "Full book delivered as PDF + EPUB",
  "Add the audio narration, read by Paul",
  "One-time payment — yours forever",
  "Instant access the moment you check out",
];

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/funnels-websites/funnels/${FUNNEL_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(9000);
  const stepsTab = page.getByText(/^Steps$/i).first();
  await stepsTab.click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.mouse.click(334, 427); // "Sales" row in the Funnel steps list (fixed coordinate)
  await page.waitForTimeout(1500);
  const editBtn = page.getByRole("button", { name: /^edit$/i }).first();
  await editBtn.click();
  await page.waitForTimeout(40000);

  const frame = page.frameLocator('iframe[src*="page-builder"]');
  const orderEl = frame.locator('text=/Wait! Add the Audio Narration/i').first();
  const orderBox = await orderEl.boundingBox({ timeout: 15000 }).catch(() => null);
  if (!orderBox) {
    console.error("SAFETY ABORT: not on Sales page, or order-form row not found");
    await page.screenshot({ path: "screenshots/build2col-abort.png", fullPage: false });
    await context.close();
    process.exit(1);
  }
  await page.mouse.wheel(0, orderBox.y - 500);
  await page.waitForTimeout(1500);

  // add a 2-column row directly above the order-form row (drag from Quick Add > Rows)
  await page.mouse.click(24, 72);
  await page.waitForTimeout(1500);
  await page.mouse.move(339, 310);
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.move(700, 290, { steps: 10 });
  await page.waitForTimeout(300);
  await page.mouse.move(900, 275, { steps: 10 });
  await page.waitForTimeout(500);
  await page.mouse.move(900, 268, { steps: 5 });
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.waitForTimeout(1500);

  // left column: book cover image
  await page.mouse.click(430, 335); // left column's own "+"
  await page.waitForTimeout(1500);
  await page.mouse.click(526, 1300); // "Image" (Media section)
  await page.waitForTimeout(2000);
  await page.mouse.dblclick(430, 450); // open the new image's settings
  await page.waitForTimeout(1500);
  await page.mouse.click(1247, 571); // Image URL field
  await page.keyboard.press("Control+A");
  await page.keyboard.type(COVER_URL);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(2000);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);

  // left column: bullet list of benefits, added below the image
  await page.mouse.click(55, 72); // Layers
  await page.waitForTimeout(1000);
  await page.mouse.click(74, 277); // Page
  await page.waitForTimeout(800);
  await page.mouse.click(42, 317); // Section
  await page.waitForTimeout(800);
  await page.mouse.click(62, 394); // expand 2 Column Row
  await page.waitForTimeout(800);
  await page.mouse.click(151, 434); // select "1st Column"
  await page.waitForTimeout(1000);
  await page.mouse.click(55, 72); // close Layers
  await page.waitForTimeout(800);
  await page.mouse.click(24, 72); // Quick Add, scoped to selected column
  await page.waitForTimeout(1500);
  await page.mouse.click(248, 679); // "Bullet list"
  await page.waitForTimeout(2000);
  await page.keyboard.press("Escape"); // close Quick Add panel
  await page.waitForTimeout(1000);

  for (let i = 0; i < BULLETS.length; i++) {
    const label = `Bullet List ${i + 1}`;
    const loc = frame.getByText(label, { exact: true }).first();
    await loc.dblclick({ timeout: 8000 });
    await page.waitForTimeout(400);
    // select only this line (Control+A would select the whole rich-text block)
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.waitForTimeout(200);
    await page.keyboard.type(BULLETS[i]);
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }

  // right column: a fresh "One Step Order" element (picks up the step's
  // already-configured $7 book / $9 bump products automatically)
  await page.mouse.click(900, 300); // click the empty right column to select it
  await page.waitForTimeout(1000);
  await page.mouse.click(24, 72); // Quick Add, scoped to the selected column
  await page.waitForTimeout(1500);
  await page.mouse.click(390, 226); // search box
  await page.keyboard.type("order");
  await page.waitForTimeout(1200);
  await page.mouse.click(388, 373); // "1 Step Order"
  await page.waitForTimeout(3000);

  // reconfigure the order bump on this NEW element (not inherited from
  // the step — see file header) to match the original: scroll its
  // settings panel down to "Order Bump Options"
  await page.mouse.move(700, 700);
  await page.mouse.wheel(0, -3000); // scroll canvas back to top
  await page.waitForTimeout(1500);
  await page.mouse.move(1278, 900);
  await page.mouse.wheel(0, 3000); // scroll the settings panel down
  await page.waitForTimeout(1500);

  await page.mouse.click(1387, 1379); // "Enable Order Bump" toggle
  await page.waitForTimeout(1500);
  await page.mouse.click(1279, 1444); // "+ Add Bump Product"
  await page.waitForTimeout(1500);
  await page.mouse.click(1279, 1533); // "Select Product" dropdown
  await page.waitForTimeout(1200);
  await page.mouse.click(1277, 1574); // "Seek First - Audio Narration Add-On"
  await page.waitForTimeout(1200);
  await page.mouse.click(1279, 1610); // Headline
  await page.keyboard.type("Wait! Add the Audio Narration");
  await page.waitForTimeout(300);
  await page.mouse.click(1279, 1657); // OTO Headline
  await page.keyboard.type("Every Day, Narrated in Paul's Own Voice — Just $9");
  await page.waitForTimeout(300);
  await page.mouse.click(1279, 1720); // OTO Text
  await page.keyboard.type(
    "Listen to each day's devotion instead of just reading it. Perfect for your commute. One-time add-on, delivered with your book."
  );
  await page.waitForTimeout(300);
  await page.mouse.click(1351, 1874); // Save (bump config modal)
  await page.waitForTimeout(2000);

  // delete the OLD full-width order-form element (now redundant)
  await page.mouse.click(55, 72); // Layers
  await page.waitForTimeout(1000);
  await page.mouse.click(225, 226); // search field
  await page.keyboard.type("One Step Order");
  await page.waitForTimeout(1200);
  await page.mouse.click(417, 362); // "..." on the second (old) match
  await page.waitForTimeout(800);
  await page.mouse.click(397, 284); // "Delete" (element menu: Hide/Edit/Clone/Delete/Save Element)
  await page.waitForTimeout(1500);
  await page.mouse.click(933, 1010); // confirm dialog
  await page.waitForTimeout(2000);

  // delete the now-empty leftover row it was sitting in
  await page.mouse.click(413, 226); // clear search field
  await page.waitForTimeout(500);
  await page.mouse.click(225, 226);
  await page.keyboard.press("Control+A");
  await page.keyboard.type("1 Column Row");
  await page.waitForTimeout(1200);
  await page.mouse.click(417, 362); // "..." on the second match (empty row; first is the hero row — verify count is 2 before running on a differently-structured page)
  await page.waitForTimeout(800);
  await page.mouse.click(397, 324); // "Delete" (row menu: Hide/Edit/Clone/Delete — note Delete is at a DIFFERENT y than the element menu above)
  await page.waitForTimeout(1000);
  await page.mouse.click(933, 1010); // confirm dialog
  await page.waitForTimeout(1500);

  // close panels and save the page (autosave is off in this builder)
  await page.mouse.click(423, 163); // close Layers
  await page.waitForTimeout(500);
  await page.mouse.click(1412, 163); // close settings panel if still open
  await page.waitForTimeout(500);
  await page.mouse.click(1305, 25); // page-level Save (disk icon)
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/build2col-final.png", fullPage: false });

  await context.close();
})().catch((err) => {
  console.error("BUILD_SALES_TWO_COLUMN_ORDER_ERROR", err);
  process.exit(1);
});
