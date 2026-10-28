<script lang="ts">
/**
 * MediaCardFx - hover border / foil / aura effects for MediaPosterCard.
 * Чистая, строгая и быстрая рамка при ховере без разрывов и свисающих снизу артефактов.
 */
import type { MediaRatingTier } from "@utils/media/card";

let { ratingTier }: { ratingTier: MediaRatingTier } = $props();
</script>

<!-- Рамка при ховере для обычных карточек -->
{#if ratingTier !== "masterpiece"}
	<div class="media-card__border" aria-hidden="true"></div>
{/if}

<!-- Рамка и аура для Masterpiece (10) -->
{#if ratingTier === "masterpiece"}
	<div class="media-card__foil-shine" aria-hidden="true"></div>
	<div class="media-card__border media-card__border--masterpiece" aria-hidden="true"></div>
	<div class="media-card__gold-aura" aria-hidden="true"></div>
{/if}

<style>
/* Чистая физическая рамка строго по внешнему контуру постера */
.media-card__border {
  position: absolute;
  inset: -1.5px;
  z-index: 10;
  pointer-events: none;
  box-sizing: border-box;
  border-radius: inherit;
  border: 1.5px solid var(--electric-color, var(--media-status-color, var(--primary)));
  opacity: 0;
  transition: opacity var(--m3e-duration-short, 150ms) ease;
}

:global(.media-card:hover) .media-card__border,
:global(.media-card--hovered) .media-card__border {
  opacity: 1;
  box-shadow: 0 0 8px color-mix(in oklab, var(--electric-color, var(--media-status-color, var(--primary))) 40%, transparent);
}

.media-card__border--masterpiece {
  border-color: #f59e0b;
}

:global(.media-card:hover) .media-card__border--masterpiece,
:global(.media-card--hovered) .media-card__border--masterpiece {
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.55);
}

.media-card__gold-aura {
  position: absolute;
  inset: -6px;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  border-radius: inherit;
  background: radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 179, 56, 0.28) 0%, rgba(255, 148, 16, 0.08) 50%, transparent 80%);
  filter: blur(14px);
  transition: opacity 0.6s var(--m3e-easing-standard);
}
:global(.media-card:hover) .media-card__gold-aura,
:global(.media-card--hovered) .media-card__gold-aura {
  opacity: 1;
}

.media-card__foil-shine {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 0;
  border-radius: inherit;
  overflow: hidden;
  mix-blend-mode: screen;
  background:
    linear-gradient(calc(115deg + var(--px, 50%) * 0.4), transparent 15%, rgba(255, 215, 0, 0.45) 35%, rgba(255, 120, 220, 0.4) 48%, rgba(0, 240, 255, 0.4) 55%, rgba(255, 235, 120, 0.5) 65%, transparent 85%),
    radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.5) 0%, rgba(255, 215, 0, 0.3) 35%, transparent 70%);
  background-size: 200% 200%, 100% 100%;
  background-position: var(--px, 50%) var(--py, 50%), 0 0;
  transition: opacity 0.5s var(--m3e-easing-standard);
}
:global(.media-card:hover) .media-card__foil-shine,
:global(.media-card--hovered) .media-card__foil-shine {
  opacity: 0.9;
}
</style>
