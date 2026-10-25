import type { TrackDescriptor } from "@/types/musicConfig";

/**
 * 侧栏音乐本地曲目数据源。
 * 遵循「零额外负担」原则：配置与数据解耦。
 * Если музыка включена, сюда можно добавить локальные треки.
 */
export const musicTracks: readonly TrackDescriptor[] = [];
