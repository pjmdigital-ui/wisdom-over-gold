// Retargets the "Send Sample PDF" email action's one link (inside the
// "Seek First - Free Sample Delivery" workflow) to a new URL/text, and
// saves both the action and the page-level workflow save.
//
// The email body is a Tiptap/ProseMirror contenteditable inside the
// workflow builder's own cross-origin iframe
// (client-app-automation-workflows.leadconnectorhq.com) — reached via
// page.frames().find(...) + frame.evaluate(), not page.locator(). See
// README "Pausing the sale..." section for the full pattern writeup,
// including why BOTH "Save action" and the page-level Save are required.
//
// Edit NEW_TEXT/NEW_URL below and re-run to retarget a different link.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const WORKFLOW_ID = "a5ee6b1a-149a-4644-ae3f-1f7ffb493af4"; // Seek First - Free Sample Delivery
const NEW_TEXT = "Access Your Free Sample Here";
const THANK_YOU_URL = "https://wisdomovergold.com/thank-you-page-470466";

function findLinkIconBox(frame) {
  return frame.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], svg'));
    for (const el of candidates) {
      const label = (el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('data-testid') || '').toLowerCase();
      if (label.includes('link') && !label.includes('unlink')) {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }
    }
    return null;
  });
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1000 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(18000);

  await page.mouse.click(745, 407);
  await page.waitForTimeout(4000);

  const iframeEl = await page.$('iframe[src*="client-app-automation-workflows"]');
  const frame = page.frames().find(f => f.url().includes("client-app-automation-workflows"));
  const iframeBox = await iframeEl.boundingBox();

  await frame.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('filesafe.space'));
    if (a) a.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1000);

  let linkBox = await frame.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('filesafe.space'));
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });

  if (linkBox) {
    const pageX = iframeBox.x + linkBox.x + linkBox.width / 2;
    const pageY = iframeBox.y + linkBox.y + linkBox.height / 2;
    await page.mouse.click(pageX, pageY, { clickCount: 3 });
    await page.waitForTimeout(800);
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(500);
    await page.keyboard.type(NEW_TEXT, { delay: 20 });
    await page.waitForTimeout(800);
  }

  await frame.evaluate((text) => {
    const walker = document.createTreeWalker(document.querySelector('.tiptap.ProseMirror'), NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.includes(text)) {
        node.parentElement.scrollIntoView({ block: "center" });
        break;
      }
    }
  }, NEW_TEXT);
  await page.waitForTimeout(1000);

  const textBox = await frame.evaluate((text) => {
    const walker = document.createTreeWalker(document.querySelector('.tiptap.ProseMirror'), NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.includes(text)) {
        const range = document.createRange();
        range.selectNodeContents(node.parentElement);
        const r = range.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }
    }
    return null;
  }, NEW_TEXT);

  const px = iframeBox.x + textBox.x + textBox.width / 2;
  const py = iframeBox.y + textBox.y + textBox.height / 2;
  await page.mouse.click(px, py, { clickCount: 3 });
  await page.waitForTimeout(800);

  const linkIconBox = await findLinkIconBox(frame);
  if (!linkIconBox) throw new Error("link icon not found");

  const lx = iframeBox.x + linkIconBox.x + linkIconBox.width / 2;
  const ly = iframeBox.y + linkIconBox.y + linkIconBox.height / 2;
  await page.mouse.click(lx, ly);
  await page.waitForTimeout(1200);

  await page.mouse.click(720, 415);
  await page.keyboard.type(THANK_YOU_URL, { delay: 15 });
  await page.waitForTimeout(500);

  await page.mouse.click(720, 595);
  await page.waitForTimeout(800);
  await page.mouse.click(720, 677); // "New window"
  await page.waitForTimeout(800);

  await page.mouse.click(936, 676); // Save on Embed Link dialog
  await page.waitForTimeout(1200);

  const finalHref = await frame.evaluate(() => {
    const a = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('thank-you-page'));
    return a ? { href: a.href, text: a.textContent, target: a.target } : null;
  });
  console.log("Final link in editor before Save action:", JSON.stringify(finalHref));

  // click "Save action" button (bottom right of panel)
  const saveActionBtn = frame.getByRole("button", { name: /^save action$/i }).first();
  await saveActionBtn.click({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "screenshots/fuel-01-after-save-action.png", fullPage: true });

  // now click the page-level Save button (top right)
  await page.mouse.click(1378, 28);
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "screenshots/fuel-02-after-page-save.png", fullPage: true });

  console.log("DONE");
  await context.close();
})().catch((err) => {
  console.error("FINAL_UPDATE_EMAIL_LINK_ERROR", err);
  process.exit(1);
});
