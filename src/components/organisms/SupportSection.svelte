<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import type { SupportConfig } from "@/types/supportConfig";

let {
	config,
	title = i18n(I18nKey.supportTitle),
	subtitle = "",
}: {
	config: SupportConfig;
	title?: string;
	subtitle?: string;
} = $props();

const steamUrl = $derived(config.steamUrl || config.steamWishlistUrl);
</script>

<div class="support-page">
	<!-- Clean, neutral, confident header -->
	<header class="support-page__header">
		<h1 class="support-page__title">{title}</h1>
		{#if subtitle}
			<p class="support-page__subtitle">{subtitle}</p>
		{/if}
	</header>

	<!-- Strict 2x2 grid -->
	<div class="support-page__grid">
		<!-- 1. Taps (Hero - Uzbekistan) -->
		{#if config.tapsUrl}
			<a
				href={config.tapsUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="support-card support-card--hero"
			>
				<div class="support-card__top">
					<div class="support-card__icon-box" aria-hidden="true">
						<Icon icon="material-symbols:account-balance-wallet-outline" />
					</div>
					<div class="support-card__kicker-col">
						<span class="support-card__kicker">{i18n(I18nKey.supportUzbekistan)}</span>
						<h2 class="support-card__name">Taps</h2>
					</div>
					<div class="support-card__arrow-circle" aria-hidden="true">
						<Icon icon="material-symbols:arrow-outward-rounded" />
					</div>
				</div>

				<div class="support-card__bottom">
					<div class="support-card__methods">{config.tapsMethods}</div>
					<div class="support-card__meta">
						<span>{i18n(I18nKey.supportMin)} {config.tapsMinAmount}</span>
						<span class="support-card__dot">•</span>
						<span>{i18n(I18nKey.supportFee)} {config.tapsFee}</span>
					</div>
				</div>
			</a>
		{/if}

		<!-- 2. Tribute (Hero - International) -->
		{#if config.tributeUrl}
			<a
				href={config.tributeUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="support-card support-card--hero"
			>
				<div class="support-card__top">
					<div class="support-card__icon-box" aria-hidden="true">
						<Icon icon="material-symbols:credit-card-outline" />
					</div>
					<div class="support-card__kicker-col">
						<span class="support-card__kicker">{i18n(I18nKey.supportInternational)}</span>
						<h2 class="support-card__name">Tribute</h2>
					</div>
					<div class="support-card__arrow-circle" aria-hidden="true">
						<Icon icon="material-symbols:arrow-outward-rounded" />
					</div>
				</div>

				<div class="support-card__bottom">
					<div class="support-card__methods">{config.tributeMethods}</div>
					<div class="support-card__meta">
						<span>{i18n(I18nKey.supportMin)} {config.tributeMinAmount}</span>
						<span class="support-card__dot">•</span>
						<span>{config.tributeFee}</span>
					</div>
				</div>
			</a>
		{/if}

		<!-- 3. Followish (Wishlist) -->
		{#if config.followishUrl}
			<a
				href={config.followishUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="support-card support-card--compact"
			>
				<div class="support-card__icon-box" aria-hidden="true">
					<Icon icon="material-symbols:featured-seasonal-and-gifts-rounded" />
				</div>
				<div class="support-card__body">
					<h3 class="support-card__title">Followish</h3>
					<p class="support-card__subtext">{i18n(I18nKey.supportFollowishCardDesc)}</p>
				</div>
				<div class="support-card__arrow-circle" aria-hidden="true">
					<Icon icon="material-symbols:arrow-outward-rounded" />
				</div>
			</a>
		{/if}

		<!-- 4. Steam (Profile & Games) -->
		{#if steamUrl}
			<a
				href={steamUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="support-card support-card--compact"
			>
				<div class="support-card__icon-box" aria-hidden="true">
					<Icon icon="fa7-brands:steam" />
				</div>
				<div class="support-card__body">
					<h3 class="support-card__title">Steam</h3>
					<p class="support-card__subtext">{i18n(I18nKey.supportSteamProfileDesc)}</p>
				</div>
				<div class="support-card__arrow-circle" aria-hidden="true">
					<Icon icon="material-symbols:arrow-outward-rounded" />
				</div>
			</a>
		{/if}
	</div>
</div>

<style>
.support-page {
	width: 100%;
	max-width: 58rem;
	margin: 0 auto;
	box-sizing: border-box;
	padding: 1.5rem 0.5rem 3rem;
}

@media (min-width: 480px) {
	.support-page {
		padding: 1.5rem 0.75rem 3rem;
	}
}

@media (min-width: 768px) {
	.support-page {
		padding: 1.5rem 0 3rem;
	}
}

/* Header */
.support-page__header {
	margin-bottom: 2rem;
	max-width: 42rem;
}

.support-page__title {
	margin: 0;
	color: #ffffff;
	font-size: clamp(2rem, 6vw, 2.75rem);
	font-weight: 800;
	line-height: 1.15;
	letter-spacing: -0.025em;
	word-break: break-word;
}

.support-page__subtitle {
	margin: 0.75rem 0 0;
	color: #94a3b8;
	font-size: 0.9375rem;
	line-height: 1.6;
	font-weight: 400;
}

/* Grid: 2 columns */
.support-page__grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 1rem;
	width: 100%;
	box-sizing: border-box;
}

@media (min-width: 768px) {
	.support-page__grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.125rem;
	}
}

/* ─────────────────────────────────────────────────────────
   Cards — Exact Match to Minimalist Reference
───────────────────────────────────────────────────────── */
.support-card {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 100%;
	min-width: 0;
	box-sizing: border-box;
	border: none;
	outline: none;
	text-decoration: none;
	background: #181d24;
	border-radius: 1.25rem;
	color: #ffffff;
	text-align: left;
	cursor: pointer;
	overflow: hidden;
	transition:
		background-color 0.2s ease,
		transform 0.2s ease;
}

.support-card:hover {
	background: #1e242d;
	transform: translateY(-1px);
}

/* Hero Cards */
.support-card--hero {
	padding: 1.125rem 1.125rem 1.125rem;
	min-height: 10.5rem;
	justify-content: space-between;
}

@media (min-width: 480px) {
	.support-card--hero {
		padding: 1.375rem 1.5rem 1.25rem;
		min-height: 11rem;
	}
}

.support-card__top {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	width: 100%;
	min-width: 0;
}

.support-card__kicker-col {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	flex: 1;
	min-width: 0;
}

.support-card__kicker {
	font-size: 0.6875rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	color: #22d3ee;
	text-transform: uppercase;
}

.support-card__name {
	margin: 0;
	font-size: 1.375rem;
	font-weight: 700;
	color: #ffffff;
	line-height: 1.2;
}

.support-card__bottom {
	margin-top: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	width: 100%;
	min-width: 0;
}

.support-card__methods {
	font-size: 0.8125rem;
	font-weight: 600;
	color: #cbd5e1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.support-card__meta {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.75rem;
	color: #64748b;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.support-card__dot {
	opacity: 0.6;
}

/* Compact Cards */
.support-card--compact {
	flex-direction: row;
	align-items: center;
	gap: 0.875rem;
	padding: 0.875rem 1rem;
	min-height: 4.75rem;
}

@media (min-width: 480px) {
	.support-card--compact {
		gap: 1rem;
		padding: 1rem 1.25rem;
		min-height: 5.25rem;
	}
}

.support-card__body {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.support-card__title {
	margin: 0;
	font-size: 0.9375rem;
	font-weight: 600;
	color: #ffffff;
	line-height: 1.3;
}

.support-card__subtext {
	margin: 0;
	font-size: 0.75rem;
	color: #94a3b8;
	line-height: 1.35;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* Icon Box */
.support-card__icon-box {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2.75rem;
	height: 2.75rem;
	flex-shrink: 0;
	border-radius: 0.875rem;
	background: #232934;
	color: #94a3b8;
}

.support-card__icon-box > :global(svg) {
	width: 1.375rem;
	height: 1.375rem;
}

/* Subtle circular button */
.support-card__arrow-circle {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	flex-shrink: 0;
	border-radius: 50%;
	background: #232934;
	color: #94a3b8;
	transition:
		background-color 0.2s ease,
		color 0.2s ease;
}

.support-card__arrow-circle > :global(svg) {
	width: 1.125rem;
	height: 1.125rem;
}

.support-card:hover .support-card__arrow-circle {
	background: #2d3542;
	color: #ffffff;
}
</style>
