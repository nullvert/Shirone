import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4321/anime/");
await page.waitForSelector(".media-card");

const card = (await page.$$(".media-card"))[0];
if (card) {
  // Move mouse over the card to trigger hover
  const box = await card.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    // Wait for css transition
    await page.waitForTimeout(400);
    await card.screenshot({ path: "scratch/card-hover.png" });
    console.log("Hover screenshot saved");
  }
}

await browser.close();
