/**
 * Чистая логика бокового фильтра медиатеки (без DOM и состояния):
 * списки статусов/сортировки, счётчики, жанры и (де)сериализация URL.
 * Вынесена из MediaSidebarFilter, чтобы молекула отвечала только за сборку UI.
 */

import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

export type MediaPageType = "anime" | "cinema" | "games";

export type SortKey =
	| "title"
	| "rating"
	| "default"
	| "price"
	| "year"
	| "hours"
	| "discount";

export interface FilterableItem {
	kind?: string;
	format?: string;
	status: string;
	genres: string[];
}

export interface StatusOption {
	key: string;
	label: string;
	icon: string;
	count: number;
}

export interface SortOption {
	key: SortKey;
	desc: boolean;
	label: string;
	icon: string;
}

export interface FilterListItem {
	id: string;
	label: string;
	icon: string;
	active: boolean;
	count?: number;
}

export interface GenreCount {
	name: string;
	count: number;
}

export interface FilterState {
	query: string;
	kind: string;
	status: string;
	sort: SortKey;
	desc: boolean;
	genre: string | null;
}

export const DEFAULT_SORT: SortKey = "title";

/** Сортировки, у которых по умолчанию порядок «по убыванию». */
const DESC_BY_DEFAULT: SortKey[] = ["rating", "year", "hours", "discount"];

/** Максимум жанров в свёрнутом виде и порог появления кнопки Show more. */
export const GENRES_COLLAPSED = 10;
export const GENRES_TOGGLE_THRESHOLD = 12;

export function detectPageType(pathname: string): MediaPageType | null {
	if (pathname.includes("/games")) return "games";
	if (pathname.includes("/anime")) return "anime";
	if (pathname.includes("/cinema")) return "cinema";
	return null;
}

/** Элементы текущей страницы с учётом выбранного типа (cinema: movie/show, anime: MOVIE/остальное). */
export function filterByKind<T extends FilterableItem>(
	all: T[],
	pageType: MediaPageType,
	kind: string,
): T[] {
	if (kind === "all") return all;
	if (pageType === "cinema") return all.filter((i) => i.kind === kind);
	if (pageType === "anime") {
		return all.filter((i) => {
			const isMovie = i.format === "MOVIE";
			return kind === "movie" ? isMovie : !isMovie;
		});
	}
	return all;
}

/** Счётчики статусов. Для игр Wishlist не входит в общий счётчик All. */
export function countByStatus(
	items: FilterableItem[],
	pageType: MediaPageType,
): Record<string, number> {
	const all =
		pageType === "games"
			? items.filter((i) => i.status !== "wishlist").length
			: items.length;
	const counts: Record<string, number> = { all };
	for (const item of items) {
		const s = item.status || "all";
		counts[s] = (counts[s] || 0) + 1;
	}
	return counts;
}

const GAME_STATUSES: [string, I18nKey, string][] = [
	[
		"playing",
		I18nKey.gamesStatusPlaying,
		"material-symbols:sports-esports-outline-rounded",
	],
	["completed", I18nKey.gamesStatusCompleted, "material-symbols:check-rounded"],
	[
		"backlog",
		I18nKey.gamesStatusBacklog,
		"material-symbols:hourglass-empty-rounded",
	],
	["onHold", I18nKey.animeStatusOnHold, "material-symbols:pause-rounded"],
	["dropped", I18nKey.animeStatusDropped, "material-symbols:close-rounded"],
	["wishlist", I18nKey.gamesStatusWishlist, "fa7-brands:steam"],
];

const VIDEO_STATUSES: [string, I18nKey, string][] = [
	[
		"watching",
		I18nKey.animeStatusWatching,
		"material-symbols:play-arrow-rounded",
	],
	["completed", I18nKey.animeStatusCompleted, "material-symbols:check-rounded"],
	[
		"planned",
		I18nKey.animeStatusPlanned,
		"material-symbols:bookmark-outline-rounded",
	],
	["onHold", I18nKey.animeStatusOnHold, "material-symbols:pause-rounded"],
	["dropped", I18nKey.animeStatusDropped, "material-symbols:close-rounded"],
];

export function buildStatusOptions(
	pageType: MediaPageType,
	counts: Record<string, number>,
): StatusOption[] {
	const rows = pageType === "games" ? GAME_STATUSES : VIDEO_STATUSES;
	return [
		{
			key: "all",
			label: i18n(I18nKey.mediaFilterAll),
			icon: "material-symbols:grid-view-rounded",
			count: counts.all ?? 0,
		},
		...rows.map(([key, label, icon]) => ({
			key,
			label: i18n(label),
			icon,
			count: counts[key] || 0,
		})),
	];
}

