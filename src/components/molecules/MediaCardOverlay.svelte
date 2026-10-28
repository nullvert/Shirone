<script lang="ts">
/**
 * MediaCardOverlay - title, meta rows and the expanding details accordion
 * that sit over the poster.
 *
 * Requirements:
 * 1. Default (poster bottom):
 *    - authorOrStudio on the left, year + AL score on the right.
 * 2. Hover:
 *    - Cinema: Year · runtime (e.g. 2001 · 122 min)
 *    - Games: Year · studio / author (e.g. 2020 · Valve)
 *    - Anime: [Icon FORMAT] Season Year (e.g. [TV] Winter 2011)
 *    - Clamped description (3-4 lines)
 *    - Progress bar (watched / total) for non-movie items with progress
 */
import Icon from "@components/atoms/display/Icon.svelte";
import { getFormatIcon } from "@utils/anime/genres";
import type { MediaItem } from "@/types/media";

let {
	item,
	pageType,
	formattedSeasonYear,
	progressPercent,
}: {
	item: MediaItem;
	pageType?: "anime" | "cinema" | "games";
	formattedSeasonYear: string | number;
	progressPercent: number;
} = $props();

const isAnime = $derived(pageType === "anime" || item.kind === "anime");
const isGames = $derived(pageType === "games" || item.kind === "game");
const isMovie = $derived(
	item.kind === "movie" ||
	item.format?.toUpperCase() === "MOVIE"
);
</script>

