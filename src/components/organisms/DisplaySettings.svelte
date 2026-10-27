<script lang="ts">
import AccentBar from "@components/atoms/display/AccentBar.svelte";
import PanelStack from "@components/atoms/display/PanelStack.svelte";
import SegmentedButton from "@components/atoms/selection/SegmentedButton.svelte";
import Slider from "@components/atoms/selection/Slider.svelte";
import Switch from "@components/atoms/selection/Switch.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import {
	defaultMode,
	flipToMode,
	getStoredMode,
	LAYOUT_MODE_CHANGE_EVENT,
	storeMode,
} from "@utils/layout-mode";
import {
	MC_SPECS,
	MC_STYLES,
	type McSpec,
	type McStyle,
	resolveScheme,
} from "@utils/mc-utils";
import {
	getDefaultHue,
	getDefaultTextureOpacity,
	getDefaultTexturePreset,
	getHue,
	getMotionPreference,
	getStoredTextureOpacity,
	getStoredTexturePreset,
	getStoredWallpaperMode,
	setHue,
	setMotionPreference,
	setTextureOpacity,
	setTexturePreset,
	setWallpaperMode,
} from "@utils/setting-utils";
import { getSpec, getStyle, setSpec, setStyle } from "@utils/theme-utils";
import { onMount } from "svelte";
import {
	getDefaultSpec,
	getDefaultStyle,
	resolveDisplaySettings,
	siteConfig,
} from "@/config";
import type { WallpaperMode } from "@/types/config";
import type { PostListMode } from "@/types/postListConfig";
import type { TexturePreset } from "@/types/textureConfig";

let {
	class: className = "",
	embedded = false,
	id = "display-setting",
}: {
	class?: string;
	embedded?: boolean;
	id?: string;
} = $props();

const displayConfig = resolveDisplaySettings();

const defaultHue = getDefaultHue();
const defaultStyle = getDefaultStyle() as McStyle;
const defaultSpec = getDefaultSpec() as McSpec;
let hue = $state(getHue());
let style = $state<McStyle>(getStyle());
let spec = $state<McSpec>(getSpec());
let dark = $state(
	typeof document !== "undefined" &&
		document.documentElement.classList.contains("dark"),
);

let motionReduced = $state(false);
// 九宫格色卡在面板首次打开前不计算（9 次配色解算只在用户真正查看时发生）
let panelOpened = $state(false);

// 文章列表布局（list/grid）：初始值取访客偏好，变化时存储 + FLIP 重排
const defaultLayoutMode = defaultMode();
let postListMode = $state<PostListMode>(getStoredMode());
let lastAppliedMode = postListMode;
const defaultWallpaperMode = siteConfig.wallpaperMode.defaultMode;
let wallpaperMode = $state<WallpaperMode>(getStoredWallpaperMode());
let lastAppliedWallpaperMode = wallpaperMode;

// 背景纹理预设与浓度
const defaultTexturePreset = getDefaultTexturePreset();
const defaultTextureOpacity = getDefaultTextureOpacity();
let texturePreset = $state<TexturePreset>(getStoredTexturePreset());
let lastAppliedTexturePreset = texturePreset;
let textureOpacity = $state<number>(getStoredTextureOpacity());

// Разрешенные стили оформления (ровно 4 варианта: Vibrant, Expressive, Neutral, Fidelity)
const ALLOWED_STYLES: McStyle[] = ["vibrant", "expressive", "neutral", "fidelity"];

// Текстуры фона: ровно 3 опции (None по умолчанию, Starlight статичный/микро, Sakura анимированный)
const textureOptions: {
	value: TexturePreset;
	labelKey: I18nKey;
	icon: string;
}[] = [
	{
		value: "none",
		labelKey: I18nKey.texturePresetNone,
		icon: "material-symbols:block-rounded",
	},
	{
		value: "starlight",
		labelKey: I18nKey.texturePresetStarlight,
		icon: "material-symbols:auto-awesome-outline-rounded",
	},
	{
		value: "sakura",
		labelKey: I18nKey.texturePresetSakura,
		icon: "material-symbols:local-florist-outline-rounded",
	},
];

