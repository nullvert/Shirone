import { expect, test } from "@playwright/test";
import {
	getCleanRank,
	getProgressPercent,
	getRatingTier,
	getSeasonYear,
} from "../../src/utils/media/card";
import type { MediaItem } from "../../src/types/media";

/** Pure presentation helpers behind MediaPosterCard (no browser, no data files). */

const item = (patch: Partial<MediaItem>): MediaItem =>
	({ id: "x", title: "T", kind: "anime", status: "watching", ...patch }) as MediaItem;

test.describe("getRatingTier", () => {
	test("maps rating thresholds", () => {
		expect(getRatingTier(item({ rating: 10 }))).toBe("masterpiece");
		expect(getRatingTier(item({ rating: 9.9 }))).toBe("great");
		expect(getRatingTier(item({ rating: 8 }))).toBe("great");
		expect(getRatingTier(item({ rating: 7.9 }))).toBe("regular");
		expect(getRatingTier(item({ rating: 4 }))).toBe("regular");
		expect(getRatingTier(item({ rating: 3.9 }))).toBe("poor");
	});

	test("unrated items fall back to regular", () => {
		expect(getRatingTier(item({}))).toBe("regular");
		expect(getRatingTier(item({ rating: 0 }))).toBe("regular");
	});

	test("wishlist beats rating and reflects discount", () => {
		expect(getRatingTier(item({ status: "wishlist", rating: 10 }))).toBe("wishlist");
		expect(
			getRatingTier(item({ status: "wishlist", price: { discountPercent: 30 } as MediaItem["price"] })),
		).toBe("wishlist-discount");
		expect(getRatingTier(item({ rank: 3 as MediaItem["rank"] }))).toBe("wishlist");
	});
});

test.describe("getCleanRank", () => {
	test("normalises leading hashes", () => {
		expect(getCleanRank(item({ rank: 8 as MediaItem["rank"] }))).toBe("#8");
		expect(getCleanRank(item({ rank: "##8" as MediaItem["rank"] }))).toBe("#8");
		expect(getCleanRank(item({}))).toBeNull();
		expect(getCleanRank(item({ rank: "#" as MediaItem["rank"] }))).toBeNull();
	});
});

test.describe("getProgressPercent", () => {
	test("rounds and clamps", () => {
		expect(getProgressPercent(item({ progress: { watched: 1, total: 3 } }))).toBe(33);
		expect(getProgressPercent(item({ progress: { watched: 5, total: 3 } }))).toBe(100);
		expect(getProgressPercent(item({ progress: { watched: 2, total: 0 } }))).toBe(0);
		expect(getProgressPercent(item({}))).toBe(0);
	});
});

test.describe("getSeasonYear", () => {
	test("capitalises season and falls back to year", () => {
		expect(getSeasonYear(item({ season: "SUMMER", year: 2022 }))).toBe("Summer 2022");
		expect(getSeasonYear(item({ year: 2022 }))).toBe(2022);
		expect(getSeasonYear(item({}))).toBe("");
	});
});
