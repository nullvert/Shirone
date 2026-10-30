<script lang="ts">
/**
 * Карточка закладки (Molecule) в строгом соответствии с M3E токенами и референсом:
 * - Без рамок (border: none)
 * - Чистый, бесшовный фон var(--card-bg)
 * - Никаких обводок у иконки и у хоста (только мягкие подложки surface)
 */
import Icon from "@iconify/svelte";
import { reveal } from "@utils/motion";
import type { BookmarkEntry } from "../../data/bookmarks";

let { entry, delay = 0 }: { entry: BookmarkEntry; delay?: number } = $props();

let imgFailed = $state(false);

const iconKind = $derived(
	entry.image
		? "image"
		: /^[\w-]+:[\w-]+$/.test(entry.icon ?? "")
			? "iconify"
			: /^https?:\/\//.test(entry.icon ?? "") || /^\//.test(entry.icon ?? "")
				? "image"
				: "letter",
);

const imageSrc = $derived(entry.image || entry.icon || "");
const letter = $derived((entry.label.charAt(0) || "?").toUpperCase());

const host = $derived.by(() => {
	try {
		return new URL(entry.href).hostname.replace(/^www\./, "");
	} catch {
		return entry.href;
	}
});
</script>

<article class="bookmark-card" use:reveal={{ delay }}>
	<a
		class="bookmark-card__link"
		href={entry.href}
		target="_blank"
		rel="noopener noreferrer"
	>
		<div class="bookmark-card__header">
			<span class="bookmark-card__icon-box" aria-hidden="true">
				{#if (iconKind === "image" || iconKind === "iconify") && !imgFailed}
					{#if iconKind === "iconify"}
						<Icon icon={entry.icon!} width="26" height="26" />
					{:else}
						<img
							src={imageSrc}
							alt=""
							loading="lazy"
							decoding="async"
							onerror={() => (imgFailed = true)}
						/>
					{/if}
				{:else}
					<span class="bookmark-card__letter">{letter}</span>
				{/if}
			</span>
			<span class="bookmark-card__title" title={entry.label}>{entry.label}</span>
		</div>

		{#if entry.note}
			<p class="bookmark-card__desc" title={entry.note}>{entry.note}</p>
		{:else}
			<p class="bookmark-card__desc bookmark-card__desc--empty"></p>
		{/if}

		<div class="bookmark-card__footer">
			<span class="bookmark-card__host">
				{host}
			</span>
		</div>
	</a>
</article>

<style>
.bookmark-card {
	position: relative;
	display: flex;
	flex-direction: column;
	background: var(--card-bg);
	border: none;
	border-radius: var(--shape-corner-l);
	transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard),
		transform var(--m3e-duration-short) var(--m3e-easing-standard);
	overflow: hidden;
}

.bookmark-card:hover {
	background: var(--surface-container-high);
	transform: translateY(-2px);
}

.bookmark-card__link {
	display: flex;
	flex-direction: column;
	padding: 1.15rem 1.25rem 1.1rem;
	text-decoration: none;
	color: inherit;
	height: 100%;
}

.bookmark-card__header {
	display: flex;
	align-items: center;
	gap: 0.85rem;
	margin-bottom: 0.75rem;
}

.bookmark-card__icon-box {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2.75rem;
	height: 2.75rem;
	flex-shrink: 0;
	border-radius: var(--shape-corner-m);
	background: var(--surface-container);
	border: none;
	overflow: hidden;
	color: var(--primary);
	transition: transform var(--m3e-duration-short) var(--m3e-easing-standard);
}

.bookmark-card:hover .bookmark-card__icon-box {
	transform: scale(1.05);
}

.bookmark-card__icon-box > :global(img) {
	width: 100%;
	height: 100%;
	object-fit: contain;
	padding: 0.35rem;
	border-radius: inherit;
}

.bookmark-card__letter {
	font-weight: 700;
	font-size: 1.25rem;
	color: var(--primary);
}

.bookmark-card__title {
	font-size: 1.05rem;
	font-weight: 600;
	color: var(--on-surface);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.3;
}

.bookmark-card__desc {
	font-size: 0.875rem;
	line-height: 1.45;
	color: var(--on-surface-variant);
	margin: 0 0 1rem 0;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	min-height: 2.55rem;
}

.bookmark-card__desc--empty {
	min-height: 1rem;
}

.bookmark-card__footer {
	margin-top: auto;
	display: flex;
	align-items: center;
}

.bookmark-card__host {
	display: inline-flex;
	align-items: center;
	font-size: 0.75rem;
	font-weight: 500;
	padding: 0.2rem 0.6rem;
	border-radius: var(--shape-corner-full);
	background: var(--surface-container-low);
	border: none;
	color: var(--on-surface-variant);
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}

.bookmark-card:hover .bookmark-card__host {
	color: var(--on-surface);
}
</style>
