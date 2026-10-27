import { expect, test, type Page } from "@playwright/test";

/**
 * Games page contract (MediaSection + MediaPosterCard + MediaSidebarFilter).
 * Counts come from the rendered page, not constants, so wishlist/library edits
 * do not break the spec.
 */

const cards = (page: Page) => page.locator(".media-card");
const filter = (page: Page) => page.locator("#sidebar .media-sidebar-filter");

test.describe("Games page (unified media library)", () => {
	let total = 0;

	test.beforeEach(async ({ page }) => {
		await page.goto("/games/");
		await expect(cards(page).first()).toBeVisible();
		total = await cards(page).count();
		expect(total).toBeGreaterThan(0);
	});

	test("renders poster grid with media cards", async ({ page }) => {
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			"games",
		);
		const firstCard = cards(page).first();
		await expect(firstCard.locator(".media-card__cover")).toBeVisible();
		await expect(firstCard.locator(".media-card__media-link")).toHaveAttribute(
			"href",
			/https?:\/\//,
		);
		await expect(firstCard.locator(".media-card__top-status")).toBeVisible();
	});

	test("nav is highlighted and the sidebar filter is visible on direct load", async ({ page }) => {
		await expect(page.locator('a[data-nav-key="games"]').first()).toHaveAttribute(
			"aria-current",
			"page",
		);
		await expect(filter(page)).toBeVisible();
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

		await filter(page).locator(".media-search-clear").click();
		await expect(input).toHaveValue("");
		await expect(cards(page)).toHaveCount(total);
	});

	test("no results shows the empty state", async ({ page }) => {
		await filter(page).locator(".media-search-input").fill("UnknownGameXYZ9999");
		await expect(cards(page)).toHaveCount(0);
		await expect(page.locator(".media-section__empty")).toBeVisible();
	});

	test("sidebar status filter and Reset round-trip", async ({ page }) => {
		const sidebar = filter(page);
		const target = sidebar
			.locator(".media-sidebar-item:not(.media-sidebar-item--active):not([disabled])")
			.first();
		await target.click();
		await expect(page).toHaveURL(/[?&]status=/);
		await expect.poll(() => cards(page).count()).toBeLessThanOrEqual(total);

		const reset = sidebar.locator(".media-sidebar-reset-btn");
		await expect(reset).toBeVisible();
		await reset.click();
		await expect(cards(page)).toHaveCount(total);
	});

	test("mobile: bottom bar opens the filter drawer", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/games/");
		await expect(cards(page).first()).toBeVisible();

		await expect(page.locator("#bottom-app-bar")).toBeVisible();
		await page.locator("#bottom-bar-drawer-btn").click();

		const panel = page.locator(".sidebar-drawer__panel");
		await expect(panel).toBeVisible();
		await expect(panel.locator(".media-sidebar-filter")).toBeVisible();
	});

	test("home page: bottom bar drawer is the sidebar, not the media filter", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/");
		await expect(page.locator("#bottom-app-bar")).toBeVisible();
		await page.locator("#bottom-bar-drawer-btn").click();

		const panel = page.locator(".sidebar-drawer__panel");
		await expect(panel).toBeVisible();
		await expect(panel.locator(".media-sidebar-filter")).toBeHidden();
	});
});