let isHomePage = $state(false);

function checkHomePage() {
	if (typeof window === "undefined") return;
	const path = window.location.pathname.replace(/\/+$/, "") || "/";
	isHomePage = path === "/" || path === "" || path === "/page" || path.startsWith("/page/");
}

// 明暗切换时重算色卡（LightDarkSwitch 改 <html> 的 class）
onMount(() => {
	checkHomePage();
	const observer = new MutationObserver(() => {
		dark = document.documentElement.classList.contains("dark");
	});
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	motionReduced = getMotionPreference();
	const onRouteChanged = () => {
		checkHomePage();
	};
	document.addEventListener("swup:content:replace", onRouteChanged);

	const panel = document.getElementById("display-setting");
	const panelObserver = new MutationObserver(() => {
		if (panel?.classList.contains("float-panel-closed")) return;
		panelOpened = true;
		panelObserver.disconnect();
	});
	if (panel && !panel.classList.contains("float-panel-closed"))
		panelOpened = true;
	else if (panel)
		panelObserver.observe(panel, {
			attributes: true,
			attributeFilter: ["class"],
		});

	return () => {
		observer.disconnect();
		panelObserver.disconnect();
		document.removeEventListener("swup:content:replace", onRouteChanged);
	};
});

/** 完整重置：色相 / 配色风格 / Color Spec / 列表布局 / 背景纹理 全部还原为站点默认（点击即生效，无确认弹窗） */
function confirmReset() {
	hue = defaultHue;
	style = defaultStyle;
	spec = defaultSpec;
	postListMode = defaultLayoutMode;
	wallpaperMode = defaultWallpaperMode;
	texturePreset = defaultTexturePreset;
	textureOpacity = defaultTextureOpacity;
}

/** 是否有可重置的偏离（控制 Reset 按钮可见性） */
const isDirty = $derived(
	hue !== defaultHue ||
		style !== defaultStyle ||
		spec !== defaultSpec ||
		postListMode !== defaultLayoutMode ||
		wallpaperMode !== defaultWallpaperMode ||
		texturePreset !== defaultTexturePreset ||
		textureOpacity !== defaultTextureOpacity,
);

$effect(() => {
	if (hue || hue === 0) setHue(hue);
});
$effect(() => {
	setStyle(style);
});
$effect(() => {
	setSpec(spec);
});
$effect(() => {
	setMotionPreference(motionReduced);
});
$effect(() => {
	if (wallpaperMode === lastAppliedWallpaperMode) return;
	lastAppliedWallpaperMode = wallpaperMode;
	setWallpaperMode(wallpaperMode);
});
$effect(() => {
	if (texturePreset === lastAppliedTexturePreset) return;
	lastAppliedTexturePreset = texturePreset;
	setTexturePreset(texturePreset);
});
$effect(() => {
	setTextureOpacity(textureOpacity);
});
$effect(() => {
	if (postListMode === lastAppliedMode) return;
	lastAppliedMode = postListMode;
	storeMode(postListMode);
	// 全局广播：番剧页等其它消费方（.anime-list）跟随切换并各自 FLIP
	window.dispatchEvent(
		new CustomEvent(LAYOUT_MODE_CHANGE_EVENT, {
			detail: { layout: postListMode },
		}),
	);
	// 首页才有 #post-list；其它页面仅存储偏好 + 事件同步，下次进首页生效
	const container = document.getElementById("post-list");
	if (container) flipToMode(container, postListMode);
});

function styleKey(s: McStyle): I18nKey {
	switch (s) {
		case "tonalSpot":
			return I18nKey.styleTonalSpot;
		case "vibrant":
			return I18nKey.styleVibrant;
		case "content":
			return I18nKey.styleContent;
		case "expressive":
			return I18nKey.styleExpressive;
		case "rainbow":
			return I18nKey.styleRainbow;
		case "fruitSalad":
			return I18nKey.styleFruitSalad;
		case "monochrome":
			return I18nKey.styleMonochrome;
		case "neutral":
			return I18nKey.styleNeutral;
		case "fidelity":
			return I18nKey.styleFidelity;
	}
}

