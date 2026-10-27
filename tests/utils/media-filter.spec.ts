import { expect, test } from "@playwright/test";
import {
	buildSortOptions,
	buildStatusOptions,
	collectGenres,
	countByStatus,
	DEFAULT_SORT,
	detectPageType,
	filterByKind,
	hasActiveFilters,
	isSortValid,
	pickDisplayedGenres,
	readFilterState,
	writeFilterParams,
} from "../../src/utils/media/filter";

/** Pure logic behind MediaSidebarFilter: counts, options, genres, URL round-trip. */

const items = [
	{ kind: "movie", format: "MOVIE", status: "completed", genres: ["Drama", "Sci-Fi"] },
	{ kind: "show", format: "TV", status: "watching", genres: ["Drama"] },
	{ kind: "show", format: "TV", status: "wishlist", genres: ["Action"] },
];

test("detectPageType reads the media route", () => {
	expect(detectPageType("/games/")).toBe("games");
	expect(detectPageType("/anime/")).toBe("anime");
	expect(detectPageType("/cinema/")).toBe("cinema");
	expect(detectPageType("/posts/")).toBeNull();
});

test("filterByKind: cinema uses kind, anime uses MOVIE format", () => {
	expect(filterByKind(items, "cinema", "movie")).toHaveLength(1);
	expect(filterByKind(items, "cinema", "show")).toHaveLength(2);
	expect(filterByKind(items, "anime", "movie")).toHaveLength(1);
	expect(filterByKind(items, "anime", "show")).toHaveLength(2);
	expect(filterByKind(items, "cinema", "all")).toHaveLength(3);
});

test("countByStatus excludes wishlist from All for games only", () => {
	expect(countByStatus(items, "games").all).toBe(2);
	expect(countByStatus(items, "cinema").all).toBe(3);
	expect(countByStatus(items, "cinema").watching).toBe(1);
});

test("status and sort options differ per page", () => {
	const games = buildStatusOptions("games", { all: 2, wishlist: 1 });
	expect(games.map((o) => o.key)).toContain("wishlist");
	expect(games.find((o) => o.key === "wishlist")?.count).toBe(1);
	expect(buildStatusOptions("anime", { all: 1 }).map((o) => o.key)).not.toContain("wishlist");

	expect(buildSortOptions("games", "wishlist").map((o) => o.key)).toEqual([
		"default",
		"title",
		"price",
		"discount",
	]);
	expect(buildSortOptions("games", "all").map((o) => o.key)).toContain("hours");
	expect(buildSortOptions("anime", "all").map((o) => o.key)).toContain("year");
});

test("isSortValid requires matching key and direction", () => {
	const opts = buildSortOptions("anime", "all");
	expect(isSortValid(opts, "rating", true)).toBe(true);
	expect(isSortValid(opts, "rating", false)).toBe(false);
	expect(isSortValid(opts, "price", false)).toBe(false);
});

test("collectGenres counts, sorts and hides wishlist-only genres outside wishlist", () => {
	const g = collectGenres(items, "games", "all");
	expect(g[0]).toEqual({ name: "Drama", count: 2 });
	expect(g.find((x) => x.name === "Action")).toBeUndefined();
	expect(collectGenres(items, "games", "wishlist").find((x) => x.name === "Action")?.count).toBe(1);
});

test("pickDisplayedGenres collapses to 10 unless expanded or a hidden one is selected", () => {
	const many = Array.from({ length: 15 }, (_, i) => ({ name: `G${i}`, count: 15 - i }));
	expect(pickDisplayedGenres(many, false, null)).toHaveLength(10);
	expect(pickDisplayedGenres(many, true, null)).toHaveLength(15);
	expect(pickDisplayedGenres(many, false, "G14")).toHaveLength(15);
	expect(pickDisplayedGenres(many.slice(0, 12), false, null)).toHaveLength(12);
});

test("URL state round-trips and keeps unrelated params", () => {
	const state = readFilterState("?q=hi&kind=movie&status=watching&genre=Drama&sort=rating&other=1");
	expect(state).toMatchObject({
		query: "hi",
		kind: "movie",
		status: "watching",
		genre: "Drama",
		sort: "rating",
		desc: true,
	});

	const qs = new URLSearchParams(writeFilterParams("?other=1", state));
	expect(qs.get("other")).toBe("1");
	expect(qs.get("q")).toBe("hi");
	expect(qs.get("sort")).toBe("rating");
	expect(qs.has("dir")).toBe(false);

	const price = new URLSearchParams(
		writeFilterParams("", { ...state, sort: "price", desc: true }),
	);
	expect(price.get("dir")).toBe("desc");

	expect(writeFilterParams("?q=x&sort=year", readFilterState(""))).toBe("");
});

test("hasActiveFilters is false only for the default state", () => {
	const base = readFilterState("");
	expect(base.sort).toBe(DEFAULT_SORT);
	expect(hasActiveFilters(base)).toBe(false);
	expect(hasActiveFilters({ ...base, query: " x " })).toBe(true);
	expect(hasActiveFilters({ ...base, genre: "Drama" })).toBe(true);
	expect(hasActiveFilters({ ...base, desc: true })).toBe(true);
});
