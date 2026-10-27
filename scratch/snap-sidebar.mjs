import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4321/anime/?status=watching");
await page.waitForSelector("#sidebar .media-sidebar-search");

const search = await page.$("#sidebar .media-sidebar-search");
if (search) {
  await search.screenshot({ path: "scratch/search-reset.png" });
}

await browser.close();
console.log("Search reset screenshot captured");
