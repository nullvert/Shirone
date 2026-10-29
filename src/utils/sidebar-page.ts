/**
 * 侧栏页面过滤的共享判定。
 * SSR（SideBar 初始渲染）与客户端（swup 导航后同步）共用同一套判定，
 * 避免两处逻辑漂移。
 */
import type { SidebarPage } from "@/types/sidebarConfig";

/**
 * widget 是否在当前页面可见：
 * - 未配置 pages（或空数组）→ 所有页面可见；
 * - 配置了 pages → 仅当当前页面在列表中可见。
 */
export function isWidgetVisibleOnPage(
	pages: SidebarPage[] | undefined,
	currentPage: SidebarPage | undefined,
): boolean {
	if (!pages || pages.length === 0) return true;
	return currentPage !== undefined && pages.includes(currentPage);
}

/**
 * 检查在指定页面上，是否至少有一个启用的 widget 可见。
 * 用于 SSR 和客户端判断侧栏是否为空。
 */
export function hasVisibleWidgetsOnPage(
	components: Array<{ enable: boolean; pages?: SidebarPage[] }>,
	currentPage: SidebarPage | undefined,
): boolean {
	return components.some(
		(w) => w.enable && isWidgetVisibleOnPage(w.pages, currentPage),
	);
}

/**
 * pages 列表 → data-sidebar-pages 属性值（undefined/空数组 → ""）。
 * 客户端用 attributeToPages 还原，两端往返无损。
 */
export function pagesToAttribute(pages: SidebarPage[] | undefined): string {
	return pages?.join(",") ?? "";
}

/**
 * data-sidebar-pages 属性值 → pages 列表。
 * 空值 / 逗号分隔后的空段均归一为 undefined（= 所有页面可见）。
 */
export function attributeToPages(
	value: string | undefined,
): SidebarPage[] | undefined {
	if (!value) return undefined;
	const pages = value.split(",").filter(Boolean) as SidebarPage[];
	return pages.length > 0 ? pages : undefined;
}
