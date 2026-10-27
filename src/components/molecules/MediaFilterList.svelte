<script lang="ts">
/**
 * MediaFilterList - vertical option list shared by the status and sort groups.
 * Status rows show a count badge (and disable at zero); sort rows show a dot
 * on the active option.
 */
import Icon from "@components/atoms/display/Icon.svelte";
import type { FilterListItem } from "@utils/media/filter";

let {
	items,
	onselect,
}: {
	items: FilterListItem[];
	onselect: (id: string) => void;
} = $props();
</script>

<div class="media-sidebar-list">
	{#each items as item (item.id)}
		{@const isDisabled = item.count !== undefined && item.count === 0}
		<button
			type="button"
			class="media-sidebar-item"
			class:media-sidebar-item--active={item.active}
			class:media-sidebar-item--disabled={isDisabled}
			disabled={isDisabled}
			onclick={() => !isDisabled && onselect(item.id)}
			title={item.label}
		>
			<span class="media-sidebar-item__left">
				<Icon icon={item.icon} />
				<span>{item.label}</span>
			</span>
			{#if item.count !== undefined}
				<span
					class="media-sidebar-item__count"
					class:media-sidebar-item__count--active={item.active}
				>
					{item.count}
				</span>
			{/if}
		</button>
	{/each}
</div>

<style lang="stylus">
.media-sidebar-list
	display: flex
	flex-direction: column
	gap: 0.25rem

.media-sidebar-item
	display: flex
	align-items: center
	justify-content: space-between
	height: var(--media-filter-item-height, 2.25rem)
	box-sizing: border-box
	padding: 0 0.75rem
	border: none
	border-radius: var(--shape-corner-m)
	background: transparent
	color: var(--on-surface-variant)
	font-size: 0.84rem
	cursor: pointer
	transition: all var(--m3e-duration-short) ease

	&:hover:not(:disabled)
		background: unquote('color-mix(in srgb, var(--primary) 12%, var(--surface-container-high))')
		color: var(--on-surface)

	&:focus-visible
		outline: 2px solid var(--primary)
		outline-offset: 1px

	&--active
		background: unquote('color-mix(in srgb, var(--primary) 14%, var(--surface-container))')
		color: var(--primary)
		font-weight: 600

	&--disabled
		opacity: 0.38
		cursor: not-allowed
		pointer-events: none

	&__left
		display: flex
		align-items: center
		gap: 0.65rem
		> :global(svg)
			width: 1.15rem
			height: 1.15rem
			opacity: 0.9

	&__count
		display: inline-flex
		align-items: center
		justify-content: center
		min-width: 1.5rem
		height: 1.35rem
		padding: 0 0.4rem
		box-sizing: border-box
		font-size: 0.75rem
		font-weight: 700
		line-height: 1
		border-radius: var(--shape-corner-s)
		background: var(--surface-container-high)
		color: var(--on-surface-variant)
		transition: all var(--m3e-duration-short) ease

		&--active
			background: var(--primary)
			color: var(--on-primary)
			font-weight: 700
</style>
