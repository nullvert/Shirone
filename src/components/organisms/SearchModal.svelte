<script lang="ts">
/**
 * SearchModal.svelte
 * Полноэкранное / плавающее Spotlight модальное окно поиска (M3 Floating Spotlight Modal).
 * Расположено на корневом уровне макета (MainGridLayout.astro), вне скрытых хедеров.
 * Открывается:
 *   - по кнопке 🔍 в BottomAppBar (мобильные / планшеты)
 *   - по клику на поиск в TopAppBar / кнопке мобильного поиска
 *   - по глобальным событиям "search:open" / "search:toggle"
 *   - по шорткату Ctrl+K / Cmd+K
 */

import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils";
import { onMount, tick } from "svelte";
import type { SearchResult } from "@/global";

let open = $state(false);
let query = $state("");
let result = $state<SearchResult[]>([]);
let isSearching = $state(false);
let pagefindLoaded = $state(false);
let initialized = $state(false);
let inputEl = $state<HTMLInputElement | null>(null);

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

async function performSearch(keyword: string): Promise<void> {
	if (!keyword.trim()) {
		result = [];
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD) {
			if (
				!window.pagefind &&
				typeof (
					window as unknown as { __loadPagefind?: () => Promise<unknown> }
				).__loadPagefind === "function"
			) {
				await (
					window as unknown as { __loadPagefind: () => Promise<unknown> }
				).__loadPagefind();
			}
			pagefindLoaded = typeof window.pagefind?.search === "function";
			if (pagefindLoaded && window.pagefind) {
				const response = await window.pagefind.search(keyword);
				searchResults = await Promise.all(
					response.results.map((item) => item.data()),
				);
			} else {
				searchResults = [];
				console.error("Pagefind is not available in production environment.");
			}
		} else {
			searchResults = fakeResult;
		}

		result = searchResults;
	} catch (error) {
		console.error("Search error:", error);
		result = [];
	} finally {
		isSearching = false;
	}
}

function openModal() {
	open = true;
	if (
		typeof (window as unknown as { __loadPagefind?: () => Promise<unknown> })
			.__loadPagefind === "function"
	) {
		void (
			window as unknown as { __loadPagefind: () => Promise<unknown> }
		).__loadPagefind();
	}
	void tick().then(() => {
		setTimeout(() => {
			inputEl?.focus();
			if (query.trim()) {
				void performSearch(query);
			}
		}, 50);
	});
}

function closeModal() {
	open = false;
}

function toggleModal() {
	if (open) {
		closeModal();
	} else {
		openModal();
	}
}

function handleKeyDown(e: KeyboardEvent) {
	if (e.key === "Escape" && open) {
		e.preventDefault();
		closeModal();
	} else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
		e.preventDefault();
		toggleModal();
	}
}

onMount(() => {
	initialized = true;

	const handleOpen = () => openModal();
	const handleToggle = () => toggleModal();
	const handleClose = () => closeModal();

	document.addEventListener("search:open", handleOpen);
	document.addEventListener("search:toggle", handleToggle);
	document.addEventListener("search:close", handleClose);
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("swup:content:replace", handleClose);

	return () => {
		document.removeEventListener("search:open", handleOpen);
		document.removeEventListener("search:toggle", handleToggle);
		document.removeEventListener("search:close", handleClose);
		document.removeEventListener("keydown", handleKeyDown);
		document.removeEventListener("swup:content:replace", handleClose);
	};
});

$effect(() => {
	if (open && initialized) {
		void performSearch(query);
	}
});
</script>