export function buildSortOptions(
	pageType: MediaPageType,
	selectedStatus: string,
): SortOption[] {
	const byTitle: SortOption = {
		key: "title",
		desc: false,
		label: `${i18n(I18nKey.mediaFilterTitle)} (A–Z)`,
		icon: "material-symbols:sort-by-alpha-rounded",
	};
	const byRating: SortOption = {
		key: "rating",
		desc: true,
		label: `${i18n(I18nKey.mediaFilterRating)} (10 → 1)`,
		icon: "material-symbols:star-outline-rounded",
	};

	if (pageType === "games") {
		if (selectedStatus === "wishlist") {
			return [
				{
					key: "default",
					desc: false,
					label: i18n(I18nKey.mediaFilterPriority),
					icon: "material-symbols:low-priority-rounded",
				},
				byTitle,
				{
					key: "price",
					desc: false,
					label: i18n(I18nKey.mediaFilterPrice),
					icon: "material-symbols:arrow-upward-rounded",
				},
				{
					key: "discount",
					desc: true,
					label: i18n(I18nKey.mediaFilterDiscount),
					icon: "material-symbols:percent-rounded",
				},
			];
		}
		return [
			byTitle,
			byRating,
			{
				key: "year",
				desc: true,
				label: i18n(I18nKey.mediaFilterYear),
				icon: "material-symbols:calendar-today-rounded",
			},
		];
	}

	return [
		byTitle,
		byRating,
		{
			key: "year",
			desc: true,
			label: i18n(I18nKey.mediaFilterYear),
			icon: "material-symbols:calendar-today-rounded",
		},
	];
}

export function isSortValid(
	options: SortOption[],
	sort: SortKey,
	desc: boolean,
): boolean {
	return options.some((o) => o.key === sort && o.desc === desc);
}

/** Жанры текущей выборки по убыванию популярности. */
export function collectGenres(
	items: FilterableItem[],
	pageType: MediaPageType,
	selectedStatus: string,
): GenreCount[] {
	const source =
		pageType === "games"
			? selectedStatus === "wishlist"
				? items.filter((i) => i.status === "wishlist")
				: selectedStatus !== "all"
					? items.filter((i) => i.status === selectedStatus)
					: items.filter((i) => i.status !== "wishlist")
			: selectedStatus !== "all"
				? items.filter((i) => i.status === selectedStatus)
				: items;
	const map: Record<string, number> = {};
	for (const item of source) {
		if (!Array.isArray(item.genres)) continue;
		for (const g of item.genres) {
			if (!g) continue;
			const clean = g.trim();
			map[clean] = (map[clean] || 0) + 1;
		}
	}
	return Object.entries(map)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Свёрнутый список жанров; выбранный скрытый жанр раскрывает список целиком. */
export function pickDisplayedGenres(
	genres: GenreCount[],
	expanded: boolean,
	selected: string | null,
	collapseLimit: number = GENRES_COLLAPSED,
): GenreCount[] {
	if (expanded || genres.length <= collapseLimit) return genres;
	const selectedHidden =
		selected && genres.slice(collapseLimit).some((g) => g.name === selected);
	return selectedHidden ? genres : genres.slice(0, collapseLimit);
}

/** Чтение состояния фильтра из query string. */
export function readFilterState(search: string): FilterState {
	const params = new URLSearchParams(search);
	const sort = (params.get("sort") as SortKey) || DEFAULT_SORT;
	const dir = params.get("dir");
	return {
		query: params.get("q") || "",
		kind: params.get("kind") || "all",
		status: params.get("status") || "all",
		genre: params.get("genre") || null,
		sort,
		desc:
			dir === "desc"
				? true
				: dir === "asc"
					? false
					: DESC_BY_DEFAULT.includes(sort),
	};
}

/** Запись состояния фильтра в query string (прочие параметры сохраняются). */
export function writeFilterParams(search: string, state: FilterState): string {
	const params = new URLSearchParams(search);

	if (state.query.trim()) params.set("q", state.query.trim());
	else params.delete("q");

	if (state.kind !== "all") params.set("kind", state.kind);
	else params.delete("kind");

	if (state.status !== "all") params.set("status", state.status);
	else params.delete("status");

	if (state.genre) params.set("genre", state.genre);
	else params.delete("genre");

	if (state.sort !== DEFAULT_SORT) {
		params.set("sort", state.sort);
		if (state.sort === "price" && state.desc) params.set("dir", "desc");
		else params.delete("dir");
	} else {
		params.delete("sort");
		params.delete("dir");
	}
	return params.toString();
}

export function hasActiveFilters(state: FilterState): boolean {
	return (
		state.query.trim() !== "" ||
		state.kind !== "all" ||
		state.status !== "all" ||
		state.genre !== null ||
		state.sort !== DEFAULT_SORT ||
		state.desc
	);
}
