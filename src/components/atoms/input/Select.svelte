<script lang="ts">
import Icon from "@iconify/svelte";

/**
 * M3E Select — M3 下拉选择原子（官方 Select 移植，对齐 material-web 行为）：
 * - variant: filled（默认）/ outlined，容器风格与站内 TextField 一致（48px 高）；
 * - label 恒定浮动在顶部（M3 select 特性），placeholder 未选中时显示；
 * - 菜单：surface-container + elevation-2，选项 48px label-large，
 *   选中项 surface-container-highest + 右侧 check 图标，悬停/键盘高亮同步；
 * - 交互：点击 / Enter / Space / 方向键 展开；菜单内 方向键/Home/End 移动、
 *   Enter 选中、ESC 关闭、点击外部关闭；首字母 typeahead 跳转；
 * - combobox 模式：焦点保持在触发按钮（aria-activedescendant）；
 * - 菜单 fixed 定位锚定触发按钮，滚动/缩放自动重定位，宽度 = 按钮宽（最小 210px）；
 * - 支持 required（必填星号）、disabled、helper/error 提示。
 */
let selectId = 0;
const menuId = `m3-select-menu-${++selectId}`;

let {
	value = $bindable(""),
	items = [] as { value: string; label: string; leading?: string }[],
	variant = "filled",
	label = "",
	placeholder = "",
	disabled = false,
	required = false,
	helper = "",
	error = "",
	onchange,
	class: className = "",
}: {
	/** 选中项 value（$bindable）；为空时显示 placeholder */
	value?: string;
	items: { value: string; label: string; leading?: string }[];
	/** filled（默认）/ outlined */
	variant?: "filled" | "outlined";
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	/** 必填（label 旁显示星号） */
	required?: boolean;
	/** 辅助提示（body-small） */
	helper?: string;
	/** 错误提示（非空时进入 error 态） */
	error?: string;
	onchange?: (value: string) => void;
	class?: string;
} = $props();

let open = $state(false);
let activeIndex = $state(-1);
let menuBelow = $state(true);
let rootEl = $state<HTMLDivElement>();
let fieldEl = $state<HTMLButtonElement>();
let menuEl = $state<HTMLDivElement>();
let typeahead = $state("");
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

const selectedLabel = $derived(
	items.find((t) => t.value === value)?.label ?? "",
);

function select(v: string) {
	if (v === value) return;
	value = v;
	onchange?.(v);
}

function positionMenu() {
	const f = fieldEl;
	const m = menuEl;
	if (!f || !m) return;
	const fr = f.getBoundingClientRect();
	const width = Math.max(fr.width, 210);
	const mh = m.offsetHeight;
	const spaceBelow = window.innerHeight - fr.bottom - 8;
	const spaceAbove = fr.top - 8;
	menuBelow = mh <= spaceBelow;
	const top = menuBelow
		? fr.bottom + 4
		: mh <= spaceAbove
			? fr.top - mh - 4
			: Math.max(8, fr.bottom + 4);
	m.style.left = `${fr.left}px`;
	m.style.top = `${top}px`;
	m.style.width = `${Math.min(width, window.innerWidth - 16)}px`;
}

function openMenu() {
	if (disabled) return;
	open = true;
	activeIndex = items.findIndex((t) => t.value === value);
	if (activeIndex < 0) activeIndex = items.length ? 0 : -1;
}

function closeMenu() {
	open = false;
	activeIndex = -1;
	typeahead = "";
	fieldEl?.focus();
}

function moveActive(delta: number) {
	if (!items.length) return;
	activeIndex = (activeIndex + delta + items.length) % items.length;
}

function jumpToMatch() {
	const q = typeahead.toLowerCase();
	if (!q) return;
	const idx = items.findIndex((t) => t.label.toLowerCase().startsWith(q));
	if (idx >= 0) activeIndex = idx;
}

function resetTypeahead() {
	clearTimeout(typeaheadTimer);
	typeaheadTimer = setTimeout(() => (typeahead = ""), 500);
}

function onFieldKeydown(e: KeyboardEvent) {
	if (disabled) return;
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		if (!open) {
			openMenu();
		} else if (activeIndex >= 0) {
			select(items[activeIndex].value);
			closeMenu();
		}
		return;
	}
	if (e.key === "ArrowDown" || e.key === "ArrowUp") {
		e.preventDefault();
		if (!open) openMenu();
		else moveActive(e.key === "ArrowDown" ? 1 : -1);
		return;
	}
	if (!open) {
		if (e.key.length === 1) {
			openMenu();
			typeahead = e.key;
			resetTypeahead();
			jumpToMatch();
			e.preventDefault();
		}
		return;
	}
	/* open 状态 */
	if (e.key === "Escape") {
		e.preventDefault();
		closeMenu();
	} else if (e.key === "Home") {
		e.preventDefault();
		activeIndex = 0;
	} else if (e.key === "End") {
		e.preventDefault();
		activeIndex = items.length - 1;
	} else if (e.key === "Tab") {
		closeMenu();
	} else if (e.key.length === 1) {
		typeahead += e.key;
		resetTypeahead();
		jumpToMatch();
		e.preventDefault();
	}
}

