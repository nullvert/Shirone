<script lang="ts">
/**
 * MediaCardOverlay - title, meta rows and the expanding details accordion
 * that sit over the poster. Hover state comes from the card root classes.
 */
import Icon from "@components/atoms/display/Icon.svelte";
import type { MediaItem } from "@/types/media";

let {
	item,
	formattedSeasonYear,
	progressPercent,
}: {
	item: MediaItem;
	formattedSeasonYear: string | number;
	progressPercent: number;
} = $props();
</script>

<!-- Hover-оверлей поверх постера -->
<div class="media-card__overlay">
	<h3 class="media-card__overlay-title" title={item.title}>
		{item.title}
	</h3>

	<!-- Обычный вид на постере: чистая 1 строка (Студия · Год · AniList оценка) -->
	<div class="media-card__overlay-meta media-card__overlay-meta--normal">
		{#if item.authorOrStudio}
			<span class="media-card__overlay-author" title={item.authorOrStudio}>
				{item.authorOrStudio}
			</span>
		{/if}
		{#if item.authorOrStudio && (item.year || item.communityRating)}
			<span class="media-card__overlay-dot" aria-hidden="true">·</span>
		{/if}

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

	<!-- При ховере: 2 строки с полными данными -->
	<div class="media-card__overlay-meta media-card__overlay-meta--hover">
		<!-- Строка 1: Студия · Формат · Время -->
		<div class="media-card__meta-row">
			{#if item.authorOrStudio}
				<span class="media-card__overlay-author" title={item.authorOrStudio}>
					{item.authorOrStudio}
				</span>
			{/if}

			{#if item.format}
				{#if item.authorOrStudio}
					<span class="media-card__overlay-dot" aria-hidden="true">·</span>
				{/if}
				<span class="media-card__overlay-format">{item.format}</span>
			{/if}

			{#if (item.authorOrStudio || item.format) && ((item.hours !== undefined && item.hours > 0) || item.runtime)}
				<span class="media-card__overlay-dot" aria-hidden="true">·</span>
			{/if}

			{#if item.hours !== undefined && item.hours > 0}
				<span class="media-card__overlay-sub">{item.hours} h</span>
			{:else if item.runtime}
				<span class="media-card__overlay-sub">{item.runtime} min</span>
			{/if}
		</div>

		<!-- Строка 2: Сезон + Год · AniList оценка -->
		<div class="media-card__meta-row">
			{#if formattedSeasonYear}
				<span class="media-card__overlay-year">{formattedSeasonYear}</span>
			{/if}

			{#if item.communityRating}
				{#if formattedSeasonYear}
					<span class="media-card__overlay-dot" aria-hidden="true">·</span>
				{/if}
				<span class="media-card__overlay-community" title={`AniList score: ${item.communityRating}%`}>
					<Icon icon="simple-icons:anilist" class="media-card__anilist-logo" />
					<span>{item.communityRating}%</span>
				</span>
			{/if}
		</div>
	</div>

	<!-- Раскрывающийся аккордеон с деталями -->
	<div class="media-card__overlay-details">
		<div class="media-card__overlay-details-inner">
			{#if item.description}
				<p class="media-card__overlay-desc">{item.description}</p>
			{/if}

			{#if item.progress}
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

			{#if item.genres && item.genres.length > 0}
				<div class="media-card__overlay-genres">
					{#each item.genres.slice(0, 4) as genre (genre)}
						<span class="media-card__genre-tag">{genre}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="stylus">
.media-card
	/* ── Hover Overlay ── */
	&__overlay
		position: absolute
		inset: -1px
		z-index: 3
		display: flex
		flex-direction: column
		justify-content: flex-end
		padding: 0.875rem
		border-radius: inherit
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.72) 30%, rgba(0, 0, 0, 0.92) 75%, #060608 100%)
		opacity: 0
		pointer-events: none
		transform: translateZ(0)
		backface-visibility: hidden
		-webkit-font-smoothing: subpixel-antialiased
		transition: opacity var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate)

		.media-card__overlay-title,
		.media-card__overlay-meta
			will-change: transform, opacity
			transform: translate3d(0, 8px, 0)
			opacity: 0.85
			transition:
				transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate),
				opacity var(--m3e-duration-medium) var(--m3e-easing-standard)

		.media-card__overlay-details-inner
			will-change: transform, opacity
			transform: translate3d(0, 12px, 0)
			opacity: 0
			transition:
				transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate) 0.04s,
				opacity var(--m3e-duration-medium) var(--m3e-easing-standard) 0.04s

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			opacity: 1
			pointer-events: auto

			.media-card__overlay-title,
			.media-card__overlay-meta
				transform: translate3d(0, 0, 0)
				opacity: 1

			.media-card__overlay-details-inner
				transform: translate3d(0, 0, 0)
				opacity: 1


	&__overlay-title
		margin: 0 0 0.3125rem
		color: #ffffff
		font: var(--m3e-type-title-small)
		font-size: 0.9375rem
		font-weight: 700
		line-height: 1.3
		letter-spacing: -0.01em
		display: -webkit-box
		-webkit-line-clamp: 2
		-webkit-box-orient: vertical
		overflow: hidden
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6)

	&__overlay-meta
		margin-bottom: 0.4375rem

	&__overlay-meta--normal
		display: flex
		align-items: center
		flex-wrap: nowrap
		gap: 0.375rem
		font: var(--m3e-type-label-small)
		font-size: 0.75rem
		font-weight: 600
		color: rgba(255, 255, 255, 0.88)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			display: none

	&__overlay-meta--hover
		display: none
		flex-direction: column
		gap: 0.25rem

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			display: flex

	&__meta-row
		display: flex
		align-items: center
		flex-wrap: nowrap
		gap: 0.375rem
		font: var(--m3e-type-label-small)
		font-size: 0.75rem
		font-weight: 600
		color: rgba(255, 255, 255, 0.88)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

	&__overlay-format
		display: inline-flex
		align-items: center
		padding: 0 0.35rem
		height: 1.125rem
		border-radius: var(--shape-corner-xs)
		background: unquote("color-mix(in srgb, var(--primary) 22%, rgba(0, 0, 0, 0.6))")
		border: 1px solid unquote("color-mix(in srgb, var(--primary) 45%, transparent)")
		color: #ffffff
		font-size: 0.625rem
		font-weight: 700
		letter-spacing: 0.03em
		text-transform: uppercase
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3)
		flex-shrink: 0

	&__overlay-author
		color: rgba(255, 255, 255, 0.95)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		letter-spacing: -0.01em

	&__overlay-year
		color: rgba(255, 255, 255, 0.9)
		font-variant-numeric: tabular-nums
		flex-shrink: 0

	&__overlay-community
		display: inline-flex
		align-items: center
		gap: 0.25rem
		color: rgba(255, 255, 255, 0.95)
		font-variant-numeric: tabular-nums
		font-weight: 700
		flex-shrink: 0

	:global(.media-card__anilist-logo)
		width: 0.8125rem
		height: 0.8125rem
		color: #02a9ff
		flex-shrink: 0
		display: inline-block
		vertical-align: middle

	&__overlay-dot
		color: rgba(255, 255, 255, 0.4)
		user-select: none
		flex-shrink: 0

	&__overlay-sub
		color: rgba(255, 255, 255, 0.8)
		font-variant-numeric: tabular-nums
		overflow: hidden
		text-overflow: ellipsis
		flex: 1
		min-width: 0

	&__overlay-desc
		margin: 0 0 0.625rem
		color: rgba(255, 255, 255, 0.95)
		font: var(--m3e-type-body-small)
		font-size: 0.78125rem
		line-height: 1.5
		letter-spacing: 0.01em
		display: -webkit-box
		-webkit-line-clamp: 4
		-webkit-box-orient: vertical
		overflow: hidden

	&__overlay-progress
		margin-bottom: 0.5rem

	&__progress-info
		display: flex
		justify-content: space-between
		align-items: center
		margin-bottom: 0.25rem
		color: rgba(255, 255, 255, 0.85)
		font: var(--m3e-type-label-small)
		font-size: 0.6875rem
		font-weight: 600

	&__progress-repeat
		display: inline-flex
		align-items: center
		gap: 0.2rem
		color: unquote("color-mix(in oklab, var(--primary) 78%, #ffffff)")
		font-weight: 700
		font-size: 0.6875rem

	&__progress-repeat-icon
		font-size: 0.8125rem
		line-height: 1

	&__progress-track
		width: 100%
		height: 4px
		border-radius: var(--shape-corner-full)
		background: rgba(255, 255, 255, 0.2)
		overflow: hidden

	&__progress-fill
		height: 100%
		border-radius: var(--shape-corner-full)
		background: var(--primary)
		transition: width var(--m3e-duration-medium) var(--m3e-easing-standard)

	&__overlay-genres
		display: flex
		flex-wrap: wrap
		gap: 0.3125rem

	&__genre-tag
		display: inline-flex
		align-items: center
		justify-content: center
		text-align: center
		height: 1.375rem
		box-sizing: border-box
		line-height: 1
		padding: 0 0.5rem
		border-radius: var(--shape-corner-xs, 4px)
		background: rgba(15, 23, 42, 0.78)
		border: 1px solid rgba(255, 255, 255, 0.14)
		color: #ffffff
		font: var(--m3e-type-label-small)
		font-size: 0.6875rem
		font-weight: 600
		letter-spacing: 0.01em
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35)
		backdrop-filter: blur(4px)
		-webkit-backdrop-filter: blur(4px)
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		max-width: 100%

/* Title-on-poster mode: the card root owns the modifier class. */
:global(.media-card--title-on-poster)
	.media-card__overlay
		opacity: 1
		pointer-events: auto
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 28%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.82) 70%, rgba(6, 6, 8, 0.96) 88%, #060608 100%)
		transition: background var(--m3e-duration-long) var(--m3e-easing-standard)

		.media-card__overlay-title,
		.media-card__overlay-meta
			transform: none
			opacity: 1
			transition: none

		.media-card__overlay-details
			display: grid
			grid-template-rows: 0fr
			opacity: 0
			pointer-events: none
			transition:
				grid-template-rows var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate),
				opacity var(--m3e-duration-medium) var(--m3e-easing-standard)

		.media-card__overlay-details-inner
			min-height: 0
			overflow: hidden
			will-change: transform
			transform: translate3d(0, 4px, 0)
			opacity: 0
			transition:
				transform var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate),
				opacity var(--m3e-duration-medium) var(--m3e-easing-standard)

:global(.media-card--title-on-poster:hover),
:global(.media-card--title-on-poster.media-card--hovered)
	.media-card__overlay
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.78) 30%, rgba(0, 0, 0, 0.94) 75%, #060608 100%)

		.media-card__overlay-details
			grid-template-rows: 1fr
			opacity: 1
			pointer-events: auto

		.media-card__overlay-details-inner
			transform: translate3d(0, 0, 0)
			opacity: 1
</style>
