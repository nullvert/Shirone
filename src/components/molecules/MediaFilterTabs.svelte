<script lang="ts">
/**
 * MediaFilterTabs - segmented control for the media type (All / Movies / TV).
 */
let {
	options,
	selected,
	onselect,
}: {
	options: { key: string; label: string }[];
	selected: string;
	onselect: (key: string) => void;
} = $props();
</script>

<div class="media-sidebar-tabs">
	{#each options as opt (opt.key)}
		<button
			type="button"
			class="media-sidebar-tab"
			class:media-sidebar-tab--active={selected === opt.key}
			onclick={() => onselect(opt.key)}
		>
			{opt.label}
		</button>
	{/each}
</div>

<style>
.media-sidebar-tabs {
  display: flex;
  align-items: center;
  height: var(--media-filter-item-height, 2.25rem);
  box-sizing: border-box;
  background: var(--surface-container);
  border: none;
  border-radius: var(--shape-corner-m);
  padding: 0.1875rem;
  gap: 2px;
}
.media-sidebar-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  box-sizing: border-box;
  padding: 0 0.5rem;
  border: none;
  background: transparent;
  color: var(--on-surface-variant);
  border-radius: var(--shape-corner-s);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--m3e-duration-short) ease;
}
.media-sidebar-tab:hover {
  color: var(--on-surface);
  background: color-mix(in srgb, var(--on-surface) 6%, transparent);
}
.media-sidebar-tab:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.media-sidebar-tab--active {
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 600;
}
</style>
