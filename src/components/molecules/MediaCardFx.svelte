<script lang="ts">
/**
 * MediaCardFx - hover border / foil / aura effects for MediaPosterCard.
 * Masterpiece gets the rotating gold border, foil shine and aura; every
 * other tier gets the animated corner border.
 */
import type { MediaRatingTier } from "@utils/media/card";

let { ratingTier }: { ratingTier: MediaRatingTier } = $props();
</script>

<!-- Hover Border: показываем рамку fancy-border для всех карточек, кроме золотого masterpiece -->
{#if ratingTier !== "masterpiece"}
	<div class="media-card__fancy-border" aria-hidden="true"></div>
{/if}

<!-- Pure CSS Animated Gradient Border: только для золотых карточек Masterpiece -->
{#if ratingTier === "masterpiece"}
	<div class="media-card__foil-shine" aria-hidden="true"></div>
	<div class="media-card__gradient-border" aria-hidden="true"></div>
	<div class="media-card__gold-aura" aria-hidden="true"></div>
{/if}

<style lang="stylus">
.media-card
	/* ── Fancy Animated Border (Temani Afif style): четкая, выразительная неоновая рамка ── */
	&__fancy-border
		position: absolute
		inset: -2px
		z-index: 10
		pointer-events: none
		--c: var(--electric-color, var(--media-status-color, var(--primary)))
		--b: 2px
		--_g: unquote("#0000 25%, var(--c) 0")
		background:
			unquote("conic-gradient(from 180deg at top var(--b) right var(--b), var(--_g)) var(--_i, 200%) 0 / 200% var(--_i, var(--b)) no-repeat"),
			unquote("conic-gradient(at bottom var(--b) left var(--b), var(--_g)) 0 var(--_i, 200%) / var(--_i, var(--b)) 200% no-repeat")
		transition: 0.35s ease, background-position 0.35s 0.35s ease
		opacity: 0
		filter: drop-shadow(0 0 4px unquote("color-mix(in oklab, var(--c) 40%, transparent)"))

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			--_i: 100%
			opacity: 1
			transition: 0.35s ease, background-size 0.35s 0.35s ease

	/* ── Pure CSS Animated Gradient Border: вращающийся золотой луч через mask (без SVG) ── */
	&__gradient-border
		position: absolute
		inset: -2px
		z-index: 10
		pointer-events: none
		opacity: 0
		border-radius: 0
		overflow: hidden
		--b: 2px
		--_m: unquote("linear-gradient(#000 0 0)")
		-webkit-mask:
			var(--_m) content-box,
			var(--_m)
		-webkit-mask-composite: xor
		mask-composite: exclude
		padding: var(--b)
		box-sizing: border-box
		transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)

		&::before
			content: ""
			position: absolute
			top: -50%
			left: -50%
			width: 200%
			height: 200%
			background: conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(255, 230, 163, 0.3) 75%, rgba(255, 179, 56, 0.75) 88%, rgba(255, 232, 158, 0.9) 96%, transparent 100%)
			transform: rotate(var(--angle, 0deg))

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			opacity: 0.85

	/* ── Золотое свечение и поинтер-ховер (матовый золотой глянец) ── */
	&__gold-aura
		position: absolute
		inset: -6px
		z-index: 1
		pointer-events: none
		opacity: 0
		border-radius: inherit
		background: radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 179, 56, 0.28) 0%, rgba(255, 148, 16, 0.08) 50%, transparent 80%)
		filter: blur(14px)
		transition: opacity 0.6s var(--m3e-easing-standard)

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			opacity: 1

	/* ── Foil / Holographic Shine (Masterpiece): коллекционный радужно-золотой призматический перелив ── */
	&__foil-shine
		position: absolute
		inset: 0
		z-index: 4
		pointer-events: none
		opacity: 0
		border-radius: inherit
		overflow: hidden
		mix-blend-mode: screen
		background:
			linear-gradient(
				unquote("calc(115deg + var(--px, 50%) * 0.4)"),
				transparent 15%,
				rgba(255, 215, 0, 0.45) 35%,
				rgba(255, 120, 220, 0.4) 48%,
				rgba(0, 240, 255, 0.4) 55%,
				rgba(255, 235, 120, 0.5) 65%,
				transparent 85%
			),
			radial-gradient(
				220px circle at var(--mx, 50%) var(--my, 50%),
				rgba(255, 255, 255, 0.5) 0%,
				rgba(255, 215, 0, 0.3) 35%,
				transparent 70%
			)
		background-size: 200% 200%, 100% 100%
		background-position: var(--px, 50%) var(--py, 50%), 0 0
		transition: opacity 0.5s var(--m3e-easing-standard)

		:global(.media-card:hover) &,
		:global(.media-card--hovered) &
			opacity: 0.9
</style>
