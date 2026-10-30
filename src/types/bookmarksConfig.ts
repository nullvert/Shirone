import type { PageMeta } from "./pageMeta.ts";

export interface BookmarksConfig extends PageMeta {}

/** @deprecated Use BookmarksConfig */
export type CompassConfig = BookmarksConfig;
