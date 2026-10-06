// Shared helpers for building out the Seek First Weekly Newsletter
// workflow action-by-action. The canvas always keeps a fixed ~62px gap
// between the last "+" (add-action) node and the "END" node beneath it,
// regardless of how tall the preceding action box is (wraps to 1 or 2
// lines) -- so clicking just above END reliably opens the panel to
// APPEND the next action, without needing to hardcode a Y coordinate
// that drifts as the chain grows.
const { chromium } = require("playwright-core");
const path = require("path");
const os = require("os");

const PROFILE_DIR = path.join(os.homedir(), ".ghl-profile");
const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCATION_ID = "Pie9yvZA1BYJnWPk99Yj";
const WORKFLOW_ID = "ec2be1a1-9d12-4f9e-815a-b63812e3337d";

async function openWorkflow(page) {
  await page.goto(
    `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/automation/workflow/${WORKFLOW_ID}`,
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.waitForTimeout(16000);
}

async function launchContext() {
  return chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-first-run"],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    viewport: { width: 1440, height: 1900 },
  });
}

async function clickAppendPlus(page, frame) {
  // The canvas always opens scrolled to the TOP (the trigger node), and
  // as the chain has grown past week 4 or so, the END node is well
  // below the viewport. This canvas pans with the mouse wheel (it's a
  // React-Flow-style canvas, not a normal scrollable div), so "END"
  // literally isn't in the DOM until panned into view -- a locator
  // wait or a reload alone won't surface it. Pan down step by step,
  // re-checking after each step, until it appears.
  const endNode = frame.getByText("END", { exact: true }).first();
  let found = false;
  for (let i = 0; i < 40; i++) {
    const count = await endNode.count();
    if (count > 0) {
      found = true;
      break;
    }
    await page.mouse.move(700, 900);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(500);
  }
  if (!found) throw new Error("Could not pan END node into view");

  await endNode.scrollIntoViewIfNeeded({ timeout: 20000 });
  const box = await endNode.boundingBox();
  if (!box) throw new Error("Could not find END node bounding box");
  const plusX = box.x + box.width / 2;
  const plusY = box.y - 62;
  await page.mouse.click(plusX, plusY);
}

module.exports = { PROFILE_DIR, CHROME_PATH, LOCATION_ID, WORKFLOW_ID, openWorkflow, launchContext, clickAppendPlus };
