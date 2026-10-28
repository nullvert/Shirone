import { normalizeMediaGenres } from "../anime/genres.ts";
/**
 * Адаптеры данных для медиа-коллекций (Simkl, InfiniteBacklog, AniList).
 * Преобразуют локальные JSON-снапшоты в унифицированную структуру MediaItem.
 */

import anilistSnapshot from "@/data/snapshots/anilist.json";
import infinitebacklogSnapshot from "@/data/snapshots/infinitebacklog.json";
import simklSnapshot from "@/data/snapshots/simkl.json";
import type { MediaItem, MediaStatus } from "@/types/media";

function mapSimklStatus(rawStatus: string): MediaStatus {
	switch (rawStatus) {
		case "watching":
			return "watching";
		case "completed":
			return "completed";
		case "plantowatch":
		case "hold":
		case "planned":
			return "planned";
		case "dropped":
			return "dropped";
		default:
			return "watching";
	}
}

interface RawSimklItem {
	id?: string | number;
	ids?: { simkl?: string | number; slug?: string };
	title?: string;
	type?: string;
	cover?: string;
	link?: string;
	status?: string;
	rating?: number;
	progress?: { watched?: number; total?: number; unit?: string };
	year?: string | number;
	runtime?: number;
	genres?: string[];
	description?: string;
	directorOrStudio?: string;
	lastWatchedAt?: string;
}

export function getCinemaList(): MediaItem[] {
	if (!simklSnapshot || !Array.isArray(simklSnapshot.items)) {
		return [];
	}

	return (simklSnapshot.items as RawSimklItem[]).map((item) => {
		const isMovie = item.type === "movie";
		const isShow = item.type === "show";

		return {
			id: String(item.id || item.ids?.simkl || item.title),
			title: item.title || "",
			kind: isMovie ? "movie" : "show",
			cover: item.cover || "",
			link:
				item.link ||
				(item.ids?.slug
					? `https://simkl.com/${isMovie ? "movies" : "tv"}/${item.ids.simkl}/${item.ids.slug}`
					: undefined),
			status: mapSimklStatus(item.status || "watching"),
			rating: typeof item.rating === "number" ? item.rating : undefined,
			progress:
				isShow && item.progress
					? {
							watched: item.progress.watched || 0,
							total: item.progress.total || undefined,
							unit: item.progress.unit || "ep",
						}
					: undefined,
			year: item.year ? String(item.year) : undefined,
			runtime: typeof item.runtime === "number" ? item.runtime : undefined,
			genres: normalizeMediaGenres(item.genres),
			description: item.description || "",
			authorOrStudio: item.directorOrStudio || undefined,
			lastWatchedOrPlayedAt: item.lastWatchedAt || undefined,
		};
	});
}

function mapGameStatus(rawStatus: string): MediaStatus {
	switch (rawStatus) {
		case "playing":
			return "playing";
		case "completed":
			return "completed";
		case "planned":
		case "backlog":
			return "backlog";
		case "onHold":
		case "hold":
			return "onHold";
		case "dropped":
			return "dropped";
		case "wishlist":
			return "wishlist";
		default:
			return "backlog";
	}
}

interface RawGameItem {
	id?: string | number;
	slug?: string;
	title?: string;
	cover?: string;
	link?: string;
	status?: string;
	rating?: number;
	hours?: number;
	year?: string | number;
	genres?: string[];
	description?: string;
	developer?: string;
	platform?: string;
	rank?: number;
	price?: string;
	discount?: number;
	isFree?: boolean;
}

export function getGamesList(): MediaItem[] {
	if (
		!infinitebacklogSnapshot ||
		!Array.isArray(infinitebacklogSnapshot.items)
	) {
		return [];
	}

	return (infinitebacklogSnapshot.items as RawGameItem[]).map((item) => {
		const isWishlist =
			item.status === "wishlist" || Boolean(item.rank) || Boolean(item.price);

		return {
			id: String(item.id || item.slug || item.title),
			title: item.title || "",
			kind: "game",
			cover: item.cover || "",
			link: item.link || undefined,
			status: isWishlist ? "wishlist" : mapGameStatus(item.status || "backlog"),
			rating: typeof item.rating === "number" ? item.rating : undefined,
			hours: typeof item.hours === "number" ? item.hours : undefined,
			year: item.year ? String(item.year) : undefined,
			genres: normalizeMediaGenres(item.genres),
			description: item.description
				? item.description.replace(/<[^>]*>?/gm, "")
				: "",
			authorOrStudio: item.developer || undefined,
			platform: item.platform || undefined,
			rank:
				item.rank !== undefined && item.rank !== null
					? typeof item.rank === "number"
						? item.rank
						: Number.parseInt(String(item.rank).replace(/#/g, "").trim(), 10) ||
							undefined
					: undefined,
			price: item.price
				? {
						amount: item.price,
						discountPercent: item.discount || 0,
						isFree: Boolean(item.isFree),
					}
				: undefined,
		};
	});
}

interface RawAniListItem {
	id?: string | number;
	title?: string;
	cover?: string;
	link?: string;
	status?: MediaStatus;
	rating?: number;
	communityRating?: number;
	progress?: { watched?: number; total?: number };
	year?: string | number;
	season?: string;
	format?: string;
	repeat?: number;
	genres?: string[];
	description?: string;
	studio?: string;
}

export function getAnimeMediaList(): MediaItem[] {
	if (!anilistSnapshot || !Array.isArray(anilistSnapshot.items)) {
		return [];
	}

	return (anilistSnapshot.items as RawAniListItem[]).map((item) => ({
		id: String(item.id || item.title),
		title: item.title || "",
		kind: "anime",
		cover: item.cover || "",
		link: item.link || undefined,
		status: item.status || "watching",
		rating: typeof item.rating === "number" ? item.rating : undefined,
		communityRating:
			typeof item.communityRating === "number"
				? item.communityRating
				: undefined,
		progress: item.progress
			? {
					watched: item.progress.watched || 0,
					total: item.progress.total || undefined,
				}
			: undefined,
		year: item.year ? String(item.year) : undefined,
		season: item.season || undefined,
		format: item.format || undefined,
		repeat:
			typeof item.repeat === "number" && item.repeat > 0
				? item.repeat
				: undefined,
		genres: normalizeMediaGenres(item.genres),
		description: item.description
			? item.description.replace(/<[^>]*>?/gm, "")
			: "",
		authorOrStudio: item.studio || undefined,
	}));
}
