/**
 * Чистые функции представления медиа-карточки (без DOM и состояния).
 * Вынесены из MediaPosterCard, чтобы молекула отвечала только за разметку.
 */

import type { MediaItem } from "@/types/media";

export type MediaRatingTier =
	| "wishlist-discount"
	| "wishlist"
	| "masterpiece"
	| "great"
	| "regular"
	| "poor";

/** Вишлист-детекция: статус wishlist, ранг или цена. */
export function isWishlistItem(item: MediaItem): boolean {
	return Boolean(item.status === "wishlist" || item.rank || item.price);
}

export function hasDiscount(item: MediaItem): boolean {
	return Boolean(item.price?.discountPercent && item.price.discountPercent > 0);
}

/**
 * Уровень рамки:
 * - вишлист: со скидкой / без;
 * - 10: masterpiece, 8–9.9: great, 4–7.9 и без оценки: regular, ниже 4: poor.
 */
export function getRatingTier(item: MediaItem): MediaRatingTier {
	if (isWishlistItem(item)) {
		return hasDiscount(item) ? "wishlist-discount" : "wishlist";
	}
	if (item.rating !== undefined && item.rating !== null && item.rating > 0) {
		if (item.rating >= 10) return "masterpiece";
		if (item.rating >= 8.0) return "great";
		if (item.rating >= 4.0) return "regular";
		return "poor";
	}
	return "regular";
}

/** Чистый номер ранга без лишних решёток (#8, а не ##8). */
export function getCleanRank(item: MediaItem): string | null {
	if (item.rank === undefined || item.rank === null) return null;
	const num = String(item.rank).replace(/#/g, "").trim();
	return num ? `#${num}` : null;
}

export function getProgressPercent(item: MediaItem): number {
	if (item.progress?.total && item.progress.total > 0) {
		return Math.round(
			Math.min((item.progress.watched / item.progress.total) * 100, 100),
		);
	}
	return 0;
}

/** Форматированный сезон + год: "Summer 2022" или "2022". */
export function getSeasonYear(item: MediaItem): string | number {
	if (item.season && item.year) {
		const s =
			item.season.charAt(0).toUpperCase() + item.season.slice(1).toLowerCase();
		return `${s} ${item.year}`;
	}
	return item.year || "";
}
