/**
 * 站点书签数据源（Bookmarks）。
 * 读取 Raindrop.io 同步快照：src/data/snapshots/bookmarks.json。
 */

/** 单条书签记录 */
export interface BookmarkEntry {
	label: string;
	href: string;
	note?: string;
	icon?: string;
	image?: string;
}

/** 分组/文件夹 */
export interface BookmarkShelf {
	key: string;
	name: string;
	icon?: string;
	blurb?: string;
	entries: BookmarkEntry[];
}

export const defaultBookmarksData: BookmarkShelf[] = [
	{
		key: "dev",
		name: "Development",
		icon: "material-symbols:code-rounded",
		blurb: "Sites I keep open while writing code",
		entries: [
			{
				label: "GitHub",
				href: "https://github.com",
				note: "Code hosting & collaboration",
				icon: "fa7-brands:github",
			},
			{
				label: "MDN",
				href: "https://developer.mozilla.org",
				note: "Authoritative web docs",
				icon: "material-symbols:menu-book-rounded",
			},
			{
				label: "Stack Overflow",
				href: "https://stackoverflow.com",
				note: "Q&A and debugging",
			},
		],
	},
	{
		key: "design",
		name: "Design & Inspiration",
		icon: "material-symbols:palette-outline-rounded",
		blurb: "Color palettes, icons, typography, and visual systems",
		entries: [
			{
				label: "Dribbble",
				href: "https://dribbble.com",
				note: "Design inspiration showcase",
				icon: "fa7-brands:dribbble",
			},
			{
				label: "Google Fonts",
				href: "https://fonts.google.com",
				note: "Open-source typography library",
			},
			{
				label: "Material Design 3",
				href: "https://m3.material.io",
				note: "Official M3 specification and design tokens",
			},
		],
	},
	{
		key: "reading",
		name: "Reading & Subscriptions",
		icon: "material-symbols:auto-stories-outline-rounded",
		blurb: "Articles, blogs, and industry feeds I follow",
		entries: [
			{
				label: "Hacker News",
				href: "https://news.ycombinator.com",
				note: "Tech & startup discussion",
				icon: "fa7-brands:y-combinator",
			},
			{
				label: "Solidot",
				href: "https://www.solidot.org",
				note: "Tech and culture news",
			},
		],
	},
];

import bookmarkSnapshot from "./snapshots/bookmarks.json";

function resolveShelfIcon(key: string, name: string, icon?: string): string {
	if (icon) return icon;
	const text = `${name} ${key}`.toLowerCase();
	if (text.includes("игр") || text.includes("game"))
		return "material-symbols:sports-esports-outline-rounded";
	if (
		text.includes("разработ") ||
		text.includes("веб") ||
		text.includes("dev") ||
		text.includes("code") ||
		text.includes("web")
	)
		return "material-symbols:code-rounded";
	if (
		text.includes("софт") ||
		text.includes("утилит") ||
		text.includes("tool") ||
		text.includes("soft")
	)
		return "material-symbols:build-outline-rounded";
	if (
		text.includes("дизайн") ||
		text.includes("design") ||
		text.includes("art")
	)
		return "material-symbols:palette-outline-rounded";
	if (text.includes("читат") || text.includes("read") || text.includes("book"))
		return "material-symbols:auto-stories-outline-rounded";
	return "material-symbols:folder-outline-rounded";
}

export const bookmarksData: BookmarkShelf[] =
	Array.isArray(bookmarkSnapshot?.items) && bookmarkSnapshot.items.length > 0
		? (bookmarkSnapshot.items as BookmarkShelf[]).map((shelf) => ({
				...shelf,
				icon: resolveShelfIcon(shelf.key, shelf.name, shelf.icon),
			}))
		: defaultBookmarksData;

/** Backward compatibility aliases */
export type CompassEntry = BookmarkEntry;
export type CompassShelf = BookmarkShelf;
export const defaultCompassData: BookmarkShelf[] = defaultBookmarksData;
export const compassData: BookmarkShelf[] = bookmarksData;
