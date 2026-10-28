<script lang="ts">
/**
 * 全站导航抽屉（M3 ModalNavigationDrawer 应用，自包含实现，不改原子）。
 * 顶部栏菜单按钮派发 site-drawer:toggle 事件开合；内容：
 *   一级导航（navBarConfig）+ 可折叠「分类」分组（多级扩展点）。
 * 链接由 Swup 自动接管，点击后收起抽屉；高亮与当前路由/分类筛选同步。
 */
import Icon from "@components/atoms/display/Icon.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { resolveNavBarLinks, resolvePageKey } from "@utils/nav-utils";
import { url } from "@utils/url-utils";
import { onMount, tick } from "svelte";
import { siteConfig } from "@/config";
import { navBarConfig } from "@/config/navBarConfig";

let open = $state(false);
let activePrimary = $state("");
const openGroups = $state<Record<string, boolean>>({});

const links = resolveNavBarLinks(navBarConfig.links);

const primaryItems = links.map((link) => {
	const key = link.name.toLowerCase();
	return {
		value: key,
		label: link.name,
		icon: link.icon,
		href: link.url ? (link.external ? link.url : url(link.url)) : undefined,
		external: !!link.external,
		pageKey: link.pageKey ?? "",
		children: link.children?.map((child) => ({
			value: child.name.toLowerCase(),
			label: child.name,
			icon: child.icon,
			href: child.url
				? child.external
					? child.url
					: url(child.url)
				: undefined,
			external: !!child.external,
			pageKey: child.pageKey ?? "",
		})),
	};
});

function syncFromRoute() {
	const pageKey = resolvePageKey(new URL(window.location.href));
	activePrimary = "";
	for (const item of primaryItems) {
		if (item.pageKey && item.pageKey === pageKey) {
			activePrimary = item.value;
			break;
		}
		const activeChild = item.children?.find(
			(child) => child.pageKey && child.pageKey === pageKey,
		);
		if (activeChild) {
			activePrimary = activeChild.value;
			openGroups[item.value] = true;
			break;
		}
	}
}

let drawerEl: HTMLElement | undefined = $state();

// Swipe left to close gesture
let startX = 0;
let startY = 0;
let currentX = 0;
let isSwiping = false;

function handleTouchStart(e: TouchEvent) {
	if (!open) return;
	const touch = e.touches[0];
	startX = touch.clientX;
	startY = touch.clientY;
	currentX = startX;
	isSwiping = false;
}

function handleTouchMove(e: TouchEvent) {
	if (!open || !drawerEl) return;
	const touch = e.touches[0];
	const deltaX = touch.clientX - startX;
	const deltaY = Math.abs(touch.clientY - startY);

	// Если свайп идет влево (к закрытию) и горизонтальное движение преобладает над вертикальным
	if (deltaX < -8 && -deltaX > deltaY) {
		isSwiping = true;
		drawerEl.style.transform = `translateX(${Math.min(0, deltaX)}px)`;
		drawerEl.style.transition = "none";
	}
}

function handleTouchEnd(e: TouchEvent) {
	if (!open || !drawerEl) return;
	if (isSwiping) {
		const deltaX = (e.changedTouches[0]?.clientX ?? currentX) - startX;
		drawerEl.style.transition = "";
		drawerEl.style.transform = "";
		// Порог закрытия свайпом влево 50px
		if (deltaX < -50) {
			closeDrawer();
		}
		isSwiping = false;
	}
}

function closeDrawer() {
	open = false;
	document.body.style.overflow = "";
	if (drawerEl) {
		drawerEl.style.transform = "";
		drawerEl.style.transition = "";
	}
}

// 点击链接后收起抽屉；外部链接不改变路由，高亮已由路由同步维护
function handleNavClick() {
	closeDrawer();
}

function toggleGroup(group: string) {
	openGroups[group] = !openGroups[group];
}

onMount(() => {
	syncFromRoute();
	const onToggle = () => {
		if (open) {
			closeDrawer();
		} else {
			open = true;
			document.body.style.overflow = "hidden";
			tick().then(() => {
				drawerEl?.querySelector<HTMLElement>("a, button")?.focus();
			});
		}
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape" && open) {
			closeDrawer();
		}
	};
	document.addEventListener("site-drawer:toggle", onToggle);
	document.addEventListener("swup:content:replace", () => {
		syncFromRoute();
		closeDrawer();
	});
	window.addEventListener("keydown", onKey);
	return () => {
		document.body.style.overflow = "";
		document.removeEventListener("site-drawer:toggle", onToggle);
		document.removeEventListener("swup:content:replace", syncFromRoute);
		window.removeEventListener("keydown", onKey);
	};
});
</script>

