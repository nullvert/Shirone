<script lang="ts">
/**
 * BookmarksSidebarFilter - боковой фильтр для закладок (поиск и список разделов с бейджами).
 * Использует дизайн-систему сайдбара и компоненты MediaFilterGroup / MediaFilterSearch / MediaFilterList.
 * Взаимодействует с BookmarksSection через события и URL параметры ?q= & ?group=.
 */
import MediaFilterGroup from "@components/molecules/MediaFilterGroup.svelte";
import MediaFilterList from "@components/molecules/MediaFilterList.svelte";
import MediaFilterSearch from "@components/molecules/MediaFilterSearch.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";
import type { BookmarkShelf } from "@/data/bookmarks";

let {
	shelves = [] as BookmarkShelf[],
	isDrawer = false,
	itemHeight = "2.6rem",
}: {
	shelves?: BookmarkShelf[];
	isDrawer?: boolean;
	itemHeight?: string;
} = $props();

let query = $state("");
let selectedGroup = $state("");
let initialized = false;

const totalItems = $derived(
	shelves.reduce((sum, s) => sum + s.entries.length, 0),
);

const listItems = $derived([
	{
		id: "",
		label: i18n(I18nKey.bookmarksAllSections),
		icon: "material-symbols:folder-outline-rounded",
		active: selectedGroup === "",
		count: totalItems,
	},
	...shelves.map((s) => ({
		id: s.key,
		label: s.name,
		icon: s.icon || "material-symbols:folder-outline-rounded",
		active: selectedGroup === s.key,
		count: s.entries.length,
	})),
]);

const hasActiveFilters = $derived(Boolean(query.trim() || selectedGroup));

function emitChange() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent("shirone:bookmarks-filter-change", {
			detail: { query: query.trim(), group: selectedGroup },
		}),
	);
}

function syncUrl() {
	if (!initialized || typeof window === "undefined") return;
	const params = new URLSearchParams(window.location.search);
	params.delete("q");
	params.delete("group");
	if (query.trim()) params.set("q", query.trim());
	if (selectedGroup) params.set("group", selectedGroup);
	const search = params.toString();
	const next = search
		? `${window.location.pathname}?${search}`
		: window.location.pathname;
	window.history.replaceState(null, "", next);
	emitChange();
}

function onSearchInput() {
	syncUrl();
}

function clearSearch() {
	query = "";
	syncUrl();
}

function resetAll() {
	query = "";
	selectedGroup = "";
	syncUrl();
}

function onSelectGroup(id: string) {
	selectedGroup = id;
	syncUrl();
}

onMount(() => {
	const params = new URLSearchParams(window.location.search);
	query = params.get("q") ?? "";
	selectedGroup = params.get("group") ?? "";
	initialized = true;

	const handleExternalUpdate = (e: Event) => {
		const detail = (e as CustomEvent)?.detail;
		if (detail) {
			if (detail.query !== undefined) query = detail.query;
			if (detail.group !== undefined) selectedGroup = detail.group;
		}
	};

	window.addEventListener(
		"shirone:bookmarks-filter-sync",
		handleExternalUpdate,
	);
	return () => {
		window.removeEventListener(
			"shirone:bookmarks-filter-sync",
			handleExternalUpdate,
		);
	};
});
</script>

<div
	class="bookmarks-sidebar-filter"
	class:bookmarks-sidebar-filter--drawer={isDrawer}
	style="--media-filter-item-height: {itemHeight};"
>
	<!-- Строка поиска -->
	<MediaFilterSearch
		bind:query
		{hasActiveFilters}
		oninput={onSearchInput}
		onclear={clearSearch}
		onreset={resetAll}
	/>

	<!-- Разделы -->
	<MediaFilterGroup title={i18n(I18nKey.bookmarksSectionsTitle)}>
		<MediaFilterList items={listItems} onselect={onSelectGroup} />
	</MediaFilterGroup>
</div>

<style>
.bookmarks-sidebar-filter {
	display: flex;
	flex-direction: column;
	gap: 1.15rem;
	width: 100%;
}
</style>
