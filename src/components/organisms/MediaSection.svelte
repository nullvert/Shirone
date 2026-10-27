<script lang="ts">
/**
 * Сетка медиа-коллекции (Чистый контент в центральной колонке):
 * - Сетка постеров (2:3 aspect ratio) на всю ширину контентной области;
 * - Фильтрация и сортировка берутся из URL search params;
 * - Реагирует на событие "shirone:media-filter-change" от бокового виджета MediaFilter;
 * - Никаких лишних сайдбаров или плашек внутри компонента.
 */

import Icon from "@components/atoms/display/Icon.svelte";
import MediaPosterCard from "@components/molecules/MediaPosterCard.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";
import type { MediaItem, MediaKind } from "@/types/media";

let {
	items = [] as MediaItem[],
}: {
	items?: MediaItem[];
} = $props();

let query = $state("");
let selectedKind = $state<"all" | MediaKind>("all");
let selectedStatus = $state<string>("all");
type SortKey = "title" | "rating" | "default" | "price" | "year" | "hours" | "discount";
let selectedSort = $state<SortKey>("title");
let sortDesc = $state(false);
let selectedGenre = $state<string | null>(null);
let pageType = $state<"anime" | "cinema" | "games">("cinema");
let initialized = false;

function detectPageType() {
	if (typeof window === "undefined") return;
	const p = window.location.pathname;
	if (p.includes("/games")) pageType = "games";
	else if (p.includes("/anime")) pageType = "anime";
	else pageType = "cinema";
}

interface SortOption {
	key: SortKey;
	label: string;
	icon: string;
	allowDir: boolean;
}

// Доступные опции сортировки
const sortOptions = $derived.by((): SortOption[] => {
	if (pageType === "games") {
		if (selectedStatus === "wishlist") {
			return [
				{
					key: "default",
					label: i18n(I18nKey.mediaFilterPriority),
					icon: "material-symbols:low-priority-rounded",
					allowDir: false,
				},
				{
					key: "title",
					label: i18n(I18nKey.mediaFilterTitle),
					icon: "material-symbols:sort-by-alpha-rounded",
					allowDir: false,
				},
				{
					key: "price",
					label: i18n(I18nKey.mediaFilterPrice),
					icon: "material-symbols:arrow-upward-rounded",
					allowDir: false,
				},
				{
					key: "discount",
					label: i18n(I18nKey.mediaFilterDiscount),
					icon: "material-symbols:percent-rounded",
					allowDir: false,
				},
			];
		}
		return [
			{
				key: "title",
				label: i18n(I18nKey.mediaFilterTitle),
				icon: "material-symbols:sort-by-alpha-rounded",
				allowDir: false,
			},
			{
				key: "rating",
				label: i18n(I18nKey.mediaFilterRating),
				icon: "material-symbols:star-outline-rounded",
				allowDir: false,
			},
			{
				key: "hours",
				label: i18n(I18nKey.mediaFilterPlaytime),
				icon: "material-symbols:schedule-rounded",
				allowDir: false,
			},
		];
	}

	return [
		{
			key: "title",
			label: i18n(I18nKey.mediaFilterTitle),
			icon: "material-symbols:sort-by-alpha-rounded",
			allowDir: false,
		},
		{
			key: "rating",
			label: i18n(I18nKey.mediaFilterRating),
			icon: "material-symbols:star-outline-rounded",
			allowDir: false,
		},
		{
			key: "year",
			label: i18n(I18nKey.mediaFilterYear),
			icon: "material-symbols:calendar-today-rounded",
			allowDir: false,
		},
	];
});

// Проверка наличия активных фильтров (для отображения кнопки Reset)
const hasActiveFilters = $derived.by(() => {
	if (query.trim() !== "") return true;
	if (selectedStatus !== "all") return true;
	if (selectedKind !== "all") return true;
	if (selectedGenre !== null) return true;
	if (selectedSort !== "title") return true;
	if (sortDesc) return true;
	return false;
});

