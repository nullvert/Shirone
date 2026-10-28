/**
 * 8-preset Theme Color tokens matching Shirone Theme Presets exactly:
 * 7 rainbow hues + 1 monochrome.
 */

export interface GenreColorToken {
	id: string;
	hue: number;
	isMono?: boolean;
	// Saturated accent color (for icons / text)
	accentLight: string;
	accentDark: string;
	// Tonal pill background (for sidebar buttons)
	pillBgLight: string;
	pillBgDark: string;
	pillTextLight: string;
	pillTextDark: string;
}

export const GENRE_COLOR_PALETTES: GenreColorToken[] = [
	{
		id: "red",
		hue: 80,
		accentLight: "#b3261e",
		accentDark: "#ff897d",
		pillBgLight: "rgba(179, 38, 30, 0.12)",
		pillBgDark: "rgba(255, 137, 125, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "orange",
		hue: 110,
		accentLight: "#bf5600",
		accentDark: "#ffb77a",
		pillBgLight: "rgba(191, 86, 0, 0.12)",
		pillBgDark: "rgba(255, 183, 122, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "yellow",
		hue: 146,
		accentLight: "#856d00",
		accentDark: "#f0cf65",
		pillBgLight: "rgba(133, 109, 0, 0.12)",
		pillBgDark: "rgba(240, 207, 101, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "green",
		hue: 195,
		accentLight: "#1e7e34",
		accentDark: "#7fe49b",
		pillBgLight: "rgba(30, 126, 52, 0.12)",
		pillBgDark: "rgba(127, 228, 155, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "cyan",
		hue: 265,
		accentLight: "#007a8c",
		accentDark: "#5ee2f8",
		pillBgLight: "rgba(0, 122, 140, 0.12)",
		pillBgDark: "rgba(94, 226, 248, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "blue",
		hue: 318,
		accentLight: "#2563eb",
		accentDark: "#9abaff",
		pillBgLight: "rgba(37, 99, 235, 0.12)",
		pillBgDark: "rgba(154, 186, 255, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "violet",
		hue: 350,
		accentLight: "#7c3aed",
		accentDark: "#d6bbfb",
		pillBgLight: "rgba(124, 58, 237, 0.12)",
		pillBgDark: "rgba(214, 187, 251, 0.1)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
	{
		id: "monochrome",
		hue: 0,
		isMono: true,
		accentLight: "#4b5563",
		accentDark: "#d1d5db",
		pillBgLight: "rgba(75, 85, 99, 0.1)",
		pillBgDark: "rgba(255, 255, 255, 0.06)",
		pillTextLight: "#1e293b",
		pillTextDark: "rgba(255, 255, 255, 0.9)",
	},
];

/**
 * Retrieve color token by explicit sequential index (0..7, where 7 = monochrome)
 * or deterministic string hash if index is not provided.
 */
export function getGenreColor(genreNameOrIndex: string | number): GenreColorToken {
	if (typeof genreNameOrIndex === "number") {
		const idx = Math.abs(genreNameOrIndex) % GENRE_COLOR_PALETTES.length;
		return GENRE_COLOR_PALETTES[idx];
	}

	let hash = 0;
	for (let i = 0; i < genreNameOrIndex.length; i++) {
		hash = (hash << 5) - hash + genreNameOrIndex.charCodeAt(i);
		hash |= 0;
	}
	const index = Math.abs(hash) % GENRE_COLOR_PALETTES.length;
	return GENRE_COLOR_PALETTES[index];
}
