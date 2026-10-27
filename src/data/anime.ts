/**
 * 番剧收藏数据（本地数据源 / AniList 快照）。
 * 用于番剧页：src/pages/anime.astro → organisms/MediaSection → molecules/MediaPosterCard。
 *
 * 优先读取 AniList 同步生成的本地快照：src/data/snapshots/anilist.json。
 * 零运行时请求，构建期打包，封面存放在 public/assets/media/anime/。
 */
import type { AnimeIdentity } from "../types/animeConfig.ts";

/** 收藏状态（标准五态） */
export type AnimeStatus =
	| "watching"
	| "completed"
	| "planned"
	| "onHold"
	| "dropped";

export interface AnimeItem {
	title: string;
	/** 封面图地址（相对 /public 或绝对 URL）；省略 = 渐变占位 */
	cover?: string;
	/** 条目外链（AniList/Bangumi 等） */
	link?: string;
	status: AnimeStatus;
	/** 个人评分 0-10 */
	rating: number;
	/** 追番进度：已看 / 总集数 */
	progress?: { watched: number; total: number };
	/** 一句话感想 / 简介 */
	description?: string;
	/** 放送年份（展示用） */
	year: string;
	/** 制作公司 / 动画工房 */
	studio?: string;
	/** 题材标签 */
	genres: string[];
	/** 社区平均评分 (0-100) */
	communityRating?: number;
	/** 播放格式 (TV, Movie, OVA, etc.) */
	format?: string;
	/** 播放季度 (WINTER, SPRING, SUMMER, FALL) */
	season?: string;
	/** 重温次数 */
	repeat?: number;
	/** 观看时间段（年-月） */
	period?: { start: string; end: string };
	/** 条目来源身份标识（用于跨源去重与归档） */
	identity?: AnimeIdentity;
}

export const defaultAnimeData: AnimeItem[] = [
	{
		title: "Lycoris Recoil",
		cover: "/assets/anime/lkls.webp",
		link: "https://www.bilibili.com/bangumi/media/md28338623",
		status: "completed",
		rating: 9.8,
		progress: { watched: 12, total: 12 },
		description: "Girl's gunfight",
		year: "2022",
		studio: "A-1 Pictures",
		genres: ["Action", "Slice of Life"],
		period: { start: "2022-07", end: "2022-09" },
	},
	{
		title: "Yowamushi Pedal",
		cover: "/assets/anime/rynh.webp",
		link: "https://www.bilibili.com/bangumi/media/md2590",
		status: "watching",
		rating: 9.5,
		progress: { watched: 8, total: 12 },
		description: "Girl's daily life, sweet and healing",
		year: "2015",
		studio: "Nexus",
		genres: ["Daily life", "Healing"],
		period: { start: "2015-07", end: "2015-09" },
	},
	{
		title: "Asteroid in Love",
		cover: "/assets/anime/laxxx.webp",
		link: "https://www.bilibili.com/bangumi/media/md28224128",
		status: "watching",
		rating: 9.2,
		progress: { watched: 5, total: 12 },
		description: "Meeting girls among the stars, pure love and healing",
		year: "2020",
		studio: "Doga Kobo",
		genres: ["Romance", "Healing"],
		period: { start: "2020-01", end: "2020-03" },
	},
	{
		title: "Is the Order a Rabbit?",
		cover: "/assets/anime/tz1.webp",
		link: "https://www.bilibili.com/bangumi/media/md2762",
		status: "planned",
		rating: 9.0,
		progress: { watched: 12, total: 12 },
		description: "A group of girls' warm daily life",
		year: "2014",
		studio: "White Fox",
		genres: ["Daily life", "Healing"],
		period: { start: "2014-04", end: "2014-06" },
	},
	{
		title: "The Secret of the Magic Girl",
		cover: "/assets/anime/cmmn.webp",
		link: "https://www.bilibili.com/bangumi/media/md26625039",
		status: "watching",
		rating: 9.0,
		progress: { watched: 8, total: 12 },
		description: "Muli, Muli!",
		year: "2024",
		studio: "C2C",
		genres: ["Daily life", "Healing", "Magic"],
		period: { start: "2025-07", end: "2025-10" },
	},
];

export const animeData: AnimeItem[] = defaultAnimeData;