/* 打开时：定位菜单 + 滚动/缩放重定位 + 外部点击/ESC 关闭 */
$effect(() => {
	if (!open) return;
	positionMenu();
	const raf = requestAnimationFrame(positionMenu);
	const onViewportChange = () => positionMenu();
	window.addEventListener("scroll", onViewportChange, true);
	window.addEventListener("resize", onViewportChange);
	const onClick = (e: MouseEvent) => {
		if (rootEl && !rootEl.contains(e.target as Node)) closeMenu();
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") closeMenu();
	};
	const timer = setTimeout(() => {
		document.addEventListener("click", onClick);
		document.addEventListener("keydown", onKey);
	}, 0);
	return () => {
		cancelAnimationFrame(raf);
		window.removeEventListener("scroll", onViewportChange, true);
		window.removeEventListener("resize", onViewportChange);
		clearTimeout(timer);
		document.removeEventListener("click", onClick);
		document.removeEventListener("keydown", onKey);
	};
});
</script>

<div
	bind:this={rootEl}
	class="m3-select m3-select--{variant} {className}"
	class:m3-select--open={open}
	class:m3-select--error={!!error}
	class:m3-select--disabled={disabled}
>
	<button
		type="button"
		class="m3-select__field m3-state-layer"
		bind:this={fieldEl}
		role="combobox"
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-controls={menuId}
		aria-labelledby={label ? `${menuId}-label` : undefined}
		aria-label={label ? undefined : placeholder}
		aria-activedescendant={open && activeIndex >= 0 ? `${menuId}-opt-${activeIndex}` : undefined}
		aria-invalid={!!error}
		aria-disabled={disabled}
		disabled={disabled}
		onclick={() => (open ? closeMenu() : openMenu())}
		onkeydown={onFieldKeydown}
	>
		<span class="m3-select__leading"><slot name="leading" /></span>
		<span class="m3-select__text">
			{#if label}
				<span id={`${menuId}-label`} class="m3-select__label">
					{label}{#if required}<span class="m3-select__required" aria-hidden="true">*</span>{/if}
				</span>
			{/if}
			<span class="m3-select__value" class:m3-select__value--placeholder={!selectedLabel}>
				{selectedLabel || placeholder}
			</span>
		</span>
		<span class="m3-select__arrow" aria-hidden="true">
			<Icon icon={open ? "material-symbols:arrow-drop-up" : "material-symbols:arrow-drop-down"} />
		</span>
		<span class="m3-select__underline" aria-hidden="true"></span>
	</button>

	{#if error}
		<span class="m3-select__supporting m3-select__supporting--error" aria-live="polite">{error}</span>
	{:else if helper}
		<span class="m3-select__supporting">{helper}</span>
	{/if}

	{#if open && items.length}
		<div
			id={menuId}
			class="m3-select__menu"
			class:m3-select__menu--above={!menuBelow}
			role="listbox"
			bind:this={menuEl}
		>
			{#each items as item, i (item.value)}
				<button
					type="button"
					id={`${menuId}-opt-${i}`}
					class="m3-select__option m3-state-layer"
					class:m3-select__option--selected={item.value === value}
					class:m3-select__option--active={i === activeIndex}
					role="option"
					aria-selected={item.value === value}
					onmousedown={(e) => e.preventDefault()}
					onmouseenter={() => (activeIndex = i)}
					onclick={() => {
						select(item.value);
						closeMenu();
					}}
				>
					{#if item.leading}
						<span class="m3-select__option-leading"><Icon icon={item.leading} /></span>
					{/if}
					<span class="m3-select__option-label">{item.label}</span>
					{#if item.value === value}
						<span class="m3-select__option-check"><Icon icon="material-symbols:check" /></span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
.m3-select {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  min-width: 210px;
  box-sizing: border-box;
  color: var(--on-surface);
  font: var(--m3e-type-body-large);
/* ===== filled：--field-filled-bg + 顶部圆角 + 底部下划线（与站内 TextField 一致）===== */
/* ===== outlined：surface + 1px outline-variant 边框 ===== */
/* filled 下划线（focus/展开时 primary 2px） */
/* error 态 */
/* 菜单（fixed 锚定 field；容器风格与站内 Menu 一致） */
/* disabled（官方分项透明度，非整体 opacity）：文字 38%、filled 容器 4%、outlined 边框 12% */
}
.m3-select__field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 3.5rem;
  padding: 0 1rem;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  --m3e-state-color: var(--on-surface);
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), border-color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.m3-select--filled .m3-select__field {
  border-radius: var(--shape-corner-m) var(--shape-corner-m) 0 0;
  background: var(--field-filled-bg);
}
.m3-select--filled .m3-select__field:hover {
  background: color-mix(in oklab, var(--on-surface) 12%, var(--field-filled-bg));
}
.m3-select--filled .m3-select__field:focus-visible {
  outline: none;
}
.m3-select--filled.m3-select--open .m3-select__field {
  background: color-mix(in oklab, var(--on-surface) 16%, var(--field-filled-bg));
}
.m3-select--outlined .m3-select__field {
  border-radius: var(--shape-corner-xs);
  border: 1px solid var(--outline-variant);
  background: var(--surface);
}
.m3-select--outlined .m3-select__field:hover {
  border-color: var(--outline);
}
.m3-select--outlined .m3-select__field:focus-visible {
  outline: none;
}
.m3-select--outlined.m3-select--open .m3-select__field {
  border-color: var(--primary);
  border-width: 2px;
  padding: 0 calc(1rem - 1px);
}
.m3-select__leading {
  display: flex;
  align-items: center;
  flex: none;
  color: var(--on-surface-variant);
}
.m3-select__leading > :global(svg) {
  width: 24px;
  height: 24px;
}
.m3-select__text {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
}
.m3-select__label {
  position: absolute;
  top: 8px;
  left: 0;
  max-width: 100%;
  font: var(--m3e-type-body-small);
  color: var(--on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.m3-select--open .m3-select__label {
  color: var(--primary);
}
.m3-select__required {
  color: var(--error);
}
.m3-select__value {
  flex: 1;
  min-width: 0;
  padding-top: 24px /* 官方公式：top-space 8 + label 行高 16 */;
  padding-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.m3-select__value--placeholder {
  color: var(--on-surface-variant);
}
.m3-select__arrow {
  display: flex;
  flex: none;
  color: var(--on-surface-variant);
  transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.m3-select__arrow > :global(svg) {
  width: 24px;
  height: 24px;
}
.m3-select--open .m3-select__arrow {
  color: var(--primary);
}
.m3-select__underline {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  bottom: 0.25rem;
  height: 2px;
  border-radius: var(--shape-corner-full);
  background: var(--primary);
  opacity: 0;
  transform: scaleX(0.5);
  transition: opacity var(--m3e-duration-short) var(--m3e-easing-standard), transform var(--m3e-duration-short) var(--m3e-easing-emphasized-decelerate);
}
.m3-select--filled .m3-select__underline {
  display: block;
}
.m3-select--filled.m3-select--open .m3-select__underline {
  opacity: 1;
  transform: scaleX(1);
}
.m3-select--error .m3-select__label {
  color: var(--error);
}
.m3-select--error .m3-select__underline {
  opacity: 1;
  transform: scaleX(1);
  background: var(--error);
}
.m3-select--error.m3-select--outlined .m3-select__field {
  border-color: var(--error);
  border-width: 2px;
  padding: 0 calc(1rem - 1px);
}
.m3-select__supporting {
  margin-top: 4px;
  margin-left: 1rem;
  font: var(--m3e-type-body-small);
  color: var(--on-surface-variant);
}
.m3-select__supporting--error {
  color: var(--error);
}
.m3-select__menu {
  position: fixed;
  z-index: 40;
  box-sizing: border-box;
  max-height: 20rem;
  overflow-y: auto;
  padding: 0.25rem;
  border-radius: var(--shape-corner-l);
  background: var(--surface-container);
  box-shadow: var(--m3e-elevation-2);
  transform-origin: top center;
  animation: m3-select-pop var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
}
.m3-select__menu--above {
  transform-origin: bottom center;
}
.m3-select__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  height: 3rem;
  padding: 0 1rem;
  border: none;
  border-radius: var(--shape-corner-s);
  background: transparent;
  color: var(--on-surface);
  font: var(--m3e-type-label-large);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  --m3e-state-color: var(--on-surface);
}
.m3-select__option:hover,
.m3-select__option--active {
  background: color-mix(in oklab, var(--on-surface) 8%, transparent);
}
.m3-select__option--selected {
  background: var(--surface-container-highest);
}
.m3-select__option--selected:hover,
.m3-select__option--selected--active {
  background: color-mix(in oklab, var(--on-surface) 8%, var(--surface-container-highest));
}
.m3-select__option-leading {
  display: flex;
  flex: none;
  color: var(--on-surface-variant);
}
.m3-select__option-leading > :global(svg) {
  width: 24px;
  height: 24px;
}
.m3-select__option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.m3-select__option-check {
  display: flex;
  flex: none;
  color: var(--on-surface-variant);
}
.m3-select__option-check > :global(svg) {
  width: 24px;
  height: 24px;
}
.m3-select--disabled {
  pointer-events: none;
}
.m3-select--disabled .m3-select__label,
.m3-select--disabled .m3-select__value,
.m3-select--disabled .m3-select__arrow {
  color: color-mix(in oklab, var(--on-surface) 38%, transparent);
}
.m3-select--disabled.m3-select--filled .m3-select__field {
  background: color-mix(in oklab, var(--on-surface) 4%, var(--field-filled-bg));
}
.m3-select--disabled.m3-select--filled .m3-select__underline {
  background: color-mix(in oklab, var(--on-surface) 38%, transparent);
}
.m3-select--disabled.m3-select--outlined .m3-select__field {
  border-color: color-mix(in oklab, var(--on-surface) 12%, transparent);
}
@-moz-keyframes m3-select-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@-webkit-keyframes m3-select-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@-o-keyframes m3-select-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes m3-select-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