{#if open}
	<div
		class="search-modal-backdrop fixed inset-0 z-[100] flex flex-col items-center justify-start pt-16 sm:pt-24 px-4 sm:px-6"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) closeModal();
		}}
	>
		<!-- Spotlight Modal Container -->
		<div
			class="search-modal-card relative w-full max-w-2xl flex flex-col overflow-hidden rounded-2xl bg-[color-mix(in_oklab,var(--surface-container-high)_85%,transparent)] text-[var(--on-surface)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] ring-1 ring-[color-mix(in_oklab,var(--on-surface)_10%,transparent)]"
			role="dialog"
			aria-modal="true"
			aria-label={i18n(I18nKey.search)}
		>
			<!-- Ambient Primary Top Glow -->
			<div class="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-[radial-gradient(ellipse,color-mix(in_oklab,var(--primary)_28%,transparent)_0%,transparent_70%)]"></div>

			<!-- Top Search Input Header -->
			<div class="relative flex items-center gap-3.5 px-5 py-4 bg-[color-mix(in_oklab,var(--surface-container)_60%,transparent)]">
				<Icon icon="material-symbols:search-rounded" class="text-2xl text-[var(--primary)] shrink-0 opacity-90" />
				<input
					bind:this={inputEl}
					bind:value={query}
					type="text"
					placeholder="{i18n(I18nKey.search)}..."
					class="w-full bg-transparent text-base sm:text-lg font-medium text-[var(--on-surface)] placeholder-[color-mix(in_oklab,var(--on-surface-variant)_70%,transparent)] outline-none border-none caret-[var(--primary)] tracking-wide"
					autocomplete="off"
					spellcheck="false"
				/>
				{#if query}
					<button
						type="button"
						class="shrink-0 p-1 rounded-md text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[color-mix(in_oklab,var(--on-surface)_8%,transparent)] transition"
						onclick={() => { query = ""; inputEl?.focus(); }}
						aria-label="Clear"
					>
						<Icon icon="material-symbols:close-rounded" class="text-lg" />
					</button>
				{/if}
				<div class="flex items-center gap-1 shrink-0 select-none">
					<kbd class="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-[color-mix(in_oklab,var(--on-surface)_8%,transparent)] text-[var(--on-surface-variant)] border border-[color-mix(in_oklab,var(--on-surface)_12%,transparent)]">ESC</kbd>
				</div>
			</div>

			<!-- Search Results Body -->
			<div class="search-modal-results max-h-[55vh] overflow-y-auto overscroll-contain px-2.5 py-3 space-y-1">
				{#if isSearching}
					<div class="py-12 text-center text-sm text-[var(--on-surface-variant)] flex flex-col items-center justify-center gap-2.5">
						<Icon icon="line-md:loading-loop" class="text-2xl text-[var(--primary)]" />
						<span class="tracking-wide text-xs uppercase font-medium opacity-80">{i18n(I18nKey.search)}...</span>
					</div>
				{:else if query.trim() && result.length === 0}
					<div class="py-14 text-center text-sm text-[var(--on-surface-variant)] flex flex-col items-center justify-center gap-2">
						<Icon icon="material-symbols:search-off-rounded" class="text-3xl opacity-50 mb-1" />
						<div class="font-semibold text-base text-[var(--on-surface)]">{i18n(I18nKey.compassNoResults)}</div>
						<div class="text-xs opacity-60">{i18n(I18nKey.searchTryDifferent)}</div>
					</div>
				{:else if result.length > 0}
					{#each result as item (item.url + item.meta.title)}
						<a
							href={item.url}
							class="search-modal-item group flex flex-col p-3 rounded-xl transition duration-150 hover:bg-[color-mix(in_oklab,var(--primary)_12%,transparent)]"
							onclick={closeModal}
						>
							<div class="flex items-center justify-between gap-3 font-semibold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition">
								<span class="text-sm sm:text-base truncate tracking-tight">{item.meta.title}</span>
								<Icon icon="material-symbols:arrow-forward-rounded" class="text-base shrink-0 opacity-0 group-hover:opacity-100 transition transform -translate-x-1 group-hover:translate-x-0" />
							</div>
							{#if item.excerpt}
								<div class="search-modal-excerpt text-xs sm:text-sm text-[var(--on-surface-variant)] line-clamp-2 mt-1 leading-relaxed">
									{@html item.excerpt}
								</div>
							{/if}
						</a>
					{/each}
				{:else}
					<!-- Clean, Premium Empty State -->
					<div class="py-12 px-6 flex flex-col items-center justify-center text-center select-none">
						<div class="w-12 h-12 rounded-xl flex items-center justify-center bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] text-[var(--primary)] mb-3">
							<Icon icon="material-symbols:search-rounded" class="text-2xl" />
						</div>
						<div class="text-sm font-medium text-[var(--on-surface)]">{i18n(I18nKey.searchEmptyPrompt)}</div>
						<div class="text-xs text-[var(--on-surface-variant)] opacity-70 mt-1 max-w-xs">
							{i18n(I18nKey.searchEmptyHint)}
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer Bar (Raycast / Linear style hints) -->
			<div class="hidden sm:flex items-center justify-between px-5 py-2.5 bg-[color-mix(in_oklab,var(--surface-container-highest)_25%,transparent)] text-[11px] text-[var(--on-surface-variant)] opacity-80 border-t border-[color-mix(in_oklab,var(--on-surface)_6%,transparent)] select-none">
				<div class="flex items-center gap-3">
					<span class="flex items-center gap-1"><kbd class="px-1 py-0.5 rounded bg-[color-mix(in_oklab,var(--on-surface)_8%,transparent)] font-mono text-[9px]">↵</kbd> {i18n(I18nKey.searchSelect)}</span>
					<span class="flex items-center gap-1"><kbd class="px-1 py-0.5 rounded bg-[color-mix(in_oklab,var(--on-surface)_8%,transparent)] font-mono text-[9px]">ESC</kbd> {i18n(I18nKey.searchClose)}</span>
				</div>
				<div class="flex items-center gap-1 font-mono text-[10px] opacity-70">
					<span>Spotlight</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
.search-modal-backdrop {
  background: color-mix(in oklab, var(--mc-scrim, #000) 50%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: modal-fade-in var(--m3e-duration-short) var(--m3e-easing-standard) forwards;
}
.search-modal-card {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  opacity: 1;
  animation: modal-scale-in var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate) forwards;
}
.search-modal-card input::-webkit-search-cancel-button,
.search-modal-card input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}
.search-modal-excerpt :global(mark) {
  background: transparent;
  color: var(--primary);
  font-weight: 700;
}
@-moz-keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-o-keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-moz-keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(-6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@-webkit-keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(-6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@-o-keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(-6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(-6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
