import { expect, test, type Page } from "@playwright/test";

/**
 * Cinema page contract (MediaSection + MediaPosterCard + MediaSidebarFilter).
 * Data is the Simkl snapshot; counts are read from the page, never hard-coded.
 */

const cards = (page: Page) => page.locator(".media-card");
const filter = (page: Page) => page.locator("#sidebar .media-sidebar-filter");

test.describe("Cinema page (unified media library)", () => {
	let total = 0;

	test.beforeEach(async ({ page }) => {
		await page.goto("/cinema/");
		await expect(cards(page).first()).toBeVisible();
		total = await cards(page).count();
		expect(total).toBeGreaterThan(0);
	});

	test("renders poster grid and nav highlight", async ({ page }) => {
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"cinema",
		);
		const first = cards(page).first();
		await expect(first.locator(".media-card__cover, .media-card__placeholder").first()).toBeVisible();
		await expect(first.locator(".media-card__top-status")).toBeVisible();
	});

	test("media type tabs narrow the grid and sync ?kind=", async ({ page }) => {
		const tabs = filter(page).locator(".media-sidebar-tab");
		await expect(tabs).toHaveCount(3);

		await tabs.nth(1).click();
		await expect(page).toHaveURL(/[?&]kind=movie/);
		await expect.poll(() => cards(page).count()).toBeLessThanOrEqual(total);

		await tabs.nth(0).click();
		await expect(page).not.toHaveURL(/kind=/);
		await expect(cards(page)).toHaveCount(total);
	});

	test("live search filters, then Reset restores everything", async ({ page }) => {
		const title =
			(await cards(page).first().locator(".media-card__overlay-title").textContent())?.trim() ?? "";
		const needle = title.split(/\s+/)[0] ?? "";
		expect(needle.length).toBeGreaterThan(0);

		await filter(page).locator(".media-search-input").fill(needle);
		await expect(page).toHaveURL(/[?&]q=/);
		await expect.poll(() => cards(page).count()).toBeGreaterThan(0);

		const reset = filter(page).locator(".media-sidebar-reset-btn");
		await expect(reset).toBeVisible();
		await reset.click();
		await expect(cards(page)).toHaveCount(total);
	});

	test("no results shows the empty state", async ({ page }) => {
		await filter(page).locator(".media-search-input").fill("NoSuchMovieXYZ9999");
		await expect(cards(page)).toHaveCount(0);
		await expect(page.locator(".media-section__empty")).toBeVisible();
	});
});
