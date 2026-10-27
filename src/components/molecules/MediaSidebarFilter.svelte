<script lang="ts">
/**
 * Боковой фильтр медиатеки (Anime, Cinema, Games) для сайдбара Shirone.
 * Молекула владеет состоянием и синхронизацией с URL/событиями, а UI собирает из:
 * MediaFilterSearch (поиск + Reset), MediaFilterTabs (тип медиа),
 * MediaFilterList (статусы, сортировка) и MediaFilterGenres (жанры).
 * Чистая логика (списки, счётчики, URL) находится в utils/media/filter.ts.
 */

import MediaFilterGenres from "@components/molecules/MediaFilterGenres.svelte";
import MediaFilterGroup from "@components/molecules/MediaFilterGroup.svelte";
import MediaFilterList from "@components/molecules/MediaFilterList.svelte";
import MediaFilterSearch from "@components/molecules/MediaFilterSearch.svelte";
import MediaFilterTabs from "@components/molecules/MediaFilterTabs.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	buildSortOptions,
	buildStatusOptions,
	collectGenres,
	countByStatus,
	DEFAULT_SORT,
	detectPageType,
	type FilterableItem,
	type FilterState,
	filterByKind,
	hasActiveFilters as hasActive,
	isSortValid,
	type MediaPageType,
	pickDisplayedGenres,
	readFilterState,
	type SortKey,
	writeFilterParams,
} from "@utils/media/filter";
import { onMount } from "svelte";

let {
	allItemsMap = {} as Record<string, FilterableItem[]>,
	isDrawer = false,
	showSearch = true,
	showTabs = true,
	showStatus = true,
	showSort = true,
	showGenres = true,
	showStatusCounts = true,
	showGenreCounts = true,
	genresCollapseAfter = 10,
	itemHeight = "2.25rem",
}: {
	allItemsMap?: Record<string, FilterableItem[]>;
	isDrawer?: boolean;
	showSearch?: boolean;
	showTabs?: boolean;
	showStatus?: boolean;
	showSort?: boolean;
	showGenres?: boolean;
	showStatusCounts?: boolean;
	showGenreCounts?: boolean;
	genresCollapseAfter?: number;
	itemHeight?: string;
} = $props();

let query = $state<string>("");
let selectedKind = $state<string>("all");
let selectedStatus = $state<string>("all");
let selectedSort = $state<SortKey>(DEFAULT_SORT);
let sortDesc = $state<boolean>(false);
let selectedGenre = $state<string | null>(null);
let isGenresExpanded = $state(false);

let pageType = $state<MediaPageType>("cinema");
let initialized = false;
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const currentItems = $derived(
	filterByKind(allItemsMap[pageType] || [], pageType, selectedKind),
);
const currentCounts = $derived(countByStatus(currentItems, pageType));

const statusItems = $derived(
	buildStatusOptions(pageType, currentCounts).map((o) => ({
		id: o.key,
		label: o.label,
		icon: o.icon,
		count: showStatusCounts ? o.count : undefined,
		active: selectedStatus === o.key,
	})),
);

const sortOptions = $derived(buildSortOptions(pageType, selectedStatus));
const sortItems = $derived(
	sortOptions.map((o) => ({
		id: `${o.key}:${o.desc}`,
		label: o.label,
		icon: o.icon,
		active: selectedSort === o.key && sortDesc === o.desc,
	})),
);

const kindTabs = $derived([
	{ key: "all", label: i18n(I18nKey.mediaFilterAll) },
	{ key: "movie", label: i18n(I18nKey.mediaFilterMovies) },
	{
		key: "show",
		label: pageType === "anime" ? "TV" : i18n(I18nKey.mediaFilterTvShows),
	},
]);

const availableGenres = $derived(
	collectGenres(currentItems, pageType, selectedStatus),
);
const displayedGenres = $derived(
	pickDisplayedGenres(availableGenres, isGenresExpanded, selectedGenre, genresCollapseAfter),
);

function currentState(): FilterState {
	return {
		query,
		kind: selectedKind,
		status: selectedStatus,
		sort: selectedSort,
		desc: sortDesc,
		genre: selectedGenre,
	};
}

const hasActiveFilters = $derived(hasActive(currentState()));

function applyState(state: FilterState) {
	query = state.query;
	selectedKind = state.kind;
	selectedStatus = state.status;
	selectedSort = state.sort;
	sortDesc = state.desc;
	selectedGenre = state.genre;
}

function reconcileSort() {
	if (!isSortValid(sortOptions, selectedSort, sortDesc)) {
		selectedSort = DEFAULT_SORT;
		sortDesc = false;
	}
}

