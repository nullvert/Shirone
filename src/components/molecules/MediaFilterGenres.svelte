<script lang="ts">
/**
 * MediaFilterGenres - two-column genre filter chips with counters and a
 * Show more / Show less toggle.
 */
import Icon from "@components/atoms/display/Icon.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import {
	GENRES_COLLAPSED,
	GENRES_TOGGLE_THRESHOLD,
	type GenreCount,
} from "@utils/media/filter";

let {
	genres,
	displayed,
	selected,
	showCounts = true,
	collapseThreshold = GENRES_TOGGLE_THRESHOLD,
	expanded = $bindable(false),
	ontoggle,
}: {
	/** Все доступные жанры (для расчёта счётчика скрытых). */
	genres: GenreCount[];
	/** Жанры, видимые в текущем состоянии списка. */
	displayed: GenreCount[];
	selected: string | null;
	showCounts?: boolean;
	collapseThreshold?: number;
	expanded?: boolean;
	ontoggle: (genre: string) => void;
} = $props();
</script>

<div class="media-genres-wrap">
	{#each displayed as g (g.name)}
		{@const isDisabled = (g.count ?? 0) === 0}
		<button
			type="button"
			class="media-genre-pill"
			class:media-genre-pill--active={selected === g.name}
			class:media-genre-pill--disabled={isDisabled}
			disabled={isDisabled}
			onclick={() => !isDisabled && ontoggle(g.name)}
			title={g.name}
		>
			<span class="media-genre-pill__left">
				<span class="media-genre-pill__hash" aria-hidden="true">#</span>
				<span class="media-genre-pill__name">{g.name}</span>
			</span>
			{#if showCounts}
				<span class="media-genre-pill__count">{g.count}</span>
			{/if}
		</button>
	{/each}
</div>

{#if genres.length > collapseThreshold}
	<button
		type="button"
		class="media-genres-toggle"
		onclick={() => (expanded = !expanded)}
	>
		<span>
			{expanded
				? i18n(I18nKey.mediaFilterShowLess)
				: i18n(I18nKey.mediaFilterShowMore).replace(
						"{count}",
						String(genres.length - GENRES_COLLAPSED),
					)}
		</span>
		<Icon
			icon={expanded
				? "material-symbols:expand-less-rounded"
				: "material-symbols:expand-more-rounded"}
		/>
	</button>
{/if}

<style>
.media-genres-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}
.media-genre-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--media-filter-item-height, 2.25rem);
  box-sizing: border-box;
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--on-surface-variant);
  background: var(--surface-container);
  border: none;
  border-radius: var(--shape-corner-m);
  cursor: pointer;
  transition: all var(--m3e-duration-short) ease;
  overflow: hidden;
}
.media-genre-pill:last-child:nth-child(odd) {
  grid-column: span 2;
}
.media-genre-pill:hover:not(:disabled) {
  background: color-mix(in srgb, var(--primary) 15%, var(--surface-container-high));
  color: var(--on-surface);
}
.media-genre-pill:hover:not(:disabled) .media-genre-pill__hash {
  color: var(--primary);
  opacity: 1;
}
.media-genre-pill:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.media-genre-pill--active {
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 600;
}
.media-genre-pill--active .media-genre-pill__hash {
  color: var(--on-primary);
  opacity: 0.85;
}
.media-genre-pill--active .media-genre-pill__count {
  background: var(--surface-container);
  color: var(--on-surface);
  font-weight: 700;
}
.media-genre-pill--disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}
.media-genre-pill__left {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  overflow: hidden;
}
.media-genre-pill__hash {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
  opacity: 0.8;
  transition: all var(--m3e-duration-short) ease;
}
.media-genre-pill__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-genre-pill__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  min-width: 1.3rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  box-sizing: border-box;
  border-radius: var(--shape-corner-s);
  background: color-mix(in srgb, var(--on-surface) 10%, transparent);
  color: var(--on-surface-variant);
  flex-shrink: 0;
  transition: all var(--m3e-duration-short) var(--m3e-easing-standard);
}
.media-genres-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
  height: var(--media-filter-item-height, 2.25rem);
  box-sizing: border-box;
  margin-top: 0.65rem;
  margin-bottom: 0.25rem;
  padding: 0 0.75rem;
  font-size: 0.78125rem;
  font-weight: 500;
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  border: none;
  border-radius: var(--shape-corner-m);
  cursor: pointer;
  transition: all var(--m3e-duration-short) var(--m3e-easing-standard);
}
.media-genres-toggle:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.media-genres-toggle > :global(svg) {
  width: 1rem;
  height: 1rem;
  transition: transform var(--m3e-duration-short) var(--m3e-easing-standard);
}
.media-genres-toggle:hover {
  background: color-mix(in srgb, var(--primary) 18%, transparent);
}
</style>
