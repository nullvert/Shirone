/**
 * 站点书签数据源（Bookmarks）。
 * 读取 Raindrop.io 同步快照：src/data/snapshots/bookmarks.json。
 */

/** 单条书签记录 */
export interface CompassEntry {
	label: string;
	href: string;
	note?: string;
	icon?: string;
	image?: string;
}

/** 分组/文件夹 */
export interface CompassShelf {
	key: string;
	name: string;
	icon?: string;
	blurb?: string;
	entries: CompassEntry[];
}

export const defaultCompassData: CompassShelf[] = [
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
		name: "Design",
		icon: "material-symbols:palette-outline-rounded",
		blurb: "Colors, icons and inspiration",
		entries: [
			{
				label: "Iconify",
				href: "https://icon-sets.iconify.design",
				note: "Searchable open-source icon sets",
			},
			{
				label: "Material Symbols",
				href: "https://fonts.google.com/icons",
				note: "Official M3 icon set",
				icon: "material-symbols:star-rounded",
			},
			{
				label: "Excalidraw",
				href: "https://excalidraw.com",
				note: "Hand-drawn whiteboard collaboration",
			},
		],
	},
	{
		key: "tools",
		name: "Tools",
		icon: "material-symbols:build-outline-rounded",
		entries: [
			{
				label: "Squoosh",
				href: "https://squoosh.app",
				note: "Image compression & conversion",
			},
			{
				label: "Regex101",
				href: "https://regex101.com",
				note: "Regex testing & debugging",
			},
		],
	},
	{
		key: "reads",
		name: "Reading",
		icon: "material-symbols:auto-stories-outline-rounded",
		entries: [
			{ label: "Hacker News", href: "https://news.ycombinator.com" },
			{ label: "V2EX", href: "https://www.v2ex.com" },
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
	if (text.includes("игр") || text.includes("game")) return "material-symbols:sports-esports-outline-rounded";
	if (text.includes("разработ") || text.includes("веб") || text.includes("dev") || text.includes("code") || text.includes("web")) return "material-symbols:code-rounded";
	if (text.includes("софт") || text.includes("утилит") || text.includes("tool") || text.includes("soft")) return "material-symbols:build-outline-rounded";
	if (text.includes("дизайн") || text.includes("design") || text.includes("art")) return "material-symbols:palette-outline-rounded";
	if (text.includes("читат") || text.includes("read") || text.includes("book")) return "material-symbols:auto-stories-outline-rounded";
	return "material-symbols:folder-outline-rounded";
}

export const compassData: CompassShelf[] =
	Array.isArray(bookmarkSnapshot?.items) && bookmarkSnapshot.items.length > 0
		? (bookmarkSnapshot.items as CompassShelf[]).map((shelf) => ({
				...shelf,
				icon: resolveShelfIcon(shelf.key, shelf.name, shelf.icon),
			}))
		: defaultCompassData;
