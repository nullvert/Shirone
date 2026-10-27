import { expect, test, type Page } from "@playwright/test";

/**
 * Compass (bookmarks) page contract: pages/compass.astro -> CompassSection -> CompassTile.
 * Data comes from the Raindrop snapshot (or the bundled defaults), so nothing
 * here depends on specific bookmark names or counts: shelves, tile counts and
 * search needles are all read from the rendered page.
 */

const tiles = (page: Page) => page.locator(".compass-tile");
const search = (page: Page) => page.locator('.compass-section__search input[type="search"]');
const chips = (page: Page) => page.locator(".compass-section__chips button");

test.describe("Compass page", () => {
	let total = 0;

	test.beforeEach(async ({ page }) => {
		await page.goto("/compass/");
		await expect(tiles(page).first()).toBeVisible();
		total = await tiles(page).count();
		expect(total).toBeGreaterThan(0);
	});

	test("renders shelves with titled sections and external-link tiles", async ({ page }) => {
		const shelves = page.locator("section[data-shelf]");
		const shelfCount = await shelves.count();
		expect(shelfCount).toBeGreaterThan(0);

		let sum = 0;
		for (let i = 0; i < shelfCount; i++) {
			const shelf = shelves.nth(i);
			const n = await shelf.locator(".compass-tile").count();
			expect(n).toBeGreaterThan(0);
			sum += n;
			await expect(shelf.locator(".section-title__title")).not.toBeEmpty();
		}
		expect(sum).toBe(total);

		const first = tiles(page).first();
		await expect(first.locator(".compass-tile__label")).not.toBeEmpty();
		const link = first.locator("a.compass-tile__link");
		await expect(link).toHaveAttribute("href", /^https?:\/\//);
		await expect(link).toHaveAttribute("target", "_blank");
		await expect(link).toHaveAttribute("rel", /noopener/);
	});

	test("group chip filters to one shelf, syncs ?group= and toggles off", async ({ page }) => {
		const chipCount = await chips(page).count();
		test.skip(chipCount < 2, "needs at least two shelves to filter");

		const chip = chips(page).first();
		await chip.click();
		await expect(chip).toHaveAttribute("aria-pressed", "true");
		await expect(page).toHaveURL(/[?&]group=/);
		await expect(page.locator(".compass-section__loading")).toHaveCount(0);
		await expect(page.locator("section[data-shelf]")).toHaveCount(1);
		await expect.poll(() => tiles(page).count()).toBeLessThan(total);

		await chip.click();
		await expect(chip).toHaveAttribute("aria-pressed", "false");
		await expect(page).not.toHaveURL(/group=/);
		await expect(tiles(page)).toHaveCount(total);
	});

	test("deep link restores a shelf; unknown shelf shows the empty state", async ({ page }) => {
		const key = await page.locator("section[data-shelf]").first().getAttribute("data-shelf");
		expect(key).toBeTruthy();

		await page.goto(`/compass/?group=${key}`);
		await expect(page.locator(`section[data-shelf="${key}"]`)).toBeVisible();
		await expect(page.locator("section[data-shelf]")).toHaveCount(1);

		await page.goto("/compass/?group=nonsense");
		await expect(page.locator(".compass-section__empty")).toBeVisible();
	});

	test("search matches a tile label, syncs ?q= and restores on clear", async ({ page }) => {
		const label =
			(await tiles(page).first().locator(".compass-tile__label").textContent())?.trim() ?? "";
		expect(label.length).toBeGreaterThan(0);

		await search(page).fill(label);
		await expect(page).toHaveURL(/[?&]q=/);
		await expect.poll(() => tiles(page).count()).toBeGreaterThan(0);
		await expect.poll(() => tiles(page).count()).toBeLessThanOrEqual(total);

		await search(page).fill("");
		await expect(tiles(page)).toHaveCount(total);
		await expect(page).not.toHaveURL(/q=/);
	});

	test("no results shows the empty state and hides all shelves", async ({ page }) => {
		await search(page).fill("zzzzzz-no-such-bookmark");
		await expect(tiles(page)).toHaveCount(0);
		await expect(page.locator("section[data-shelf]")).toHaveCount(0);
		await expect(page.locator(".compass-section__empty")).toBeVisible();
	});

	test("sidebar widgets still render on the compass page", async ({ page }) => {
		await expect(page.locator('#sidebar widget-layout[data-id="categories"]')).toBeVisible();
		await expect(page.locator('#sidebar widget-layout[data-id="tags"]')).toBeVisible();
	});
});
