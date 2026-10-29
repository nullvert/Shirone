<script lang="ts">
/**
 * BookmarksSection — основной контентный компонент страницы закладок:
 * - Рендерит секции с чистыми заголовками и токенами M3E [Утилиты и софт (3)]
 * - Сетка карточек BookmarkCard
 * - Слушает событие "shirone:bookmarks-filter-change" от бокового сайдбар-виджета BookmarksFilter
 */
import BookmarkCard from "@components/molecules/BookmarkCard.svelte";
import Icon from "@iconify/svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { onMount } from "svelte";
import type { BookmarkShelf } from "@/data/bookmarks";

let {
	shelves = [] as BookmarkShelf[],
	title = i18n(I18nKey.compass),
	subtitle = i18n(I18nKey.compassBanner),
}: {
	shelves?: BookmarkShelf[];
	title?: string;
	subtitle?: string;
} = $props();

let query = $state("");
let selectedGroup = $state("");
let initialized = false;

function hostOf(href: string): string {
	try {
		return new URL(href).hostname;
	} catch {
		return href;
	}
}

/** Фильтрация по поиску и выбранному разделу */
const filteredShelves = $derived.by(() => {
	const normalizedQuery = query.trim().toLowerCase();
	return shelves
		.filter((shelf) => !selectedGroup || shelf.key === selectedGroup)
		.map((shelf) => ({
			...shelf,
			entries: normalizedQuery
				? shelf.entries.filter((entry) =>
						[entry.label, entry.note ?? "", hostOf(entry.href)]
							.join(" ")
							.toLowerCase()
							.includes(normalizedQuery),
					)
				: shelf.entries,
		}))
		.filter((shelf) => shelf.entries.length > 0);
});

onMount(() => {
	const params = new URLSearchParams(window.location.search);
	query = params.get("q") ?? "";
	selectedGroup = params.get("group") ?? "";
	initialized = true;

	const handleFilterChange = (e: Event) => {
		const detail = (e as CustomEvent)?.detail;
		if (detail) {
			if (detail.query !== undefined) query = detail.query;
			if (detail.group !== undefined) selectedGroup = detail.group;
		}
	};

	window.addEventListener("shirone:bookmarks-filter-change", handleFilterChange);
	return () => {
		window.removeEventListener("shirone:bookmarks-filter-change", handleFilterChange);
	};
});
</script>

<div class="bookmarks-container">
	{#if filteredShelves.length > 0}
		<div class="bookmarks-shelves">
			{#each filteredShelves as shelf (shelf.key)}
				<section class="bookmarks-shelf" data-shelf={shelf.key}>
					<header class="bookmarks-shelf__header">
						<h2 class="bookmarks-shelf__title">{shelf.name}</h2>
						<span class="bookmarks-shelf__badge">{shelf.entries.length}</span>
					</header>

					<div class="bookmarks-shelf__grid">
						{#each shelf.entries as entry, idx (entry.href)}
							<BookmarkCard {entry} delay={idx * 25} />
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{:else}
		<div class="bookmarks-empty">
			<Icon icon="material-symbols:search-off-rounded" width="48" height="48" />
			<p>{i18n(I18nKey.compassNoResults)}</p>
		</div>
	{/if}
</div>

<style>
.bookmarks-container {
	width: 100%;
}

.bookmarks-shelves {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.bookmarks-shelf__header {
	display: flex;
	align-items: center;
	gap: 0.65rem;
	margin-bottom: 1rem;
}

.bookmarks-shelf__title {
	font-size: 1.2rem;
	font-weight: 700;
	color: var(--on-surface);
	margin: 0;
	letter-spacing: -0.01em;
}

.bookmarks-shelf__badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 0.75rem;
	font-weight: 600;
	padding: 0 0.45rem;
	min-width: 1.35rem;
	height: 1.35rem;
	border-radius: var(--shape-corner-full);
	background: var(--surface-container-high);
	color: var(--on-surface-variant);
}

.bookmarks-shelf__grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 0.85rem;
}

.bookmarks-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	padding: 4rem 1rem;
	color: var(--on-surface-variant);
	text-align: center;
}
</style>
