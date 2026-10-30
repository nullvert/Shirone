// 循环依赖规避：navBarConfig 等配置消费 i18n，本模块只允许从具体文件导入 siteConfig 与 i18nConfig，
// 禁止走 @/config barrel（见 src/config/README.md）
import { siteConfig } from "../config/siteConfig.ts";
import type I18nKey from "./i18nKey.ts";
import { en } from "./languages/en.ts";

export type Translation = {
	[K in I18nKey]: string;
};

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
	en: en,
	en_us: en,
	en_gb: en,
	en_au: en,
};

export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
	const lang = (siteConfig.lang || "en").toLowerCase();
	const translation = getTranslation(lang);
	const val = translation[key];
	if (val === undefined) {
		const fallback = defaultTranslation[key];
		if (fallback === undefined) {
			console.warn(
				`[i18n] Missing key "${key}" in translation for "${lang}" and fallback.`,
			);
			return key;
		}
		return fallback;
	}
	return val;
}

export function i18nWithContext(key: I18nKey, langOverride?: string): string {
	if (langOverride) {
		const translation = getTranslation(langOverride);
		const val = translation[key];
		if (val !== undefined) return val;
	}
	return i18n(key);
}
