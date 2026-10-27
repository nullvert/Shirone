<script lang="ts">
/**
 * MediaCardBadges - corner badges: status / wishlist rank (top-left),
 * price + discount or rating (top-right).
 */
import Icon from "@components/atoms/display/Icon.svelte";
import { i18n } from "@i18n/translation";
import type { StatusStyleMeta } from "@utils/media/status";
import type { MediaItem } from "@/types/media";

let {
	item,
	cleanRank,
	statusStyle,
}: {
	item: MediaItem;
	cleanRank: string | null;
	statusStyle: StatusStyleMeta;
} = $props();
</script>

<!-- Верхний левый угол: Статус или Ранг вишлиста -->
{#if cleanRank}
	<span
		class="media-card__top-status media-card__top-status--text"
		title={`Rank: ${cleanRank}`}
		aria-label={`Rank: ${cleanRank}`}
	>
		<span class="media-card__top-rank-val">{cleanRank}</span>
	</span>
{:else}
	<span
		class="media-card__top-status"
		title={item.statusLabel || i18n(statusStyle.key)}
		aria-label={item.statusLabel || i18n(statusStyle.key)}
	>
		{#if item.status === "planned"}
			<svg class="media-card__top-status-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
			</svg>
		{:else}
			<Icon icon={statusStyle.icon} class="media-card__top-status-icon" aria-hidden="true" />
		{/if}
	</span>
{/if}

<!-- Верхний правый угол: Оценка или Steam скидка + цена -->
{#if item.price}
	<div
		class="media-card__top-price-badge"
		class:media-card__top-price-badge--discounted={Boolean(item.price.discountPercent && item.price.discountPercent > 0)}
		title={item.price.discountPercent ? `Discount -${item.price.discountPercent}%: ${item.price.amount || "Free"}` : `Price: ${item.price.amount || "Free"}`}
	>
		{#if item.price.discountPercent && item.price.discountPercent > 0}
			<span class="media-card__steam-discount">-{item.price.discountPercent}%</span>
		{/if}
		<span
			class="media-card__steam-price"
			class:media-card__steam-price--discounted={Boolean(item.price.discountPercent && item.price.discountPercent > 0)}
		>
			{item.price.amount || (item.price.isFree ? "Free" : "")}
		</span>
	</div>
{:else if item.rating !== undefined && item.rating !== null && item.rating > 0}
	<span class="media-card__top-rating" title={`Rating: ${item.rating}`}>
		<span class="media-card__top-rating-val">{item.rating}</span>
	</span>
{/if}

<style lang="stylus">
.media-card
	/* ── Бейдж статуса: правый нижний угол мягко скруглен ── */
	&__top-status
		position: absolute
		top: 0
		left: 0
		z-index: 6
		display: inline-flex
		align-items: center
		justify-content: center
		width: var(--badge-size, 1.875rem)
		height: var(--badge-size, 1.875rem)
		box-sizing: border-box
		border-radius: unquote("0 0 calc(var(--badge-size, 1.875rem) * 0.33) 0")
		background: rgba(15, 23, 42, 0.72)
		border: none
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
		transition:
			background var(--m3e-duration-medium) var(--m3e-easing-standard),
			border-color var(--m3e-duration-medium) var(--m3e-easing-standard),
			transform var(--m3e-duration-short) var(--m3e-easing-standard)

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			background: unquote("color-mix(in oklab, var(--electric-color, var(--primary)) 28%, rgba(15, 23, 42, 0.88))")

		:global(.media-card__top-status-icon)
			width: unquote("calc(var(--badge-size, 1.875rem) * 0.57)")
			height: unquote("calc(var(--badge-size, 1.875rem) * 0.57)")
			color: rgba(255, 255, 255, 0.88)
			flex-shrink: 0
			transition: color var(--m3e-duration-medium) var(--m3e-easing-standard)

		:global(.media-card:hover) & :global(.media-card__top-status-icon),
		:global(.media-card--hovered) & :global(.media-card__top-status-icon)
			color: #ffffff

	&__top-status--text
		padding: unquote("0 calc(var(--badge-size, 1.875rem) * 0.25)")
		width: auto
		min-width: var(--badge-size, 1.875rem)

	&__top-rank-val
		font-family: ui-monospace, "SF Pro Rounded", "JetBrains Mono Variable", "SFMono-Regular", Menlo, Monaco, Consolas, "Segoe UI", sans-serif
		font-size: unquote("calc(var(--badge-size, 1.875rem) * 0.42)")
		font-weight: 800
		line-height: 1
		color: #ffffff
		font-variant-numeric: tabular-nums

	/* ── Бейдж цены и скидки Steam: левый нижний угол мягко скруглен ── */
	&__top-price-badge
		position: absolute
		top: 0
		right: 0
		z-index: 6
		display: inline-flex
		align-items: stretch
		height: var(--badge-size, 1.875rem)
		box-sizing: border-box
		border-radius: unquote("0 0 0 calc(var(--badge-size, 1.875rem) * 0.33)")
		overflow: hidden
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35)
		background: #101822

		&--discounted
			background: linear-gradient(90deg, #3d581a 0%, #344c16 48%, #1f2b1d 68%, #0f1822 100%)

	&__steam-discount
		display: inline-flex
		align-items: center
		justify-content: center
		padding: 0 0.45rem
		background: transparent
		color: #bbf812
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6)
		font-family: "Motiva Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
		font-size: 0.75rem
		font-weight: 700
		letter-spacing: 0
		line-height: var(--badge-size, 1.875rem)
		user-select: none

	&__steam-price
		display: inline-flex
		align-items: center
		justify-content: center
		padding: 0 0.5rem
		background: rgba(15, 23, 42, 0.78)
		color: #ffffff
		font-family: "Motiva Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
		font-size: 0.75rem
		font-weight: 600
		letter-spacing: 0
		line-height: var(--badge-size, 1.875rem)

		&--discounted
			background: transparent
			color: #ffffff
			text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7)
			font-weight: 700

	/* ── Бейдж оценки: всегда белый текст с четким контрастом ── */
	&__top-rating
		position: absolute
		top: 0
		right: 0
		z-index: 6
		display: inline-flex
		align-items: center
		justify-content: center
		min-width: var(--badge-size, 1.875rem)
		height: var(--badge-size, 1.875rem)
		padding: unquote("0 calc(var(--badge-size, 1.875rem) * 0.23)")
		box-sizing: border-box
		border-radius: unquote("0 0 0 calc(var(--badge-size, 1.875rem) * 0.33)")
		background: rgba(15, 23, 42, 0.72)
		border: none
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
		transition:
			background var(--m3e-duration-medium) var(--m3e-easing-standard),
			border-color var(--m3e-duration-medium) var(--m3e-easing-standard),
			transform var(--m3e-duration-short) var(--m3e-easing-standard)

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			background: unquote("color-mix(in oklab, var(--electric-color, var(--primary)) 28%, rgba(15, 23, 42, 0.88))")

	&__top-rating-val
		font-family: ui-monospace, "SF Pro Rounded", "JetBrains Mono Variable", "SFMono-Regular", Menlo, Monaco, Consolas, "Segoe UI", sans-serif
		font-size: unquote("calc(var(--badge-size, 1.875rem) * 0.43)")
		font-weight: 800
		line-height: 1
		letter-spacing: -0.01em
		font-variant-numeric: tabular-nums lining-nums
		color: #ffffff

/* Poor tier recolours the rating value; the tier class lives on the card root. */
:global(.media-card--rating-poor) .media-card__top-rating-val
	color: #ff8a80
	text-shadow: 0 0 6px rgba(194, 54, 47, 0.6)
</style>