function reconcileSort() {
	const validKeys = sortOptions.map((o) => o.key);
	if (!validKeys.includes(selectedSort)) {
		selectedSort = "title";
		sortDesc = false;
	}
}

function syncFromUrl() {
	if (typeof window === "undefined") return;
	const params = new URLSearchParams(window.location.search);
	query = params.get("q") || "";
	const k = params.get("kind");
	if (k === "movie" || k === "show" || k === "game") selectedKind = k;
	else selectedKind = "all";
	selectedStatus = params.get("status") || "all";
	selectedSort = (params.get("sort") as SortKey) || "title";
	selectedGenre = params.get("genre") || null;

	detectPageType();
	reconcileSort();

	const dir = params.get("dir");
	if (dir === "desc") sortDesc = true;
	else if (dir === "asc") sortDesc = false;
	else {
		sortDesc = ["rating", "year", "hours", "discount"].includes(selectedSort);
	}
}

function pushUrlParams() {
	if (!initialized || typeof window === "undefined") return;
	reconcileSort();

	const params = new URLSearchParams(window.location.search);

	if (query.trim()) params.set("q", query.trim());
	else params.delete("q");

	if (selectedKind !== "all") params.set("kind", selectedKind);
	else params.delete("kind");

	if (selectedStatus !== "all") params.set("status", selectedStatus);
	else params.delete("status");

	if (selectedGenre) params.set("genre", selectedGenre);
	else params.delete("genre");

	if (selectedSort !== "title") {
		params.set("sort", selectedSort);
		if (selectedSort === "price" && sortDesc) {
			params.set("dir", "desc");
		} else {
			params.delete("dir");
		}
	} else {
		params.delete("sort");
		params.delete("dir");
	}

	const qs = params.toString();
	const newUrl = qs ? `?${qs}` : window.location.pathname;
	history.replaceState(history.state, "", newUrl);

	// Оповещаем другие компоненты (например, сайдбар)
	window.dispatchEvent(
		new CustomEvent("shirone:media-filter-change", {
			detail: {
				q: query.trim(),
				kind: selectedKind,
				status: selectedStatus,
				sort: selectedSort,
				desc: sortDesc,
				genre: selectedGenre,
			},
		}),
	);
}

function resetAll() {
	query = "";
	selectedKind = "all";
	selectedStatus = "all";
	selectedGenre = null;
	selectedSort = "title";
	sortDesc = false;
	pushUrlParams();
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => {
		pushUrlParams();
	}, 200);
}

function clearSearch() {
	query = "";
	pushUrlParams();
}

function onSortClick(key: SortKey, allowDir = false) {
	if (selectedSort === key) {
		if (allowDir) {
			sortDesc = !sortDesc;
		}
	} else {
		selectedSort = key;
		sortDesc = key === "rating";
	}
	pushUrlParams();
}