<div
	class="site-drawer"
	class:site-drawer--open={open}
>
	<div
		class="site-drawer__scrim"
		aria-hidden="true"
		onclick={closeDrawer}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	></div>
	<aside
		bind:this={drawerEl}
		class="site-drawer__panel"
		role="dialog"
		aria-modal="true"
		aria-label={siteConfig.title}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<div class="site-drawer__brand">
			<div class="site-drawer__brand-text">
				<div class="site-drawer__title">{siteConfig.title}</div>
				<div class="site-drawer__subtitle">{siteConfig.subtitle}</div>
			</div>
			<button
				type="button"
				class="site-drawer__header-close-btn"
				aria-label={i18n(I18nKey.close)}
				onclick={closeDrawer}
			>
				<Icon icon="material-symbols:close-rounded" />
			</button>
		</div>

		<nav class="site-drawer__nav" aria-label="Navigation drawer">
			{#each primaryItems as item (item.value)}
				{#if item.children}
					<div class="site-drawer__group">
						<button type="button" class="site-drawer__group-head" class:site-drawer__item--active={item.children.some((child) => activePrimary === child.value)} onclick={() => toggleGroup(item.value)} aria-expanded={openGroups[item.value] ?? false}>
							{#if item.icon}<span class="site-drawer__group-icon" aria-hidden="true"><Icon icon={item.icon} /></span>{/if}
							<span class="site-drawer__group-label">{item.label}</span>
							<Icon class={openGroups[item.value] ? "site-drawer__group-arrow site-drawer__group-arrow--open" : "site-drawer__group-arrow"} icon="material-symbols:keyboard-arrow-down" />
						</button>
						{#if openGroups[item.value]}
							<div class="site-drawer__group-body">
								{#each item.children as child (child.value)}
									<a href={child.href} class="site-drawer__item site-drawer__item--child" class:site-drawer__item--active={activePrimary === child.value} aria-current={activePrimary === child.value ? "page" : undefined} target={child.external ? "_blank" : undefined} rel={child.external ? "noopener noreferrer" : undefined} onclick={handleNavClick}>
										{#if child.icon}<span class="site-drawer__item-icon" aria-hidden="true"><Icon icon={child.icon} /></span>{/if}
										<span class="site-drawer__item-label">{child.label}</span>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{:else if item.href}
					<a href={item.href} class="site-drawer__item" class:site-drawer__item--active={activePrimary === item.value} aria-current={activePrimary === item.value ? "page" : undefined} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} onclick={handleNavClick}>
						{#if item.icon}<span class="site-drawer__item-icon" aria-hidden="true"><Icon icon={item.icon} /></span>{/if}
						<span class="site-drawer__item-label">{item.label}</span>
					</a>
				{/if}
			{/each}
		</nav>

		<div class="site-drawer__footer">
			<button
				type="button"
				class="site-drawer__close-btn m3-state-layer"
				aria-label={i18n(I18nKey.close)}
				onclick={closeDrawer}
			>
				{i18n(I18nKey.close)}
			</button>
		</div>
	</aside>
</div>

<style>
.site-drawer {
  position: fixed;
  inset: 0;
  z-index: 60;
  visibility: hidden;
  pointer-events: none;
/* 面板：360dp 宽、surface-container-low、右侧 16dp 大圆角，左侧滑入 */
/* 一级/子项：全宽 56dp，选中整项 secondary-container 全圆 pill */
/* 分组头部 */
/* Нижний футер: чистый полноразмерный Text Button на всю ширину блока (как в правом ящике) */
}
.site-drawer--open {
  visibility: visible;
  pointer-events: auto;
}
.site-drawer__scrim {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--scrim, #000) 32%, transparent);
  opacity: 0;
  transition: opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.site-drawer--open .site-drawer__scrim {
  opacity: 1;
}
.site-drawer__panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: 85vw;
  box-sizing: border-box;
  background: var(--surface-container-low);
  color: var(--on-surface);
  border-radius: 0;
  transform: translateX(-100%);
  transition: transform var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate);
  overflow: hidden;
  touch-action: pan-y;
}
.site-drawer--open .site-drawer__panel {
  transform: translateX(0);
}
.site-drawer__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--m3e-space-4) var(--shape-corner-xl) var(--m3e-space-3);
  flex: none;
}
.site-drawer__brand-text {
  display: flex;
  flex-direction: column;
}
.site-drawer__header-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: var(--shape-corner-full);
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.site-drawer__header-close-btn:hover {
  background: var(--surface-container-high);
  color: var(--on-surface);
}
.site-drawer__header-close-btn:active {
  transform: scale(0.92);
}
.site-drawer__header-close-btn > :global(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.site-drawer__title {
  font: var(--m3e-type-title-large);
  color: var(--on-surface);
}
.site-drawer__subtitle {
  margin-top: var(--m3e-space-1);
  font: var(--m3e-type-body-medium);
  color: var(--on-surface-variant);
}
.site-drawer__nav {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: var(--m3e-space-2) var(--m3e-space-3) var(--m3e-space-4);
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-bg) transparent;
}
.site-drawer__nav::-webkit-scrollbar {
  width: 6px;
}
.site-drawer__nav::-webkit-scrollbar-track {
  background: transparent;
}
.site-drawer__nav::-webkit-scrollbar-thumb {
  background: var(--scrollbar-bg);
  border-radius: var(--shape-corner-full);
}
.site-drawer__nav::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-bg-hover);
}
.site-drawer__nav::-webkit-scrollbar-thumb:active {
  background: var(--scrollbar-bg-active);
}
.site-drawer__item {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-3);
  width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  padding: 0 var(--m3e-space-4);
  border-radius: var(--shape-corner-full);
  color: var(--on-surface-variant);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.site-drawer__item:hover {
  background: color-mix(in oklab, var(--on-surface) 8%, transparent);
}
.site-drawer__item:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: -2px;
}
.site-drawer__item--active {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}
.site-drawer__item--active:hover {
  background: var(--secondary-container);
}
.site-drawer__item--child {
  min-height: 48px;
  padding-left: var(--m3e-space-8);
}
.site-drawer__item-icon {
  display: flex;
  flex: none;
  color: var(--on-surface-variant);
}
.site-drawer__item-icon > :global(svg) {
  width: 1.5rem;
  height: 1.5rem;
}
.site-drawer__item--active .site-drawer__item-icon {
  color: var(--on-secondary-container);
}
.site-drawer__item-label {
  flex: 1;
  min-width: 0;
  font: var(--m3e-type-label-large);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.site-drawer__item--child .site-drawer__item-label {
  font: var(--m3e-type-body-medium);
}
.site-drawer__group {
  margin-top: 4px;
}
.site-drawer__group-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  padding: 0 16px;
  border: none;
  border-radius: var(--shape-corner-full);
  background: none;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.site-drawer__group-head:hover {
  background: color-mix(in oklab, var(--on-surface) 8%, transparent);
}
.site-drawer__group-head:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: -2px;
}
.site-drawer__group-icon {
  display: flex;
  flex: none;
}
.site-drawer__group-icon > :global(svg) {
  width: 1.5rem;
  height: 1.5rem;
}
.site-drawer__group-label {
  flex: 1;
  text-align: left;
  font: var(--m3e-type-label-large);
  color: var(--on-surface-variant);
}
.site-drawer__group-arrow {
  display: flex;
  flex: none;
  transition: transform var(--m3e-duration-short) var(--m3e-easing-standard);
}
.site-drawer__group-arrow > :global(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.site-drawer__group-arrow--open {
  transform: rotate(180deg);
}
.site-drawer__group-body {
  padding: 4px 0 8px;
}
.site-drawer__footer {
  display: flex;
  align-items: center;
  height: var(--bar-h-mobile, 3.75rem);
  box-sizing: border-box;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-top: 1px solid color-mix(in oklab, var(--outline-variant) 40%, transparent);
  background: var(--surface-container);
  flex: none;
}
@media (min-width: 600px) {
  .site-drawer__footer {
    height: var(--bar-h-tablet, 4.5rem);
  }
}
.site-drawer__close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 var(--m3e-space-4);
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--on-surface);
  font: var(--m3e-type-label-large);
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard);
}
@media (min-width: 600px) {
  .site-drawer__close-btn {
    font-size: 1rem;
  }
}
.site-drawer__close-btn:hover {
  background: var(--surface-container-high);
  color: var(--primary);
}
.site-drawer__close-btn:active {
  background: color-mix(in oklab, var(--on-surface) 8%, var(--surface-container-high));
}
</style>
