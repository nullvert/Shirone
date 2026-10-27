/**
 * Цветовые и иконочные метаданные статусов медиа в дизайн-системе M3E.
 * Используются единым шаблоном MediaCard / MediaSection для Anime, Cinema, Games.
 */

import I18nKey from "@i18n/i18nKey";
import type { MediaStatus } from "@/types/media";

export interface StatusStyleMeta {
	key: I18nKey;
	icon: string;
	color: string;
	bg: string;
	fg: string;
}

export const MEDIA_STATUS_STYLES: Record<MediaStatus, StatusStyleMeta> = {
	watching: {
		key: I18nKey.animeStatusWatching,
		icon: "material-symbols:play-arrow-rounded",
		color: "var(--primary)",
		bg: "var(--primary)",
		fg: "var(--on-primary)",
	},
	playing: {
		key: I18nKey.gamesStatusPlaying,
		icon: "material-symbols:sports-esports-outline-rounded",
		color: "var(--primary)",
		bg: "var(--primary)",
		fg: "var(--on-primary)",
	},
	completed: {
		key: I18nKey.animeStatusCompleted,
		icon: "material-symbols:check-rounded",
		color: "var(--tertiary)",
		bg: "var(--tertiary)",
		fg: "var(--on-tertiary)",
	},
	planned: {
		key: I18nKey.animeStatusPlanned,
		icon: "material-symbols:bookmark-outline-rounded",
		color: "var(--secondary)",
		bg: "var(--secondary)",
		fg: "var(--on-secondary)",
	},
	backlog: {
		key: I18nKey.gamesStatusBacklog,
		icon: "material-symbols:hourglass-empty-rounded",
		color: "var(--secondary)",
		bg: "var(--secondary)",
		fg: "var(--on-secondary)",
	},
	onHold: {
		key: I18nKey.animeStatusOnHold,
		icon: "material-symbols:pause-rounded",
		color: "var(--surface-tint)",
		bg: "var(--surface-container-highest)",
		fg: "var(--on-surface)",
	},
	dropped: {
		key: I18nKey.animeStatusDropped,
		icon: "material-symbols:close-rounded",
		color: "var(--error)",
		bg: "var(--error)",
		fg: "var(--on-error)",
	},
	wishlist: {
		key: I18nKey.gamesStatusWishlist,
		icon: "fa7-brands:steam",
		color: "var(--primary)",
		bg: "var(--primary)",
		fg: "var(--on-primary)",
	},
};