const displayItems = $derived.by(() => {
	// Сохраняем исходный порядок из props
	const indexedItems = items.map((item, idx) => ({ item, originalIndex: idx }));

	let filtered = indexedItems.filter(({ item }) => {
		if (selectedKind !== "all") {
			if (pageType === "anime") {
				const isMovie = item.format === "MOVIE";
				if (selectedKind === "movie" && !isMovie) return false;
				if (selectedKind === "show" && isMovie) return false;
			} else if (item.kind && item.kind !== selectedKind) {
				return false;
			}
		}
		if (selectedStatus !== "all") {
			if (item.status !== selectedStatus) return false;
		} else if (pageType === "games" && item.status === "wishlist") {
			// В играх Wishlist — отдельный список желаемого, не входящий во вкладку All
			return false;
		}
		// Фильтр по жанру
		if (selectedGenre) {
			const hasGenre = item.genres.some(
				(g) => g.toLowerCase() === selectedGenre?.toLowerCase(),
			);
			if (!hasGenre) return false;
		}
		// Поиск по названию, автору/студии, жанрам
		if (query.trim()) {
			const q = query.trim().toLowerCase();
			const matchTitle = item.title.toLowerCase().includes(q);
			const matchAuthor = item.authorOrStudio?.toLowerCase().includes(q);
			const matchGenres = item.genres.some((g) => g.toLowerCase().includes(q));
			if (!matchTitle && !matchAuthor && !matchGenres) {
				return false;
			}
		}
		return true;
	});

	filtered.sort(
		({ item: a, originalIndex: idxA }, { item: b, originalIndex: idxB }) => {
			// 1. По алфавиту: всегда строго от A до Z
			if (selectedSort === "title") {
				return a.title.localeCompare(b.title, undefined, {
					sensitivity: "base",
				});
			}

			// 2. По оценке: лучший рейтинг сверху (10 -> 1).
			// Элементы без оценки НЕ удаляются из списка, а аккуратно располагаются в конце!
			if (selectedSort === "rating") {
				const hasA = typeof a.rating === "number";
				const hasB = typeof b.rating === "number";
				if (hasA && hasB) {
					const diff = (b.rating as number) - (a.rating as number);
					if (diff !== 0) return diff;
					return a.title.localeCompare(b.title, undefined, {
						sensitivity: "base",
					});
				}
				if (hasA && !hasB) return -1;
				if (!hasA && hasB) return 1;
				return a.title.localeCompare(b.title, undefined, {
					sensitivity: "base",
				});
			}

			// 3. По приоритету (Wishlist): #1 -> #2 -> #3...
			if (selectedSort === "default") {
				if (a.rank !== undefined && b.rank !== undefined) {
					const rA =
						typeof a.rank === "number"
							? a.rank
							: Number.parseInt(String(a.rank).replace("#", ""), 10) || 999;
					const rB =
						typeof b.rank === "number"
							? b.rank
							: Number.parseInt(String(b.rank).replace("#", ""), 10) || 999;
					return rA - rB;
				}
				if (a.rank !== undefined && b.rank === undefined) return -1;
				if (a.rank === undefined && b.rank !== undefined) return 1;
				return idxA - idxB;
			}

			// 4. По цене (Lowest first)
			if (selectedSort === "price") {
				const parsePrice = (p?: { amount?: string; isFree?: boolean }) => {
					if (!p || p.isFree) return 0;
					const clean = p.amount ? p.amount.replace(/[^0-9.]/g, "") : "0";
					return Number.parseFloat(clean) || 0;
				};
				const pA = parsePrice(a.price);
				const pB = parsePrice(b.price);
				const res = pA - pB;
				if (res !== 0) return res;
				return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
			}

			// 5. По дате / году выхода (Release Year: Newest first)
			if (selectedSort === "year") {
				const yA = a.year ? Number.parseInt(String(a.year).slice(0, 4), 10) || 0 : 0;
				const yB = b.year ? Number.parseInt(String(b.year).slice(0, 4), 10) || 0 : 0;
				if (yA !== 0 && yB !== 0) {
					const diff = yB - yA;
					if (diff !== 0) return diff;
					return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
				}
				if (yA !== 0 && yB === 0) return -1;
				if (yA === 0 && yB !== 0) return 1;
				return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
			}

			// 6. По времени игры (Playtime: Most Played first)
			if (selectedSort === "hours") {
				const hA = typeof a.hours === "number" ? a.hours : 0;
				const hB = typeof b.hours === "number" ? b.hours : 0;
				if (hA !== 0 && hB !== 0) {
					const diff = hB - hA;
					if (diff !== 0) return diff;
					return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
				}
				if (hA !== 0 && hB === 0) return -1;
				if (hA === 0 && hB !== 0) return 1;
				return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
			}

			// 7. По скидке (Biggest Discount (%) first со вторичной сортировкой по rank)
			if (selectedSort === "discount") {
				const dA = a.price?.discountPercent ?? 0;
				const dB = b.price?.discountPercent ?? 0;
				if (dA !== dB) {
					return dB - dA;
				}
				// Вторичная сортировка по Steam priority rank:
				if (a.rank !== undefined && b.rank !== undefined) {
					const rA =
						typeof a.rank === "number"
							? a.rank
							: Number.parseInt(String(a.rank).replace("#", ""), 10) || 999;
					const rB =
						typeof b.rank === "number"
							? b.rank
							: Number.parseInt(String(b.rank).replace("#", ""), 10) || 999;
					if (rA !== rB) return rA - rB;
				} else if (a.rank !== undefined) {
					return -1;
				} else if (b.rank !== undefined) {
					return 1;
				}
				return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
			}

			return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
		},
	);

	return filtered.map(({ item }) => item);
});

