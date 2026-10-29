import type { SupportConfig } from "../types/supportConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const supportConfig: SupportConfig = withUserConfig("support", {
	enable: true,
	title: "$t:supportTitle",
	description: "",

	/** 1. Финансовая поддержка (Hero-карточки) */
	tapsUrl: "https://taps.uz/javohir/d",
	tapsMinAmount: "5 000 сум",
	tapsFee: "~10%",
	tapsMethods: "Payme • Click • Uzcard • Humo • Uzum",
	localQrImage: "/images/support-qr.svg",

	tributeUrl: "https://web.tribute.tg/d/SoE",
	tributeApiKey: "30bba659-25fc-49cd-8147-ad52bd6d",
	tributeMinAmount: "100 ₽",
	tributeFee: "Комиссия сервиса",
	tributeMethods: "Visa • Mastercard • Telegram • СБП",

	/** 2. Игровой блок: Steam */
	steamUrl: "https://steamcommunity.com/id/nullvert/",
	steamWishlistUrl:
		"https://store.steampowered.com/wishlist/id/nullvert/?sort=name",
	steamGiftCardUrl:
		"https://store.steampowered.com/digitalgiftcards/selectgiftcard?giftto=1189919144",

	/** 3. Игровой блок: Гача-игры и UID */
	// gachaGames: [
	// 	{
	// 		id: "genshin",
	// 		name: "Genshin Impact",
	// 		server: "Europe",
	// 		uid: "700000000",
	// 		icon: "material-symbols:auto-awesome-rounded",
	// 	},
	// 	{
	// 		id: "hsr",
	// 		name: "Honkai: Star Rail",
	// 		server: "Europe",
	// 		uid: "700000000",
	// 		icon: "material-symbols:rocket-launch-rounded",
	// 	},
	// 	{
	// 		id: "wuwa",
	// 		name: "Wuthering Waves",
	// 		server: "Europe",
	// 		uid: "600000000",
	// 		icon: "material-symbols:waves-rounded",
	// 	},
	// ],

	/** Вспомогательные блоки */
	showShareBlog: false,
	followishUrl: "https://followish.io/app/users/cnuqxydjrbz4ot",
	telegramDirectUrl: "https://t.me/glytsin?direct",
});