/** 某个风格在当前色相/明暗/规范下的 primary/secondary/tertiary */
function styleColors(s: McStyle, h: number, d: boolean, sp: McSpec) {
	const scheme = resolveScheme(h, d, s, sp);
	return {
		primary: scheme.primary ?? "#888",
		secondary: scheme.secondary ?? "#888",
		tertiary: scheme.tertiary ?? "#888",
	};
}

/** 当前主色（标题右侧预览圆点） */
const currentColor = $derived(
	panelOpened ? styleColors(style, hue, dark, spec).primary : "transparent",
);

function selectStyle(newStyle: McStyle) {
	style = newStyle;
	const optimalHues = siteConfig.themeColor.optimalHues;
	if (optimalHues && optimalHues[newStyle] !== undefined) {
		hue = optimalHues[newStyle];
	}
}

/** 4 разрешенных стиля: Vibrant, Expressive, Neutral, Fidelity (2×2 сетка) */
const stylePreviews = $derived(
	ALLOWED_STYLES.map((s) => {
		const targetHue = siteConfig.themeColor.optimalHues?.[s] ?? hue;
		return {
			style: s,
			label: i18n(styleKey(s)),
			colors: panelOpened ? styleColors(s, targetHue, dark, spec) : { primary: "#888", secondary: "#888", tertiary: "#888" },
		};
	}),
);
</script>

<div
    {id}
    class="{className} {embedded ? 'ds-embedded' : 'float-panel float-panel-closed absolute transition-all w-88 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain m3-scroll-contain'}"
