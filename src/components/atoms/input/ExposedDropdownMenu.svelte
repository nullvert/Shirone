<script lang="ts">
/**
 * M3E ExposedDropdownMenu — 下拉选择框（官方 ExposedDropdownMenu 移植）。
 * 结构对齐 TextField（filled/outlined），触发区显示当前选中 label + trailing ▾
 * （展开旋转 180°，官方 TrailingIcon），点击弹出选项列表（role=listbox，
 * 选中项 check 图标 + secondary-container 背景，hover state layer）。
 * 外部点击 / ESC / 选择后关闭。
 *
 * 用法：<ExposedDropdownMenu options={[{value,label}]} bind:value={v} label="主题" />
 */
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

let {
	options = [],
	value = $bindable(""),
	label = "",
	placeholder = "请选择",
	variant = "filled",
	class: className = "",
}: {
	options: { value: string; label: string }[];
	/** 选中值（$bindable） */
	value?: string;
	label?: string;
	placeholder?: string;
	/** filled（默认）/ outlined */
	variant?: "filled" | "outlined";
	class?: string;
} = $props();

let open = $state(false);
const selected = $derived(options.find((o) => o.value === value));

function toggle() {
	open = !open;
}
function select(v: string) {
	value = v;
	open = false;
}

onMount(() => {
	function onDocClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest(".m3-dropdown")) {
			open = false;
		}
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === "Escape") {
			open = false;
		}
	}
	document.addEventListener("click", onDocClick);
	window.addEventListener("keydown", onKey);
	return () => {
		document.removeEventListener("click", onDocClick);
		window.removeEventListener("keydown", onKey);
	};
});
</script>

<div class="m3-dropdown {className}">
    <button
        type="button"
        class="m3-dropdown__trigger m3-dropdown__trigger--{variant}"
        class:m3-dropdown__trigger--open={open}
        aria-haspopup="listbox"
        aria-expanded={open}
        onclick={toggle}
    >
        <span class="m3-dropdown__field">
            {#if label && !selected}
                <span class="m3-dropdown__placeholder">{placeholder}</span>
            {:else}
                <span class="m3-dropdown__value">{selected?.label ?? placeholder}</span>
            {/if}
        </span>
        <span class="m3-dropdown__icon" aria-hidden="true">
            <Icon icon="material-symbols:arrow-drop-down" width="24" height="24" />
        </span>
    </button>
    {#if open}
        <div class="m3-dropdown__menu" role="listbox" aria-label={label || "选项"}>
            {#each options as opt (opt.value)}
                <button
                    type="button"
                    class="m3-dropdown__item"
                    class:m3-dropdown__item--selected={opt.value === value}
                    role="option"
                    aria-selected={opt.value === value}
                    onclick={() => select(opt.value)}
                >
                    <span class="m3-dropdown__check" aria-hidden="true">
                        {#if opt.value === value}
                            <Icon icon="material-symbols:check" width="18" height="18" />
                        {/if}
                    </span>
                    <span class="m3-dropdown__item-label">{opt.label}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
.m3-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
/* 触发区：对齐 TextField（filled 底部下划线 / outlined 边框） */
/* 菜单：弹出 + scale/fade 展开 */
}
.m3-dropdown__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3rem;
  box-sizing: border-box;
  padding: 0 1rem;
  border: none;
  background: none;
  color: var(--on-surface);
  font: var(--m3e-type-body-large);
  text-align: left;
  cursor: pointer;
}
.m3-dropdown__trigger--filled {
  background: var(--field-filled-bg);
  border-radius: var(--shape-corner-m) var(--shape-corner-m) 0 0;
  border-bottom: 2px solid var(--primary);
}
.m3-dropdown__trigger--filled:hover {
  background: color-mix(in oklab, var(--on-surface) 12%, var(--field-filled-bg));
}
.m3-dropdown__trigger--outlined {
  background: var(--surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-xs);
}
.m3-dropdown__trigger--outlined:hover {
  border-color: var(--outline);
}
.m3-dropdown__field {
  flex: 1;
  min-width: 0;
}
.m3-dropdown__value {
  color: var(--on-surface);
}
.m3-dropdown__placeholder {
  color: var(--on-surface-variant);
}
.m3-dropdown__icon {
  display: flex;
  flex: none;
  color: var(--on-surface-variant);
  transition: transform var(--m3e-duration-short) var(--m3e-easing-emphasized-decelerate);
}
.m3-dropdown__icon > :global(svg) {
  width: 1.5rem;
  height: 1.5rem;
}
.m3-dropdown__trigger--open .m3-dropdown__icon {
  transform: rotate(180deg);
}
.m3-dropdown__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  box-sizing: border-box;
  border-radius: var(--shape-corner-s);
  background: var(--surface-container);
  box-shadow: var(--m3e-elevation-2);
  animation: m3-dropdown-in var(--m3e-duration-short) var(--m3e-easing-emphasized-decelerate) both;
}
.m3-dropdown__item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 16px;
  border: none;
  background: none;
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-large);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.m3-dropdown__item:hover {
  background: color-mix(in oklab, var(--on-surface) 8%, transparent);
}
.m3-dropdown__item:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
.m3-dropdown__item--selected {
  color: var(--on-surface);
}
.m3-dropdown__check {
  display: flex;
  flex: none;
  width: 18px;
  color: var(--primary);
}
.m3-dropdown__check > :global(svg) {
  width: 1.125rem;
  height: 1.125rem;
}
.m3-dropdown__item-label {
  flex: 1;
}
@-moz-keyframes m3-dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@-webkit-keyframes m3-dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@-o-keyframes m3-dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes m3-dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
