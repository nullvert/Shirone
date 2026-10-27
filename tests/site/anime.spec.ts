import { expect, test, type Page } from "@playwright/test";

/**
 * Anime page contract (MediaSection + MediaPosterCard + MediaSidebarFilter).
 * Counts are read from the rendered page (never hard-coded) so the spec keeps
 * working when the AniList snapshot changes. Search, status and reset all live
 * in the sidebar filter.
 */

const cards = (page: Page) => page.locator(".media-card");
const filter = (page: Page) => page.locator("#sidebar .media-sidebar-filter");

async function loadTotal(page: Page): Promise<number> {
	await expect(cards(page).first()).toBeVisible();
	return cards(page).count();
}

test.describe("Anime page (unified media library)", () => {
	let total = 0;

	test.beforeEach(async ({ page }) => {
		await page.goto("/anime/");
		total = await loadTotal(page);
		expect(total).toBeGreaterThan(0);
	});

	test("renders poster grid with title-on-poster overlay", async ({ page }) => {
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"anime",
		);

		const firstCard = cards(page).first();
		await expect(firstCard).toHaveClass(/media-card--title-on-poster/);
		await expect(firstCard.locator(".media-card__cover")).toBeVisible();
		await expect(firstCard.locator(".media-card__media-link")).toHaveAttribute(
			"href",
			/https?:\/\//,
		);
		await expect(firstCard.locator(".media-card__top-status")).toBeVisible();
		await expect(firstCard.locator(".media-card__overlay-title")).toBeVisible();
	});

	test("hover on anime card reveals full overlay background, details and genres", async ({ page }) => {
		const firstCard = cards(page).first();
		const details = firstCard.locator(".media-card__overlay-details");
		const genres = firstCard.locator(".media-card__overlay-genres");

		// Initially in title-on-poster mode, details are collapsed
		await expect(details).toHaveCSS("opacity", "0");

		// On hover, details expand and genres become visible
		await firstCard.hover();
		await expect(details).toHaveCSS("opacity", "1");
		await expect(genres).toBeVisible();
	});

	test("live search filters, syncs ?q= and clears", async ({ page }) => {
		const firstTitle =
			(await cards(page).first().locator(".media-card__overlay-title").textContent())?.trim() ?? "";
		const needle = firstTitle.split(/\s+/)[0] ?? "";
		expect(needle.length).toBeGreaterThan(0);

		const input = filter(page).locator(".media-search-input");
		await input.fill(needle);
		await expect(page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(needle)}`));
		await expect.poll(() => cards(page).count()).toBeGreaterThan(0);
		await expect.poll(() => cards(page).count()).toBeLessThanOrEqual(total);

		await filter(page).locator(".media-search-clear").click();
		await expect(input).toHaveValue("");
		await expect(cards(page)).toHaveCount(total);
	});

	test("no results shows the empty state", async ({ page }) => {
		await filter(page).locator(".media-search-input").fill("NonExistentAnimeXYZ12345");
		await expect(cards(page)).toHaveCount(0);
		await expect(page.locator(".media-section__empty")).toBeVisible();
	});

	test("deep link restores a status filter; unknown status is an empty state", async ({ page }) => {
		await page.goto("/anime/?status=watching");
		await expect(page.locator(".media-section")).toBeVisible();
		await expect.poll(() => cards(page).count()).toBeLessThan(total);

		await page.goto("/anime/?status=invalid_status_xyz");
		await expect(cards(page)).toHaveCount(0);
		await expect(page.locator(".media-section__empty")).toBeVisible();
	});

	test("sidebar status filter and Reset round-trip", async ({ page }) => {
		const sidebar = filter(page);
		await expect(sidebar).toBeVisible();

		const enabled = sidebar.locator(".media-sidebar-item:not(.media-sidebar-item--active):not([disabled])");
		const target = enabled.first();
		await target.click();
		await expect(page).toHaveURL(/[?&]status=/);
		await expect.poll(() => cards(page).count()).toBeLessThanOrEqual(total);

		const reset = sidebar.locator(".media-sidebar-reset-btn");
		await expect(reset).toBeVisible();
		await reset.click();
		await expect(cards(page)).toHaveCount(total);
		await expect(page).not.toHaveURL(/[?&]status=/);
	});

	test("mobile: bottom bar opens the filter drawer", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/anime/");
		await expect(cards(page).first()).toBeVisible();

		await expect(page.locator("#bottom-app-bar")).toBeVisible();
		await page.locator("#bottom-bar-drawer-btn").click();

		const panel = page.locator(".sidebar-drawer__panel");
		await expect(panel).toBeVisible();
		await expect(panel.locator(".media-sidebar-filter")).toBeVisible();
	});
});
