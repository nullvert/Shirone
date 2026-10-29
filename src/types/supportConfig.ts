import type { PageMeta } from "./pageMeta.ts";

export interface GachaGameItem {
	id: string;
	name: string;
	server?: string;
	uid: string;
	icon?: string;
}

export interface SupportConfig extends PageMeta {
	/** Локальный шлюз (Taps.uz) */
	tapsUrl?: string;
	tapsMinAmount?: string;
	tapsFee?: string;
	tapsMethods?: string;
	localQrImage?: string;

	/** Tribute */
	tributeUrl?: string;
	tributeApiKey?: string;
	tributeMinAmount?: string;
	tributeFee?: string;
	tributeMethods?: string;

	/** Steam Profile / Wishlist */
	steamUrl?: string;
	steamWishlistUrl?: string;

	/** Steam Digital Gift Card */
	steamGiftCardUrl?: string;

	/** Список гача-игр и UID для копирования */
	gachaGames?: GachaGameItem[];

	/** Опциональные вспомогательные ссылки (выключены по умолчанию для одного экрана) */
	followishUrl?: string;
	telegramDirectUrl?: string;
	showShareBlog?: boolean;
}