>
    <!-- Theme color header row -->
    <div class="ds-color-header">
        <div class="ds-color-swatch" style={`background: ${currentColor}`}></div>
        <div class="ds-color-info">
            <span class="ds-color-title">{i18n(I18nKey.themeColor)}</span>
            <span class="ds-color-sub">{hue}° · {style.charAt(0).toUpperCase() + style.slice(1)}</span>
        </div>
        <button
            type="button"
            aria-label={i18n(I18nKey.reset)}
            class="ds-reset-btn"
            class:is-active={isDirty}
            disabled={!isDirty}
            onclick={confirmReset}
        >
            <Icon icon="fa7-solid:arrow-rotate-left" class="text-xs"></Icon>
            <span>{i18n(I18nKey.reset)}</span>
        </button>
    </div>

    <!-- Hue slider -->
    <div class="ds-row-pad">
        <Slider bind:value={hue} min={0} max={360} step={5} label={i18n(I18nKey.themeColor)} />
    </div>

    <!-- Color style options (2x2 grid) -->
    {#if displayConfig.colorStyle}
        <div class="ds-inline-group" role="radiogroup" aria-label={i18n(I18nKey.colorStyle)}>
            <div class="ds-group-title">{i18n(I18nKey.colorStyle)}</div>
            <div class="ds-inline-grid">
                {#each stylePreviews as p (p.style)}
                    <button
                        type="button"
                        role="radio"
                        aria-checked={style === p.style}
                        title={p.label}
                        aria-label={p.label}
                        class="ds-grid-item"
                        class:ds-grid-item--active={style === p.style}
                        onclick={() => selectStyle(p.style)}
                    >
                        <span class="ds-dot" style={`background: ${p.colors.primary}`}></span>
                        <span class="ds-dot" style={`background: ${p.colors.secondary}`}></span>
                        <span>{p.label}</span>
                        {#if style === p.style}
                            <Icon icon="material-symbols:check-rounded" class="ds-grid-check" />
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Page Background -->
    {#if displayConfig.wallpaperMode}
        <div class="ds-inline-group" role="radiogroup" aria-label={i18n(I18nKey.wallpaperMode)}>
            <div class="ds-group-title">{i18n(I18nKey.wallpaperMode)}</div>
            <div class="ds-inline-grid">
                <button
                    type="button"
                    role="radio"
                    aria-checked={wallpaperMode === "none"}
                    title={i18n(I18nKey.wallpaperModeNone)}
                    aria-label={i18n(I18nKey.wallpaperModeNone)}
                    class="ds-grid-item"
                    class:ds-grid-item--active={wallpaperMode === "none"}
                    onclick={() => (wallpaperMode = "none")}
                >
                    <Icon icon="material-symbols:crop-square-rounded" class="ds-grid-icon" />
                    <span>{i18n(I18nKey.wallpaperModeNone)}</span>
                    {#if wallpaperMode === "none"}
                        <Icon icon="material-symbols:check-rounded" class="ds-grid-check" />
                    {/if}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={wallpaperMode === "banner"}
                    title={i18n(I18nKey.wallpaperModeBanner)}
                    aria-label={i18n(I18nKey.wallpaperModeBanner)}
                    class="ds-grid-item"
                    class:ds-grid-item--active={wallpaperMode === "banner"}
                    onclick={() => (wallpaperMode = "banner")}
                >
                    <Icon icon="material-symbols:panorama-outline-rounded" class="ds-grid-icon" />
                    <span>{i18n(I18nKey.wallpaperModeBanner)}</span>
                    {#if wallpaperMode === "banner"}
                        <Icon icon="material-symbols:check-rounded" class="ds-grid-check" />
                    {/if}
                </button>
            </div>
        </div>
    {/if}

    <!-- Layout (home only) -->
    {#if displayConfig.layoutMode && isHomePage}
        <div class="ds-inline-group" role="radiogroup" aria-label={i18n(I18nKey.layoutMode)}>
            <div class="ds-group-title">{i18n(I18nKey.layoutMode)}</div>
            <div class="ds-inline-grid">
                <button
                    type="button"
                    role="radio"
                    aria-checked={postListMode === "list"}
                    title={i18n(I18nKey.layoutList)}
                    aria-label={i18n(I18nKey.layoutList)}
                    class="ds-grid-item"
                    class:ds-grid-item--active={postListMode === "list"}
                    onclick={() => (postListMode = "list")}
                >
                    <Icon icon="material-symbols:view-list-rounded" class="ds-grid-icon" />
                    <span>{i18n(I18nKey.layoutList)}</span>
                    {#if postListMode === "list"}
                        <Icon icon="material-symbols:check-rounded" class="ds-grid-check" />
                    {/if}
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={postListMode === "grid"}
                    title={i18n(I18nKey.layoutGrid)}
                    aria-label={i18n(I18nKey.layoutGrid)}
                    class="ds-grid-item"
                    class:ds-grid-item--active={postListMode === "grid"}
                    onclick={() => (postListMode = "grid")}
                >
                    <Icon icon="material-symbols:grid-view-rounded" class="ds-grid-icon" />
                    <span>{i18n(I18nKey.layoutGrid)}</span>
                    {#if postListMode === "grid"}
                        <Icon icon="material-symbols:check-rounded" class="ds-grid-check" />
                    {/if}
                </button>
            </div>
        </div>
    {/if}

    <!-- Color Spec -->
    {#if displayConfig.colorSpec}
        <div class="ds-inline-group" role="radiogroup" aria-label={i18n(I18nKey.colorSpec)}>
            <div class="ds-group-title">{i18n(I18nKey.colorSpec)}</div>
            <div class="ds-inline-grid">
                {#each MC_SPECS as s (s)}
                    <button
                        type="button"
                        role="radio"
                        aria-checked={spec === s}
                        title={s === "2021" ? i18n(I18nKey.spec2021) : i18n(I18nKey.spec2025)}
                        aria-label={s === "2021" ? i18n(I18nKey.spec2021) : i18n(I18nKey.spec2025)}
                        class="ds-grid-item"
                        class:ds-grid-item--active={spec === s}
                        onclick={() => (spec = s)}
                    >
                        <Icon icon="material-symbols:palette-outline" class="ds-grid-icon" />
                        <span>{s === "2021" ? i18n(I18nKey.spec2021) : i18n(I18nKey.spec2025)}</span>
                        {#if spec === s}
                            <Icon icon="material-symbols:check-rounded" class="ds-grid-check" />
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Background texture list options -->
    {#if displayConfig.texture}
        <div class="ds-list-group" role="radiogroup" aria-label={i18n(I18nKey.texturePreset)}>
            <div class="ds-group-title">{i18n(I18nKey.texturePreset)}</div>
            {#each textureOptions as opt (opt.value)}
                <button
                    type="button"
                    role="radio"
                    aria-checked={texturePreset === opt.value}
                    title={i18n(opt.labelKey)}
                    aria-label={i18n(opt.labelKey)}
                    class="ds-list-item"
                    class:ds-list-item--active={texturePreset === opt.value}
                    onclick={() => (texturePreset = opt.value)}
                >
                    <span class="ds-list-leading">
                        <Icon icon={opt.icon} class="ds-texture-icon" />
                    </span>
                    <span class="ds-list-label">{i18n(opt.labelKey)}</span>
                    <span class="ds-list-trailing" aria-hidden="true">
                        {#if texturePreset === opt.value}
                            <Icon icon="material-symbols:check-rounded" class="ds-check-icon" />
                        {/if}
                    </span>
                </button>
            {/each}
        </div>
    {/if}

    <!-- Reduce motion -->
    {#if displayConfig.reduceMotion}
        <div class="ds-row">
            <span class="ds-row-label">{i18n(I18nKey.reduceMotion)}</span>
            <Switch bind:checked={motionReduced} label={i18n(I18nKey.reduceMotion)} icons />
        </div>
    {/if}
</div>

<style lang="stylus">
    /* ── Embedded wrapper ─────────────────────────── */
    .ds-embedded
        display: flex
        flex-direction: column
        gap: 0.875rem
        width: 100%
        padding-top: 0.5rem
        padding-bottom: 0.5rem

    /* ── Color header row ─────────────────────────── */
    .ds-color-header
        display: flex
        align-items: center
        gap: 0.75rem
        padding: 0.25rem var(--m3e-space-4)
        min-height: 2.75rem

    .ds-color-swatch
        width: 2rem
        height: 2rem
        border-radius: var(--shape-corner-m)
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.15)
        flex-shrink: 0

    .ds-color-info
        display: flex
        flex-direction: column
        flex: 1
        min-width: 0

    .ds-color-title
        font: var(--m3e-type-label-large)
        font-weight: 600
        color: var(--on-surface)
        line-height: 1.25

    .ds-color-sub
        font: var(--m3e-type-body-small)
        color: var(--on-surface-variant)
        line-height: 1.25

    /* ── Reset button ─────────────────────────────── */
    .ds-reset-btn
        display: inline-flex
        align-items: center
        gap: 0.35rem
        height: 2rem
        padding: 0 0.75rem
        border-radius: var(--shape-corner-s)
        border: none
        background: var(--surface-container-high)
        color: var(--on-surface-variant)
        font: var(--m3e-type-label-small)
        font-weight: 600
        cursor: pointer
        user-select: none
        opacity: 0.25
        pointer-events: none
        flex-shrink: 0
        transition: opacity var(--m3e-duration-short) var(--m3e-easing-standard), background var(--m3e-duration-short) var(--m3e-easing-standard)

        &.is-active
            opacity: 1
            pointer-events: auto
            &:hover
                background: var(--surface-container-highest)
                color: var(--on-surface)
            &:active
                transform: scale(0.96)

    /* ── Slider wrapper with matching padding ────────── */
    .ds-row-pad
        padding: 0 var(--m3e-space-4)

    /* ── List groups and full-width list items (No capsules) ── */
    .ds-list-group
        display: flex
        flex-direction: column
        gap: 0.375rem
        padding: 0 var(--m3e-space-4)

    .ds-inline-group
        display: flex
        flex-direction: column
        gap: 0.375rem
        padding: 0 var(--m3e-space-4)

    .ds-inline-grid
        display: grid
        grid-template-columns: 1fr 1fr
        gap: 0.5rem
        width: 100%

        &--3
            grid-template-columns: 1fr 1fr 1fr
            gap: 0.375rem

    .ds-grid-item
        display: inline-flex
        align-items: center
        justify-content: center
        gap: 0.4rem
        height: 2.625rem
        padding: 0 0.75rem
        box-sizing: border-box
        border-radius: var(--shape-corner-m)
        border: none
        background: var(--surface-container)
        color: var(--on-surface-variant)
        font: var(--m3e-type-label-medium)
        font-weight: 500
        cursor: pointer
        user-select: none
        transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard)

        &:hover
            background: unquote("color-mix(in oklab, var(--on-surface) 8%, var(--surface-container))")

        &:active
            transform: scale(0.98)

        &--active
            background: var(--secondary-container)
            color: var(--on-secondary-container)
            font-weight: 600

    .ds-grid-icon
        font-size: 1.125rem
        color: inherit
        flex-shrink: 0

    .ds-grid-check
        font-size: 1.125rem
        color: inherit
        flex-shrink: 0

    .ds-group-title
        font: var(--m3e-type-label-small)
        font-weight: 600
        text-transform: uppercase
        letter-spacing: 0.05em
        color: var(--on-surface-variant)
        padding: 0.25rem 0.125rem 0.25rem
        user-select: none

    .ds-list-item
        display: flex
        align-items: center
        width: 100%
        height: 2.625rem
        padding: 0 0.875rem
        box-sizing: border-box
        border-radius: var(--shape-corner-m)
        border: none
        background: var(--surface-container)
        color: var(--on-surface-variant)
        cursor: pointer
        user-select: none
        text-align: left
        transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard)

        &:hover
            background: unquote("color-mix(in oklab, var(--on-surface) 8%, var(--surface-container))")

        &:active
            transform: scale(0.99)

        &--active
            background: var(--secondary-container)
            color: var(--on-secondary-container)
            font-weight: 600

    .ds-list-leading
        display: inline-flex
        align-items: center
        justify-content: center
        width: 1.5rem
        flex-shrink: 0
        margin-right: 0.75rem

    .ds-dot
        display: inline-block
        width: 0.5rem
        height: 0.5rem
        border-radius: var(--shape-corner-full)
        margin-right: 0.2rem

        &:last-child
            margin-right: 0

    .ds-texture-icon
        font-size: 1.25rem
        color: inherit

    .ds-list-label
        flex: 1
        min-width: 0
        font: var(--m3e-type-label-large)
        color: inherit

    .ds-list-trailing
        display: inline-flex
        align-items: center
        justify-content: flex-end
        width: 1.5rem
        flex-shrink: 0

    .ds-check-icon
        font-size: 1.25rem
        color: inherit

    /* ── Setting row (label left, control right) ──── */
    .ds-row
        display: flex
        align-items: center
        justify-content: space-between
        gap: 0.75rem
        padding: 0.25rem var(--m3e-space-4)
        min-height: 3.25rem

    .ds-row-label
        font: var(--m3e-type-label-medium)
        font-weight: 500
        color: var(--on-surface)
        flex-shrink: 0

    /* ── Non-embedded float panel (desktop dropdown) ────────── */
    :global(.float-panel#display-setting)
        display: flex
        flex-direction: column
        gap: 0.875rem
        padding: 0.75rem 0
        background: var(--surface-container-high)
        box-shadow: var(--m3e-elevation-3)
        border-radius: var(--shape-corner-l)

    /* ── Scrollbar (non-embedded) ─────────────────── */
    :global(#display-setting.m3-scroll-contain)
        scrollbar-width: thin
        scrollbar-color: var(--scrollbar-bg) transparent
        -webkit-overflow-scrolling: touch
        &::-webkit-scrollbar
            width: 0.375rem
        &::-webkit-scrollbar-track
            background: transparent
        &::-webkit-scrollbar-thumb
            background: var(--scrollbar-bg)
            border-radius: var(--shape-corner-full)
            &:hover
                background: var(--scrollbar-bg-hover)
            &:active
                background: var(--scrollbar-bg-active)
</style>
