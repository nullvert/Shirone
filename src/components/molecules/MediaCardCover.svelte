<script lang="ts">
/**
 * MediaCardCover - poster image with skeleton, error fallback and placeholder.
 * Owned by MediaPosterCard; keeps the loading state local to the image.
 */
import Icon from "@components/atoms/display/Icon.svelte";
import Skeleton from "@components/atoms/display/Skeleton.svelte";
import { url } from "@utils/url-utils";
import type { MediaItem } from "@/types/media";

let { item }: { item: MediaItem } = $props();

let isImageLoaded = $state(false);
let isImageError = $state(false);

function checkImage(node: HTMLImageElement) {
	if (node.complete && node.naturalWidth > 0) {
		isImageLoaded = true;
	}
}
</script>

<!-- Обложка / Скелетон -->
{#if item.cover && !isImageError}
	{#if !isImageLoaded}
		<div class="media-card__skeleton" aria-hidden="true">
			<Skeleton variant="rect" />
		</div>
	{/if}
	<img
		class="media-card__cover"
		class:media-card__cover--loaded={isImageLoaded}
		src={url(item.cover)}
		alt={item.title}
		loading="lazy"
		referrerpolicy="no-referrer"
		onload={() => (isImageLoaded = true)}
		onerror={() => (isImageError = true)}
		use:checkImage
	/>
{:else}
	<div class="media-card__placeholder" aria-hidden="true">
		<div class="media-card__placeholder-glow"></div>
		<div class="media-card__placeholder-content">
			<Icon
				icon={item.kind === "game"
					? "material-symbols:sports-esports-outline-rounded"
					: "material-symbols:movie-outline-rounded"}
				class="media-card__placeholder-icon"
			/>
			<span class="media-card__placeholder-title">{item.title}</span>
			<span class="media-card__placeholder-hint">Offline</span>
		</div>
	</div>
{/if}

<style>
.media-card__skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.media-card__skeleton :global(.m3-skeleton) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
}
.media-card__cover {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--m3e-duration-medium) ease;
}
.media-card__cover--loaded {
  opacity: 1;
}
.media-card__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  color: var(--on-surface-variant);
  background: radial-gradient(circle at 50% 30%, var(--surface-container-high) 0%, var(--surface-container-lowest) 100%);
  overflow: hidden;
  user-select: none;
}
.media-card__placeholder-glow {
  position: absolute;
  top: -20%;
  left: 10%;
  width: 80%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(100, 150, 255, 0.12) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}
.media-card__placeholder-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  width: 100%;
}
.media-card :global(.media-card__placeholder-icon) {
  width: 2.75rem;
  height: 2.75rem;
  opacity: 0.55;
  color: var(--primary);
}
.media-card__placeholder-title {
  font: var(--m3e-type-label-medium);
  font-weight: 700;
  font-size: 0.8125rem;
  line-height: 1.25;
  color: var(--on-surface);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.85;
}
.media-card__placeholder-hint {
  font: var(--m3e-type-label-small);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--on-surface-variant);
  opacity: 0.65;
  padding: 0.125rem 0.5rem;
  border-radius: var(--shape-corner-full, 999px);
  background: rgba(255,255,255,0.06);
}
</style>
