import type { BookmarksConfig } from "../types/bookmarksConfig.ts";
import { withUserConfig } from "../utils/config-overlay.ts";

export const bookmarksConfig: BookmarksConfig = withUserConfig("bookmarks", {
	enable: true,
	title: "$t:compass",
	description: "$t:compassBanner",
});

/** @deprecated Use bookmarksConfig */
export const compassConfig: BookmarksConfig = bookmarksConfig;
