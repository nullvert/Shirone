<script lang="ts">
/**
 * M3E Slider — 色相滑块原子。
 * 还原原子化前的经典视觉：彩虹轨道带（--color-selection-bar，明暗自适应）
 * + 白色矩形滑块（hover/active 亮度微调）。仅供色相选择使用。
 */
let {
	value = $bindable(50),
	min = 0,
	max = 100,
	step = 1,
	label = "",
}: {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	label?: string;
} = $props();
</script>

<div class="m3-slider-wrap">
    <input
        type="range"
        {min}
        {max}
        {step}
        bind:value
        aria-label={label}
        class="m3-slider"
    />
</div>

<style>
.m3-slider-wrap {
  position: relative;
  display: flex;
  align-items: center;
  height: 2.25rem;
  border-radius: var(--shape-corner-m);
  background-image: var(--color-selection-bar);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--outline-variant) 40%, transparent);
  user-select: none;
  padding: 0 0.375rem;
}
.m3-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
  cursor: pointer;
/* Thumb: современный круглый бегунок M3 с чистой тенью и аккуратным контуром */
}
.m3-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 1.625rem;
  width: 1.625rem;
  border-radius: var(--shape-corner-full);
  background: #fff;
  border: 2px solid var(--surface-container-high);
  box-shadow: 0 2px 8px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08);
  transition: transform var(--m3e-duration-short) var(--m3e-easing-standard), box-shadow var(--m3e-duration-short) var(--m3e-easing-standard);
}
.m3-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 12px rgba(0,0,0,0.38);
}
.m3-slider::-webkit-slider-thumb:active {
  transform: scale(0.94);
}
.m3-slider::-moz-range-thumb {
  height: 1.25rem;
  width: 1.25rem;
  border-radius: var(--shape-corner-full);
  background: #fff;
  border: 2px solid var(--surface-container-highest);
  box-shadow: 0 1px 3px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.1);
  transition: transform var(--m3e-duration-short) var(--m3e-easing-standard), box-shadow var(--m3e-duration-short) var(--m3e-easing-standard);
}
.m3-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
}
.m3-slider::-moz-range-thumb:active {
  transform: scale(0.95);
}
.m3-slider:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}
</style>