onMount(() => {
	syncFromUrl();
	initialized = true;

	const onFilterChange = (e?: Event) => {
		const custom = e as CustomEvent;
		if (custom?.detail) {
			if (custom.detail.kind !== undefined) selectedKind = custom.detail.kind;
			if (custom.detail.status !== undefined) {
				selectedStatus = custom.detail.status;
				reconcileSort();
			}
			if (custom.detail.genre !== undefined)
				selectedGenre = custom.detail.genre;
			if (custom.detail.q !== undefined) query = custom.detail.q;
			if (custom.detail.sort !== undefined)
				selectedSort = custom.detail.sort as SortKey;
			if (custom.detail.desc !== undefined) sortDesc = custom.detail.desc;
		} else {
			syncFromUrl();
		}
	};

	window.addEventListener("shirone:media-filter-change", onFilterChange);
	window.addEventListener("popstate", onFilterChange);
	document.addEventListener("swup:content:replace", syncFromUrl);

	return () => {
		window.removeEventListener("shirone:media-filter-change", onFilterChange);
		window.removeEventListener("popstate", onFilterChange);
		document.removeEventListener("swup:content:replace", syncFromUrl);
		if (searchTimer) clearTimeout(searchTimer);
	};
});
</script>

<div class="media-section">
	{#if displayItems.length > 0}
		<div class="media-grid">
			{#each displayItems as item, index (item.id)}
				<MediaPosterCard {item} delay={Math.min(index * 20, 250)} />
			{/each}
		</div>
	{:else}
		<div class="media-section__empty">
			<Icon icon="material-symbols:search-off-rounded" />
			<p>
				{#if pageType === "games"}
					{i18n(I18nKey.gamesNoResults)}
				{:else if pageType === "anime"}
					{i18n(I18nKey.animeNoResults)}
				{:else}
					{i18n(I18nKey.cinemaNoResults)}
				{/if}
			</p>
		</div>
	{/if}
</div>

<style lang="stylus">
.media-section
	display: flex
	flex-direction: column
	width: 100%

/* Верхняя строка управления над сеткой постеров (единая карточка в стиле темы) */
/* Пустое состояние */
.media-section__empty
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	padding: 4rem 1rem
	color: var(--on-surface-variant)
	gap: 0.5rem
	> :global(svg)
		width: 3rem
		height: 3rem
		opacity: 0.5

/* Пустое состояние */
.media-section__empty
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	padding: 4rem 1rem
	color: var(--on-surface-variant)
	gap: 0.5rem
	> :global(svg)
		width: 3rem
		height: 3rem
		opacity: 0.5

.media-grid
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))
	gap: 1rem
	padding: 4px 6px
	box-sizing: border-box

	@media (min-width: 640px)
		grid-template-columns: repeat(auto-fill, minmax(185px, 1fr))
		gap: 1.125rem

	@media (min-width: 1024px)
		grid-template-columns: repeat(auto-fill, minmax(215px, 1fr))
		gap: 1.25rem

	@media (min-width: 1440px)
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr))
		gap: 1.5rem
</style>
