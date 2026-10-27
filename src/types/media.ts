/**
 * Унифицированная модель медиа-элементов для Shirone (Cinema, Games, Anime).
 * Соответствует единому дизайн-коду постеров и карточек библиотеки.
 */

export type MediaKind = "movie" | "show" | "game" | "anime";

export type MediaStatus =
	| "watching"
	| "playing"
	| "completed"
	| "planned"
	| "backlog"
	| "onHold"
	| "dropped"
	| "wishlist";

export interface MediaProgress {
	watched: number;
	total?: number;
	unit?: string;
}

export interface MediaPrice {
	amount?: string;
	currency?: string;
	discountPercent?: number;
	isFree?: boolean;
}

export interface MediaItem {
	id: string;
	title: string;
	kind?: MediaKind;
	cover?: string;
	link?: string;
	status: MediaStatus;
	rating?: number;
	communityRating?: number;
	progress?: MediaProgress;
	hours?: number;
	runtime?: number;
	year?: string;
	season?: string;
	format?: string;
	repeat?: number;
	genres: string[];
	description?: string;
	authorOrStudio?: string;
	platform?: string;
	rank?: number;
	price?: MediaPrice;
	lastWatchedOrPlayedAt?: string;
	statusColor?: string;
	statusLabel?: string;
}