function syncFromUrl() {
	if (typeof window === "undefined") return;
	applyState(readFilterState(window.location.search));
	const detected = detectPageType(window.location.pathname);
	if (detected) pageType = detected;
	reconcileSort();
}

function pushUrlParams() {
	if (!initialized || typeof window === "undefined") return;
	reconcileSort();

	const qs = writeFilterParams(window.location.search, currentState());
	history.replaceState(
		history.state,
		"",
		qs ? `?${qs}` : window.location.pathname,
	);

	// Оповещаем другие компоненты (например, MediaSection)
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

function onSearchInput() {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(pushUrlParams, 200);
}

function clearSearch() {
	query = "";
	pushUrlParams();
}

function selectKind(kind: string) {
	selectedKind = kind;
	pushUrlParams();
}

function selectStatus(status: string) {
	selectedStatus = status;
	selectedGenre = null;
	pushUrlParams();
}

function selectSort(id: string) {
	const option = sortOptions.find((o) => `${o.key}:${o.desc}` === id);
	if (!option) return;
	selectedSort = option.key;
	sortDesc = option.desc;
	pushUrlParams();
}

function toggleGenre(genre: string) {
	if (selectedGenre === genre) {
		selectedGenre = null;
	} else {
		selectedGenre = genre;
		selectedStatus = "all";
	}
	pushUrlParams();
}

function resetAll() {
	applyState({
		query: "",
		kind: "all",
		status: "all",
		sort: DEFAULT_SORT,
		desc: false,
		genre: null,
	});
	pushUrlParams();
}

onMount(() => {
	syncFromUrl();
	initialized = true;

	const onFilterUpdate = (e?: Event) => {
		const custom = e as CustomEvent;
		if (custom?.detail) {
			if (custom.detail.q !== undefined) query = custom.detail.q;
			if (custom.detail.kind !== undefined) selectedKind = custom.detail.kind;
			if (custom.detail.status !== undefined)
				selectedStatus = custom.detail.status;
			if (custom.detail.sort !== undefined) selectedSort = custom.detail.sort;
			if (custom.detail.desc !== undefined) sortDesc = custom.detail.desc;
			if (custom.detail.genre !== undefined)
				selectedGenre = custom.detail.genre;
		} else {
			syncFromUrl();
		}
	};

	window.addEventListener("shirone:media-filter-change", onFilterUpdate);
	window.addEventListener("popstate", onFilterUpdate);
	document.addEventListener("swup:content:replace", syncFromUrl);

	return () => {
		if (searchTimer) clearTimeout(searchTimer);
		window.removeEventListener("shirone:media-filter-change", onFilterUpdate);
		window.removeEventListener("popstate", onFilterUpdate);
		document.removeEventListener("swup:content:replace", syncFromUrl);
	};
});
</script>

<div
	class="media-sidebar-filter"
	class:media-sidebar-filter--drawer={isDrawer}
	style="--media-filter-item-height: {itemHeight};"
>
	{#if showSearch}
		<MediaFilterSearch
			bind:query
			{hasActiveFilters}
			oninput={onSearchInput}
			onclear={clearSearch}
			onreset={resetAll}
		/>
	{/if}

	{#if showTabs && (pageType === "cinema" || pageType === "anime")}
		<MediaFilterGroup title={i18n(I18nKey.mediaFilterMediaType)}>
			<MediaFilterTabs
				options={kindTabs}
				selected={selectedKind}
				onselect={selectKind}
			/>
		</MediaFilterGroup>
	{/if}

	{#if showStatus}
		<MediaFilterGroup title={i18n(I18nKey.mediaFilterStatus)}>
			<MediaFilterList items={statusItems} onselect={selectStatus} />
		</MediaFilterGroup>
	{/if}

	{#if showSort}
		<MediaFilterGroup title={i18n(I18nKey.mediaFilterSort)}>
			<MediaFilterList items={sortItems} onselect={selectSort} />
		</MediaFilterGroup>
	{/if}

	{#if showGenres && availableGenres.length > 0}
		<MediaFilterGroup title={i18n(I18nKey.mediaFilterGenres)}>
			<MediaFilterGenres
				genres={availableGenres}
				displayed={displayedGenres}
				selected={selectedGenre}
				showCounts={showGenreCounts}
				collapseThreshold={genresCollapseAfter}
				bind:expanded={isGenresExpanded}
				ontoggle={toggleGenre}
			/>
		</MediaFilterGroup>
	{/if}
</div>

<style lang="stylus">
.media-sidebar-filter
	display: flex
	flex-direction: column
	gap: 1.15rem
	width: 100%
	padding-bottom: 0.5rem
</style>
