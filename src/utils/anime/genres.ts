/**
 * Unified Media Taxonomy (AniList, TMDb/Simkl, IGDB/InfiniteBacklog):
 * Icons and display fallbacks using Material Symbols Rounded.
 */

export const MEDIA_GENRE_ICONS: Record<string, string> = {
	// --- Common / Shared Genres ---
	Action: "material-symbols:swords-rounded",
	Adventure: "material-symbols:explore-rounded",
	Comedy: "material-symbols:sentiment-very-satisfied-rounded",
	Drama: "material-symbols:theater-comedy-rounded",
	Fantasy: "material-symbols:auto-awesome-rounded",
	Horror: "material-symbols:skull",
	Music: "material-symbols:music-note-rounded",
	Mystery: "material-symbols:mystery-rounded",
	Romance: "material-symbols:favorite-rounded",
	Thriller: "material-symbols:siren-rounded",
	Suspense: "material-symbols:crisis-alert-rounded",
	Family: "material-symbols:family-restroom-rounded",

	// --- Sci-Fi ---
	"Sci-Fi": "material-symbols:rocket-launch-rounded",

	// --- Anime Specific ---
	Ecchi: "material-symbols:lips-rounded",
	"Mahou Shoujo": "material-symbols:wand-stars-rounded",
	Mecha: "material-symbols:robot-2-rounded",
	Psychological: "material-symbols:psychology-rounded",
	"Slice of Life": "material-symbols:coffee-rounded",
	Supernatural: "material-symbols:moon-stars-rounded",

	// --- Cinema / TV Specific ---
	Animation: "material-symbols:animation-rounded",
	Crime: "material-symbols:local-police-rounded",
	Documentary: "material-symbols:video-camera-front-rounded",
	History: "material-symbols:history-rounded",
	"Mini-Series": "material-symbols:video-library-rounded",
	"TV Movie": "material-symbols:live-tv-rounded",
	War: "material-symbols:shield-rounded",
	Western: "material-symbols:nature-people-rounded",

	// --- Games Specific (IGDB / InfiniteBacklog) ---
	RPG: "material-symbols:shield-person-rounded",
	Indie: "material-symbols:diamond-rounded",
	Shooter: "material-symbols:my-location-rounded",
	Platform: "material-symbols:sports-gymnastics-rounded",
	Puzzle: "material-symbols:extension-rounded",
	Simulator: "material-symbols:precision-manufacturing-rounded",
	Racing: "material-symbols:sports-motorsports-rounded",
	"Beat 'em up": "material-symbols:sports-kabaddi-rounded",
	Fighting: "material-symbols:sports-mma-rounded",
	"Turn-Based Strategy": "material-symbols:grid-view-rounded",
	Strategy: "material-symbols:chess-rounded",
	Tactical: "material-symbols:alt-route-rounded",
	Casual: "material-symbols:gamepad-rounded",
	Arcade: "material-symbols:joystick-rounded",
	"Point-and-click": "material-symbols:mouse-rounded",
	"Visual Novel": "material-symbols:auto-stories-rounded",
	"Card & Board Game": "material-symbols:style-rounded",
	MOBA: "material-symbols:swords-rounded",

	// --- Sports ---
	Sports: "material-symbols:sports-soccer",
};

/** Backward compatibility alias */
export const ANIME_GENRE_ICONS: Record<string, string> = MEDIA_GENRE_ICONS;

export const ANIME_FORMAT_ICONS: Record<string, string> = {
	TV: "material-symbols:tv-rounded",
	TV_SHORT: "material-symbols:timer-rounded",
	MOVIE: "material-symbols:movie-rounded",
	SPECIAL: "material-symbols:stars-rounded",
	OVA: "material-symbols:album",
	ONA: "material-symbols:stream-rounded",
	MANGA: "material-symbols:menu-book-rounded",
	ONE_SHOT: "material-symbols:description-rounded",
	NOVEL: "material-symbols:book-rounded",
};

const GENRE_FALLBACK = "material-symbols:category-rounded";
const FORMAT_FALLBACK = "material-symbols:video-file-rounded";

/**
 * Normalizes raw incoming genres from providers to canonical names,
 * eliminating duplicates like "Science-Fiction" vs "Science Fiction" -> "Sci-Fi",
 * "Sports" vs "Sport" -> "Sports", etc.
 */
export function normalizeMediaGenre(genre: string): string {
	if (!genre) return "";
	const trimmed = genre.trim();
	const lower = trimmed.toLowerCase();

	if (
		lower === "science-fiction" ||
		lower === "science fiction" ||
		lower === "sci-fi" ||
		lower === "sci fi"
	) {
		return "Sci-Fi";
	}
	if (lower === "sport" || lower === "sports") {
		return "Sports";
	}
	if (lower === "simulation" || lower === "simulator") {
		return "Simulator";
	}
	if (lower === "tbs" || lower === "turn-based strategy" || lower === "turn-based strategy (tbs)") {
		return "Turn-Based Strategy";
	}
	if (lower === "rpg" || lower === "role-playing (rpg)") {
		return "RPG";
	}
	if (lower === "beat 'em up" || lower === "hack and slash / beat 'em up") {
		return "Beat 'em up";
	}
	if (lower === "rts" || lower === "real time strategy (rts)") {
		return "Strategy";
	}
	return trimmed;
}

export function normalizeMediaGenres(genres: string[] | undefined | null): string[] {
	if (!Array.isArray(genres)) return [];
	const seen = new Set<string>();
	const result: string[] = [];
	for (const raw of genres) {
		const canonical = normalizeMediaGenre(raw);
		if (canonical && !seen.has(canonical.toLowerCase())) {
			seen.add(canonical.toLowerCase());
			result.push(canonical);
		}
	}
	return result;
}

export function getGenreIcon(genre: string): string {
	if (!genre) return GENRE_FALLBACK;
	const canonical = normalizeMediaGenre(genre);
	if (MEDIA_GENRE_ICONS[canonical]) return MEDIA_GENRE_ICONS[canonical];

	const trimmed = canonical.trim().toLowerCase();
	const match = Object.keys(MEDIA_GENRE_ICONS).find(
		(k) => k.toLowerCase() === trimmed,
	);
	return match ? MEDIA_GENRE_ICONS[match] : GENRE_FALLBACK;
}

export function getGenreDisplayName(genre: string): string {
	const canonical = normalizeMediaGenre(genre);
	if (canonical === "Mahou Shoujo") return "Magical Girl";
	return canonical;
}

export function getFormatIcon(format: string): string {
	const key = format.toUpperCase().replace(/\s+/g, "_");
	return ANIME_FORMAT_ICONS[key] ?? FORMAT_FALLBACK;
}