<!-- Hover-оверлей поверх постера -->
<div class="media-card__overlay">
	<h3 class="media-card__overlay-title" title={item.title}>
		{item.title}
	</h3>

	<!-- Обычный вид на постере: Студия слева · Год и AL score справа (скрин 1) -->
	<div class="media-card__overlay-meta media-card__overlay-meta--normal">
		{#if item.authorOrStudio}
			<span class="media-card__overlay-author" title={item.authorOrStudio}>
				{item.authorOrStudio}
			</span>
		{/if}

		<div class="media-card__overlay-meta-right">
			{#if item.year}
				<span class="media-card__overlay-year">{item.year}</span>
			{/if}

			{#if item.communityRating}
				{#if item.year}
					<span class="media-card__overlay-dot" aria-hidden="true">·</span>
				{/if}
				<span class="media-card__overlay-community" title={`AniList score: ${item.communityRating}%`}>
					<Icon icon="simple-icons:anilist" class="media-card__anilist-logo" />
					<span>{item.communityRating}%</span>
				</span>
			{/if}
		</div>
	</div>

	<!-- При ховере: режим в зависимости от медиа (скрины 2 и 3) -->
	<div class="media-card__overlay-meta media-card__overlay-meta--hover">
		<div class="media-card__meta-row">
			{#if isAnime}
				<!-- Аниме ховер: плашка формата + Сезон/Год (скрин 3: [TV] Winter 2011) -->
				{#if item.format}
					<span class="media-card__overlay-format" title={item.format}>
						<Icon icon={getFormatIcon(item.format)} class="media-card__format-icon" />
						<span>{item.format.replace(/_/g, " ")}</span>
					</span>
				{/if}

				{#if formattedSeasonYear || item.year}
					<span class="media-card__overlay-year">{formattedSeasonYear || item.year}</span>
				{/if}

				{#if item.runtime && item.format?.toUpperCase() === "MOVIE"}
					<span class="media-card__overlay-dot" aria-hidden="true">·</span>
					<span class="media-card__overlay-sub">{item.runtime} min</span>
				{/if}
			{:else if isGames}
				<!-- Игры ховер: Год · Студия (разработчик) -->
				{#if item.year}
					<span class="media-card__overlay-year">{item.year}</span>
				{/if}
				{#if item.year && item.authorOrStudio}
					<span class="media-card__overlay-dot" aria-hidden="true">·</span>
				{/if}
				{#if item.authorOrStudio}
					<span class="media-card__overlay-sub" title={item.authorOrStudio}>{item.authorOrStudio}</span>
				{/if}
			{:else}
				<!-- Кино ховер: Год · Время (скрин 2: 2001 · 122 min) -->
				{#if item.year}
					<span class="media-card__overlay-year">{item.year}</span>
				{/if}
				{#if item.year && item.runtime}
					<span class="media-card__overlay-dot" aria-hidden="true">·</span>
				{/if}
				{#if item.runtime}
					<span class="media-card__overlay-sub">{item.runtime} min</span>
				{/if}
			{/if}
		</div>
	</div>

	<!-- Раскрывающийся аккордеон с описанием и прогрессом (без жанров) -->
	<div class="media-card__overlay-details">
		<div class="media-card__overlay-details-inner">
			{#if item.description}
				<p class="media-card__overlay-desc">{item.description}</p>
			{/if}

			{#if item.progress && !isMovie}
				<div class="media-card__overlay-progress">
					<div class="media-card__progress-info">
						<span class="media-card__progress-count">{item.progress.watched} / {item.progress.total || "?"}</span>
						{#if item.repeat && item.repeat > 0}
							<span class="media-card__progress-repeat" title={`Rewatched ${item.repeat} times`}>
								<span class="media-card__progress-repeat-icon" aria-hidden="true">↻</span>
								{item.repeat > 1 ? `×${item.repeat}` : "1"}
							</span>
						{/if}
					</div>
					<div class="media-card__progress-track">
						<div class="media-card__progress-fill" style={`width: ${progressPercent}%;`}></div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
.media-card__overlay {
  position: absolute;
  inset: -1px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.875rem;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.72) 30%, rgba(0, 0, 0, 0.92) 75%, #060608 100%);
  opacity: 0;
  pointer-events: none;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
  transition: opacity var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
}
.media-card__overlay .media-card__overlay-title,
.media-card__overlay .media-card__overlay-meta {
  will-change: transform, opacity;
  transform: translate3d(0, 8px, 0);
  opacity: 0.85;
  transition:
    transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate),
    opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.media-card__overlay .media-card__overlay-details-inner {
  will-change: transform, opacity;
  transform: translate3d(0, 12px, 0);
  opacity: 0;
  transition:
    transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate) 0.04s,
    opacity var(--m3e-duration-medium) var(--m3e-easing-standard) 0.04s;
}
:global(.media-card:hover) .media-card__overlay,
:global(.media-card--hovered) .media-card__overlay {
  opacity: 1;
  pointer-events: auto;
}
:global(.media-card:hover) .media-card__overlay .media-card__overlay-title,
:global(.media-card--hovered) .media-card__overlay .media-card__overlay-title,
:global(.media-card:hover) .media-card__overlay .media-card__overlay-meta,
:global(.media-card--hovered) .media-card__overlay .media-card__overlay-meta {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}
:global(.media-card:hover) .media-card__overlay .media-card__overlay-details-inner,
:global(.media-card--hovered) .media-card__overlay .media-card__overlay-details-inner {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}
.media-card__overlay-title {
  margin: 0 0 0.3125rem;
  color: #ffffff;
  font: var(--m3e-type-title-small);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
}
.media-card__overlay-meta {
  margin-bottom: 0.4375rem;
}
.media-card__overlay-meta--normal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font: var(--m3e-type-label-small);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  white-space: nowrap;
}
.media-card__overlay-meta-right {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  white-space: nowrap;
}
:global(.media-card:hover) .media-card__overlay-meta--normal,
:global(.media-card--hovered) .media-card__overlay-meta--normal {
  display: none;
}
.media-card__overlay-meta--hover {
  display: none;
  flex-direction: column;
  gap: 0.25rem;
}
:global(.media-card:hover) .media-card__overlay-meta--hover,
:global(.media-card--hovered) .media-card__overlay-meta--hover {
  display: flex;
}
.media-card__meta-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0.375rem;
  font: var(--m3e-type-label-small);
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-card__overlay-format {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.35rem;
  height: 1.125rem;
  border-radius: var(--shape-corner-xs);
  background: var(--surface-bright, rgba(255, 255, 255, 0.95));
  color: var(--on-surface, #0f172a);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}
.media-card__format-icon {
  font-size: 0.75rem;
  line-height: 1;
}
.media-card__overlay-author {
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  min-width: 0;
  flex: 1;
}
.media-card__overlay-year {
  color: rgba(255, 255, 255, 0.9);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.media-card__overlay-community {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.95);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  flex-shrink: 0;
}
.media-card :global(.media-card__anilist-logo) {
  width: 0.8125rem;
  height: 0.8125rem;
  color: #02a9ff;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
}
.media-card__overlay-dot {
  color: rgba(255, 255, 255, 0.4);
  user-select: none;
  flex-shrink: 0;
}
.media-card__overlay-sub {
  color: rgba(255, 255, 255, 0.8);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.media-card__overlay-desc {
  margin: 0 0 0.625rem;
  color: rgba(255, 255, 255, 0.95);
  font: var(--m3e-type-body-small);
  font-size: 0.78125rem;
  line-height: 1.5;
  letter-spacing: 0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.media-card__overlay-progress {
  margin-bottom: 0.5rem;
}
.media-card__progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  color: rgba(255, 255, 255, 0.85);
  font: var(--m3e-type-label-small);
  font-size: 0.6875rem;
  font-weight: 600;
}
.media-card__progress-repeat {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: color-mix(in oklab, var(--primary) 78%, #ffffff);
  font-weight: 700;
  font-size: 0.6875rem;
}
.media-card__progress-repeat-icon {
  font-size: 0.8125rem;
  line-height: 1;
}
.media-card__progress-track {
  width: 100%;
  height: 4px;
  border-radius: var(--shape-corner-full);
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}
.media-card__progress-fill {
  height: 100%;
  border-radius: var(--shape-corner-full);
  background: var(--primary);
  transition: width var(--m3e-duration-medium) var(--m3e-easing-standard);
}

/* Title-on-poster mode: the card root owns the modifier class. */
:global(.media-card--title-on-poster) .media-card__overlay {
  opacity: 1;
  pointer-events: auto;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 28%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.82) 70%, rgba(6, 6, 8, 0.96) 88%, #060608 100%);
  transition: background var(--m3e-duration-long) var(--m3e-easing-standard);
}
:global(.media-card--title-on-poster) .media-card__overlay .media-card__overlay-title,
:global(.media-card--title-on-poster) .media-card__overlay .media-card__overlay-meta {
  transform: none;
  opacity: 1;
  transition: none;
}
:global(.media-card--title-on-poster) .media-card__overlay .media-card__overlay-details {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
  transition:
    grid-template-rows var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate),
    opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
:global(.media-card--title-on-poster) .media-card__overlay .media-card__overlay-details-inner {
  min-height: 0;
  overflow: hidden;
  will-change: transform;
  transform: translate3d(0, 4px, 0);
  opacity: 0;
  transition:
    transform var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate),
    opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
:global(.media-card--title-on-poster:hover) .media-card__overlay,
:global(.media-card--title-on-poster.media-card--hovered) .media-card__overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.78) 30%, rgba(0, 0, 0, 0.94) 75%, #060608 100%);
}
:global(.media-card--title-on-poster:hover) .media-card__overlay .media-card__overlay-details,
:global(.media-card--title-on-poster.media-card--hovered) .media-card__overlay .media-card__overlay-details {
  grid-template-rows: 1fr;
  opacity: 1;
  pointer-events: auto;
}
:global(.media-card--title-on-poster:hover) .media-card__overlay .media-card__overlay-details-inner,
:global(.media-card--title-on-poster.media-card--hovered) .media-card__overlay .media-card__overlay-details-inner {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}
</style>
