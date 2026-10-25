import type { ExpressiveCodeConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * Expressive Code 代码块主题（astro.config.mjs 与 setting-utils 消费）。
 * 类型见 src/types/config.ts。
 *
 * 💡 Шпаргалка доступных тем из коробки (Shiki bundled themes):
 *
 * Dark:
 *  - "catppuccin-mocha" | "catppuccin-macchiato" | "catppuccin-frappe"
 *  - "github-dark" | "github-dark-dimmed" | "github-dark-default" | "github-dark-high-contrast"
 *  - "dracula" | "dracula-soft" | "one-dark-pro" | "tokyo-night" | "vesper"
 *  - "nord" | "solarized-dark" | "synthwave-84" | "everforest-dark"
 *  - "gruvbox-dark-hard" | "gruvbox-dark-medium" | "gruvbox-dark-soft"
 *  - "rose-pine" | "rose-pine-moon" | "kanagawa-wave" | "kanagawa-dragon"
 *  - "material-theme" | "material-theme-darker" | "material-theme-ocean" | "material-theme-palenight"
 *  - "ayu-dark" | "ayu-mirage" | "monokai" | "night-owl" | "poimandres"
 *
 * Light:
 *  - "catppuccin-latte"
 *  - "github-light" | "github-light-default" | "github-light-high-contrast"
 *  - "solarized-light" | "one-light" | "ayu-light" | "everforest-light"
 *  - "gruvbox-light-hard" | "gruvbox-light-medium" | "gruvbox-light-soft"
 *  - "rose-pine-dawn" | "kanagawa-lotus" | "night-owl-light" | "snazzy-light"
 *
 * При смене темы рекомендуется перезапустить dev-сервер и при необходимости удалить .astro/data-store.json.
 */
export const expressiveCodeConfig: ExpressiveCodeConfig = withUserConfig(
	"expressiveCode",
	{
		// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
		// 代码块跟随明暗模式切换深浅主题
		theme: "material-theme",
		lightTheme: "solarized-light",
		darkTheme: "material-theme",
	},
);
