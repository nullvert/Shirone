<script lang="ts">
/**
 * MediaPosterCard — M3E карточка медиа:
 * - Углы: 0px (строгий прямоугольный срез постера).
 * - Бейдж оценки: всегда чистый белый/светлый текст без раскрашивания цифры.
 * - Цвета анимированных рамок при hover (по шкале оценок, гармонирующие с сайтом):
 *   - 10: Золото / янтарный (#f59e0b) — особенный грейд шедевра;
 *   - 8–9.9: Фиолетовый (#a855f7);
 *   - 6–7.9: Бирюзовый (#06b6d4);
 *   - 4–5.9: Синий (#3b82f6);
 *   - 3.9 и ниже: Красный (#ef4444);
 *   - Без оценки / Wishlist: акцентный цвет статуса.
 * - Верхний левый угол:
 *   - Вишлист: #1, #2 (без дублирования #).
 *   - Статус: аккуратный бейдж (26-34px) со скругленным правым нижним углом.
 * - Верхний правый угол:
 *   - Вишлист: Steam бейдж (скидка -% + цена).
 *   - Оценка: число рейтинга (например, 10, 9, 8.2) со скругленным левым нижним углом.
 * - Оверлей:
 *   - Чистая мета: автор/студия · время · год (без платформы и без дублирования цены).
 *   - Интернационализированный прогресс (Progress, ep, h, min).
 */

import MediaCardBadges from "@components/molecules/MediaCardBadges.svelte";
import MediaCardCover from "@components/molecules/MediaCardCover.svelte";
import MediaCardFx from "@components/molecules/MediaCardFx.svelte";
import MediaCardOverlay from "@components/molecules/MediaCardOverlay.svelte";
import {
	getCleanRank,
	getProgressPercent,
	getRatingTier,
	getSeasonYear,
} from "@utils/media/card";
import { MEDIA_STATUS_STYLES } from "@utils/media/status";
import { reveal } from "@utils/motion";
import type { MediaItem } from "@/types/media";

let {
	item,
	pageType,
	delay = 0,
	simulatedHover = false,
}: {
	item: MediaItem;
	pageType?: "anime" | "cinema" | "games";
	delay?: number;
	simulatedHover?: boolean;
} = $props();

const statusStyle = $derived(
	MEDIA_STATUS_STYLES[item.status] ?? MEDIA_STATUS_STYLES.watching,
);

// Rating tier / rank / progress logic lives in utils/media/card.ts
const ratingTier = $derived(getRatingTier(item));
const cleanRank = $derived(getCleanRank(item));
const progressPercent = $derived(getProgressPercent(item));

const resolvedPageType = $derived(pageType ?? item.kind ?? "cinema");
const showTitleOnPoster = $derived(resolvedPageType === "anime");

const formattedSeasonYear = $derived(getSeasonYear(item));

let articleEl: HTMLElement | null = $state(null);
</script>

<article
	bind:this={articleEl}
	class="media-card media-card--page-{resolvedPageType} media-card--rating-{ratingTier}"
	class:media-card--hovered={simulatedHover}
	class:media-card--title-on-poster={showTitleOnPoster}
	data-status={item.status}
	style={`--media-status-color: ${statusStyle.color};`}
	use:reveal={{ delay }}
>
	<div class="media-card__media-wrap">
		<!-- Ссылка / кликабельная область -->
		<a
			class="media-card__media-link"
			href={item.link || "#"}
			target={item.link ? "_blank" : undefined}
			rel={item.link ? "noopener noreferrer" : undefined}
			tabindex={item.link ? 0 : -1}
			aria-label={item.title}
		>
			<MediaCardCover {item} />
			<MediaCardBadges {item} {cleanRank} {statusStyle} />

			<!-- Scrim -->
			<div class="media-card__scrim" aria-hidden="true"></div>

			<MediaCardOverlay {item} pageType={resolvedPageType} {formattedSeasonYear} {progressPercent} />
		</a>

		<MediaCardFx {ratingTier} />
	</div>
</article>

<style>
.media-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  overflow: visible;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
/* ── Контейнер постера: строгий прямоугольный срез (0px) ── */
/* ── Masterpiece: 3D Tilt + Премиальный золотой матовый глянец на оверлее ── */
/* ── 2. Фиолетовый: 8 – 9.9 ── */
/* ── 3. Акцент темы: 4.0 – 7.9 ── */
/* ── 4. Красный: 0 – 3.9 ── */
/* ── Вишлист ── */
}
.media-card:hover,
.media-card--hovered {
  z-index: 5;
}
.media-card__media-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  height: auto;
  overflow: visible;
  border-radius: 0;
  background: var(--surface-container-high);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
  flex-shrink: 0;
  transform: translateZ(0);
  container-type: inline-size;
  --badge-size: clamp(1.75rem, 12cqw, 2.125rem);
  transition: box-shadow var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
}
.media-card:hover .media-card__media-wrap,
.media-card--hovered .media-card__media-wrap {
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
}
.media-card--rating-masterpiece {
  --electric-color: #ff9410;
  --tier-hi: #ffe6a3;
  --tier-lo: #b8741a;
}
.media-card--rating-great {
  --electric-color: #b57cff;
  --tier-hi: #eadcff;
  --tier-lo: #6d3fc4;
}
.media-card--rating-regular {
  --electric-color: var(--primary);
}
.media-card--rating-poor {
  --electric-color: #ef4444;
  --tier-hi: #fca5a5;
  --tier-lo: #991b1b;
}
.media-card--rating-wishlist {
  --electric-color: #38bdf8;
}
.media-card--rating-wishlist-discount {
  --electric-color: #84cc16;
}
.media-card__media-link {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  border-radius: inherit;
  overflow: hidden;
}
.media-card__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 40%, rgba(0,0,0,0.35) 100%);
  opacity: 0.6;
  transition: opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
/* ── Сенсорные устройства и планшеты (iPad, телефоны, экраны < 1024px): чистое поведение без залипания и дёргания ховера ── */
@media (hover: none), (pointer: coarse), (max-width: 1023px) {
  .media-card {
    transition: none !important;
/* Отключаем трансформации и декоративные эффекты ховера */
/* Фиксируем стабильное положение текста без дёргания (никаких translate3d при тапе) */
/* Всегда стабильный 1-строчный компактный оверлей (студия, год, оценка) */
/* Скрываем hover-расширения (2-я строка и аккордеон с жанрами/прогрессом не дергают карточку) */
/* Оверлей всегда стабилен и полностью покрывает постер */
  }
  .media-card:hover,
  .media-card:active {
    z-index: 1 !important;
    transform: none !important;
  }
  .media-card :global(.media-card__overlay-title),
  .media-card :global(.media-card__overlay-meta) {
    transform: none !important;
    transition: none !important;
    opacity: 1 !important;
  }
  .media-card :global(.media-card__overlay-meta--normal) {
    display: flex !important;
  }
  .media-card :global(.media-card__overlay-meta--hover) {
    display: none !important;
  }
  .media-card :global(.media-card__overlay-details) {
    display: none !important;
  }
  .media-card :global(.media-card__overlay) {
    opacity: 1 !important;
    pointer-events: auto !important;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.02) 28%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.82) 70%, rgba(6,6,8,0.96) 88%, #060608 100%) !important;
  }
}
</style>
