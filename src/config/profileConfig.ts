import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/nullvert.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "nullvert",
	bio: "Черновики и заметки",
	links: [
		{
			name: "Канал",
			icon: "fa7-solid:paper-plane",
			url: "https://t.me/glytsin",
		},
		{
			name: "Chess",
			icon: "fa7-solid:chess-knight",
			url: "https://www.chess.com/member/redxwin",
		},
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/nullvert",
		},
	],
});

// #TODO
