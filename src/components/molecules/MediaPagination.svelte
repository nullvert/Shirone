<script lang="ts">
/**
 * MediaPagination — M3E фирменная пагинация в точном стиле темы Shirone.
 * Строго повторяет дизайн PagePagination (M3 State Layers, primary active, чистые стрелки).
 */
import Icon from "@components/atoms/display/Icon.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

let {
	currentPage = 1,
	totalPages = 1,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	totalItems?: number;
	pageSize?: number;
	onPageChange: (page: number) => void;
} = $props();

const adjacent = 2;
const VISIBLE = adjacent * 2 + 1;

// Генерация страниц по тому же строгому алгоритму темы
const pageList = $derived.by(() => {
	let count = 1;
	let l = currentPage;
	let r = currentPage;
	while (0 < l - 1 && r + 1 <= totalPages && count + 2 <= VISIBLE) {
		count += 2;
		l--;
		r++;
	}
	while (0 < l - 1 && count < VISIBLE) {
		count++;
		l--;
	}
	while (r + 1 <= totalPages && count < VISIBLE) {
		count++;
		r++;
	}

	const pages: (number | "...")[] = [];
	if (l > 1) pages.push(1);
	if (l === 3) pages.push(2);
	if (l > 3) pages.push("...");
	for (let i = l; i <= r; i++) pages.push(i);
	if (r < totalPages - 2) pages.push("...");
	if (r === totalPages - 2) pages.push(totalPages - 1);
	if (r < totalPages) pages.push(totalPages);

	return pages;
});

function goTo(p: number) {
	if (p < 1 || p > totalPages || p === currentPage) return;
	onPageChange(p);
}
</script>

{#if totalPages > 1}
	<div class="m3-blog-pagination mt-6">
		<!-- Мобильная версия (в точности как в PagePagination) -->
		<div class="m3-blog-pagination__mobile">
			{#if currentPage > 1}
				<button
					type="button"
					aria-label={i18n(I18nKey.paginationPrev)}
					class="m3-blog-pagination__arrow m3-state-layer"
					onclick={() => goTo(currentPage - 1)}
				>
					<Icon icon="material-symbols:chevron-left-rounded" />
				</button>
			{:else}
				<span class="m3-blog-pagination__arrow m3-blog-pagination__arrow--disabled" aria-hidden="true">
					<Icon icon="material-symbols:chevron-left-rounded" />
				</span>
			{/if}

			<div class="m3-blog-pagination__jump">
				<span class="m3-blog-pagination__jump-current">{currentPage}</span>
				<span class="m3-blog-pagination__jump-sep" aria-hidden="true">/</span>
				<span class="m3-blog-pagination__jump-total">{totalPages}</span>
			</div>

			{#if currentPage < totalPages}
				<button
					type="button"
					aria-label={i18n(I18nKey.paginationNext)}
					class="m3-blog-pagination__arrow m3-state-layer"
					onclick={() => goTo(currentPage + 1)}
				>
					<Icon icon="material-symbols:chevron-right-rounded" />
				</button>
			{:else}
				<span class="m3-blog-pagination__arrow m3-blog-pagination__arrow--disabled" aria-hidden="true">
					<Icon icon="material-symbols:chevron-right-rounded" />
				</span>
			{/if}
		</div>

		<!-- Десктопная версия (точь-в-точь как в блоге) -->
		<div class="m3-blog-pagination__desktop">
			{#if currentPage > 1}
				<button
					type="button"
					aria-label={i18n(I18nKey.paginationPrev)}
					class="m3-blog-pagination__arrow m3-state-layer"
					onclick={() => goTo(currentPage - 1)}
				>
					<Icon icon="material-symbols:chevron-left-rounded" />
				</button>
			{:else}
				<span class="m3-blog-pagination__arrow m3-blog-pagination__arrow--disabled" aria-hidden="true">
					<Icon icon="material-symbols:chevron-left-rounded" />
				</span>
			{/if}

			<div class="m3-blog-pagination__nums">
				{#each pageList as p, idx (idx)}
					{#if p === "..."}
						<span class="m3-blog-pagination__ellipsis" aria-hidden="true">
							<Icon icon="material-symbols:more-horiz" />
						</span>
					{:else if p === currentPage}
						<span class="m3-blog-pagination__num m3-blog-pagination__num--active" aria-current="page">
							{p}
						</span>
					{:else}
						<button
							type="button"
							class="m3-blog-pagination__num m3-state-layer"
							onclick={() => goTo(p as number)}
							aria-label={`Page ${p}`}
						>
							{p}
						</button>
					{/if}
				{/each}
			</div>

			{#if currentPage < totalPages}
				<button
					type="button"
					aria-label={i18n(I18nKey.paginationNext)}
					class="m3-blog-pagination__arrow m3-state-layer"
					onclick={() => goTo(currentPage + 1)}
				>
					<Icon icon="material-symbols:chevron-right-rounded" />
				</button>
			{:else}
				<span class="m3-blog-pagination__arrow m3-blog-pagination__arrow--disabled" aria-hidden="true">
					<Icon icon="material-symbols:chevron-right-rounded" />
				</span>
			{/if}
		</div>
	</div>
{/if}

<style>
.m3-blog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--m3e-space-3);
}

.m3-blog-pagination__mobile {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-3);
}

.m3-blog-pagination__desktop {
  display: none;
}

@media (min-width: 1024px) {
  .m3-blog-pagination__mobile {
    display: none;
  }
  .m3-blog-pagination__desktop {
    display: flex;
    align-items: center;
    gap: var(--m3e-space-3);
  }
}

.m3-blog-pagination__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-low);
  color: var(--primary);
  border: none;
  cursor: pointer;
  --m3e-state-color: var(--primary);
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), transform var(--m3e-duration-short) var(--m3e-easing-standard);
}

.m3-blog-pagination__arrow:hover:not(.m3-blog-pagination__arrow--disabled) {
  background: var(--surface-container-high);
}

.m3-blog-pagination__arrow--disabled {
  opacity: 0.38;
  pointer-events: none;
}

.m3-blog-pagination__jump {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--m3e-space-1);
  min-width: 5rem;
  height: 2.5rem;
  padding: 0 var(--m3e-space-3);
  border: none;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-low);
  color: var(--on-surface);
  font: var(--m3e-type-label-large);
  font-size: 0.875rem;
  user-select: none;
}

.m3-blog-pagination__jump-current {
  font-weight: 700;
  color: var(--primary);
}

.m3-blog-pagination__jump-sep {
  color: var(--on-surface-variant);
}

.m3-blog-pagination__jump-total {
  color: var(--on-surface-variant);
  font-variant-numeric: tabular-nums;
}

.m3-blog-pagination__nums {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-2);
}

.m3-blog-pagination__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-low);
  font: var(--m3e-type-label-large);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--on-surface-variant);
  border: none;
  cursor: pointer;
  --m3e-state-color: var(--on-surface);
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard);
}

.m3-blog-pagination__num:hover {
  background: var(--surface-container-high);
}

.m3-blog-pagination__num--active {
  background: var(--primary) !important;
  color: var(--on-primary) !important;
  --m3e-state-color: var(--on-primary);
}

.m3-blog-pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 2.5rem;
  color: var(--on-surface-variant);
}
</style>
