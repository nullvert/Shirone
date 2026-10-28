<script lang="ts">
/**
 * Правый M3 Drawer для мобильных устройств (< 1024px).
 * Открывается кнопкой со стороны BottomAppBar по событию "sidebar-drawer:toggle" или "sidebar-drawer:open".
 *
 * Особенности:
 *   - Заголовок с названием страницы / виджета
 *   - Кнопка закрытия (X) расположена ВНИЗУ (в удобной зоне досягаемости пальцев) + плашка swipe-ручки
 *   - Поддержка свайпа вправо для закрытия (Touch Gestures) по всей панели и фону
 *   - Защита от зависания при ресайзе окна (при >= 1024px автоматически скрывается и сбрасывается)
 */
import Icon from "@components/atoms/display/Icon.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import type { Snippet } from "svelte";
import { onMount, tick } from "svelte";
import DisplaySettings from "./DisplaySettings.svelte";

let {
	title = "",
	children,
}: {
	title?: string;
	children?: Snippet;
} = $props();

let open = $state(false);
let activeTab = $state<"content" | "theme">("content");
let drawerEl: HTMLElement | undefined = $state();
let contentEl: HTMLElement | undefined = $state();

// Swipe to close gesture variables
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

	// Если свайп идет вправо (к закрытию) и горизонтальное движение преобладает над вертикальным скроллом
	if (deltaX > 8 && deltaX > deltaY) {
		isSwiping = true;
		drawerEl.style.transform = `translateX(${Math.max(0, deltaX)}px)`;
		drawerEl.style.transition = "none";
	}
}

function handleTouchEnd(e: TouchEvent) {
	if (!open || !drawerEl) return;
	if (isSwiping) {
		const deltaX = (e.changedTouches[0]?.clientX ?? currentX) - startX;
		drawerEl.style.transition = "";
		drawerEl.style.transform = "";
		// Порог закрытия свайпом 50px
		if (deltaX > 50) {
			closeDrawer();
		}
		isSwiping = false;
	}
}

function openDrawer(tab: "content" | "theme" = "content") {
	activeTab = tab;
	open = true;
	document.body.style.overflow = "hidden";
	tick().then(() => {
		drawerEl?.querySelector<HTMLElement>("button, a, input")?.focus();
	});
}

function closeDrawer() {
	open = false;
	document.body.style.overflow = "";
	if (drawerEl) {
		drawerEl.style.transform = "";
		drawerEl.style.transition = "";
	}
}

function toggleDrawer(tab: "content" | "theme" = "content") {
	if (open && activeTab === tab) {
		closeDrawer();
	} else {
		openDrawer(tab);
	}
}

	let currentTitle = $state(title);

	function updateTitleFromPage() {
		const container = document.getElementById("swup-container");
		const page = container?.dataset.currentPage;
		if (page === "anime" || page === "cinema" || page === "games") {
			currentTitle = i18n(I18nKey.mediaFilterTitle);
		} else if (page === "post") {
			currentTitle = i18n(I18nKey.tableOfContents);
		} else {
			currentTitle = i18n(I18nKey.sidebar);
		}
	}

	onMount(() => {
		updateTitleFromPage();
		const onToggle = (e: Event) => {
			const detail = (e as CustomEvent)?.detail;
			toggleDrawer(detail?.tab === "theme" ? "theme" : "content");
		};
		const onOpen = (e: Event) => {
			const detail = (e as CustomEvent)?.detail;
			openDrawer(detail?.tab === "theme" ? "theme" : "content");
		};
		const onClose = () => closeDrawer();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open) closeDrawer();
		};

		const onSwupNavigate = () => {
			onClose();
			updateTitleFromPage();
		};

		const mql = window.matchMedia("(min-width: 1024px)");
		const onResize = (e: MediaQueryListEvent | MediaQueryList) => {
			if (e.matches && open) {
				closeDrawer();
			}
		};
		mql.addEventListener("change", onResize);

		document.addEventListener("sidebar-drawer:toggle", onToggle);
		document.addEventListener("sidebar-drawer:open", onOpen);
		document.addEventListener("sidebar-drawer:close", onClose);
		document.addEventListener("swup:content:replace", onSwupNavigate);
		window.addEventListener("keydown", onKey);

		return () => {
			document.body.style.overflow = "";
			mql.removeEventListener("change", onResize);
			document.removeEventListener("sidebar-drawer:toggle", onToggle);
			document.removeEventListener("sidebar-drawer:open", onOpen);
			document.removeEventListener("sidebar-drawer:close", onClose);
			document.removeEventListener("swup:content:replace", onSwupNavigate);
			window.removeEventListener("keydown", onKey);
		};
	});
</script>

<div
	class="sidebar-drawer lg:hidden"
	class:sidebar-drawer--open={open}
	aria-hidden={!open}
>
	<!-- Scrim / Backdrop -->
	<div
		class="sidebar-drawer__scrim"
		aria-hidden="true"
		onclick={closeDrawer}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	></div>

	<!-- Drawer Panel on the Right -->
	<aside
		bind:this={drawerEl}
		class="sidebar-drawer__panel"
		role="dialog"
		aria-modal="true"
		aria-label={title || i18n(I18nKey.sidebar)}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<!-- 1. Body / Scrollable Content Area -->
		<div bind:this={contentEl} class="sidebar-drawer__body">
			{#if activeTab === "theme"}
				<div class="sidebar-drawer__theme-wrap">
					<DisplaySettings embedded={true} id="drawer-display-setting" />
				</div>
			{:else if children}
				{@render children()}
			{/if}
		</div>

		<!-- 2. Bottom Footer: полноэкранный чистый Text Button без рамки -->
		<div class="sidebar-drawer__footer">
			<button
				type="button"
				class="sidebar-drawer__bottom-close-btn m3-state-layer"
				aria-label={i18n(I18nKey.close)}
				onclick={closeDrawer}
			>
				{i18n(I18nKey.close)}
			</button>
		</div>
	</aside>
</div>

<style>
.sidebar-drawer {
  position: fixed;
  inset: 0;
  z-index: 60;
  visibility: hidden;
  pointer-events: none;
/* Панель: справа, адаптивная ширина (до 420px на планшетах) */
/* Нижний футер: чистый полноразмерный Text Button на всю ширину блока */
}
.sidebar-drawer--open {
  visibility: visible;
  pointer-events: auto;
}
.sidebar-drawer__scrim {
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--scrim, #000) 36%, transparent);
  opacity: 0;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.sidebar-drawer--open .sidebar-drawer__scrim {
  opacity: 1;
}
.sidebar-drawer__panel {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: 90vw;
  box-sizing: border-box;
  background: var(--surface-container-low);
  color: var(--on-surface);
  border-radius: 0;
  border-left: 1px solid var(--outline-variant);
  box-shadow: var(--m3e-elevation-3);
  transform: translateX(100%);
  transition: transform var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate);
  overflow: hidden;
  touch-action: pan-y;
}
@media (min-width: 600px) {
  .sidebar-drawer__panel {
    width: 440px;
  }
}
.sidebar-drawer--open .sidebar-drawer__panel {
  transform: translateX(0);
}
.sidebar-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--m3e-space-2) var(--m3e-space-4);
  min-height: 3.5rem;
  border-bottom: 1px solid var(--outline-variant);
  background: var(--surface-container);
  flex: none;
}
.sidebar-drawer__close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: var(--shape-corner-full);
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.sidebar-drawer__close-btn:hover {
  background: var(--surface-container-high);
  color: var(--on-surface);
}
.sidebar-drawer__close-btn:active {
  transform: scale(0.92);
}
.sidebar-drawer__close-btn > :global(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.sidebar-drawer__title-group {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-3);
}
.sidebar-drawer__indicator {
  display: block;
  width: 4px;
  height: 18px;
  border-radius: var(--shape-corner-full);
  background: var(--primary);
}
.sidebar-drawer__title {
  font: var(--m3e-type-title-medium);
  color: var(--on-surface);
  margin: 0;
}
.sidebar-drawer__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--m3e-space-4);
  display: flex;
  flex-direction: column;
  gap: 0;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-bg) transparent;
}
.sidebar-drawer__body::-webkit-scrollbar {
  width: 6px;
}
.sidebar-drawer__body::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-drawer__body::-webkit-scrollbar-thumb {
  background: var(--scrollbar-bg);
  border-radius: var(--shape-corner-full);
}
.sidebar-drawer__body::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-bg-hover);
}
.sidebar-drawer__body::-webkit-scrollbar-thumb:active {
  background: var(--scrollbar-bg-active);
}
.sidebar-drawer__theme-wrap {
  width: 100%;
  margin-top: auto;
}
.sidebar-drawer__footer {
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
  .sidebar-drawer__footer {
    height: var(--bar-h-tablet, 4.5rem);
  }
}
.sidebar-drawer__bottom-close-btn {
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
  .sidebar-drawer__bottom-close-btn {
    font-size: 1rem;
  }
}
.sidebar-drawer__bottom-close-btn:hover {
  background: var(--surface-container-high);
  color: var(--primary);
}
.sidebar-drawer__bottom-close-btn:active {
  background: color-mix(in oklab, var(--on-surface) 8%, var(--surface-container-high));
}
</style>
