<script lang="ts">
/**
 * MediaFilterSearch - search field with clear button and an optional Reset
 * pill shown while any filter is active.
 */
import Icon from "@components/atoms/display/Icon.svelte";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

let {
	query = $bindable(""),
	hasActiveFilters,
	oninput,
	onclear,
	onreset,
}: {
	query: string;
	hasActiveFilters: boolean;
	oninput: () => void;
	onclear: () => void;
	onreset: () => void;
} = $props();
</script>

<div class="media-sidebar-search">
	<div class="media-search-field">
		<span class="media-search-icon">
			<Icon icon="material-symbols:search-rounded" />
		</span>
		<input
			type="text"
			class="media-search-input"
			placeholder="{i18n(I18nKey.search)}..."
			bind:value={query}
			{oninput}
		/>
		{#if query.trim()}
			<button
				type="button"
				class="media-search-clear"
				onclick={onclear}
				aria-label="Clear search"
			>
				<Icon icon="material-symbols:close-rounded" />
			</button>
		{/if}
	</div>
	<button
		type="button"
		class="media-sidebar-reset-btn"
		class:media-sidebar-reset-btn--active={hasActiveFilters}
		disabled={!hasActiveFilters}
		onclick={() => hasActiveFilters && onreset()}
		title={i18n(I18nKey.mediaFilterReset)}
		aria-label={i18n(I18nKey.mediaFilterReset)}
	>
		<Icon icon="material-symbols:restart-alt-rounded" />
	</button>
</div>

<style lang="stylus">
.media-sidebar-search
	display: flex
	align-items: center
	gap: 0.5rem
	width: 100%

.media-sidebar-reset-btn
	display: inline-flex
	align-items: center
	justify-content: center
	width: var(--media-filter-item-height, 2.25rem)
	height: var(--media-filter-item-height, 2.25rem)
	box-sizing: border-box
	padding: 0
	color: var(--on-surface-variant)
	background: var(--surface-container)
	border: none
	border-radius: var(--shape-corner-m)
	cursor: pointer
	flex-shrink: 0
	transition: all var(--m3e-duration-short) ease

	> :global(svg)
		width: 1.25rem
		height: 1.25rem
		transition: transform var(--m3e-duration-medium) var(--m3e-easing-standard)

	&:disabled
		opacity: 0.38
		cursor: not-allowed
		pointer-events: none

	&--active
		color: var(--primary)
		background: unquote('color-mix(in srgb, var(--primary) 14%, var(--surface-container))')

		&:hover
			background: unquote('color-mix(in srgb, var(--primary) 24%, var(--surface-container))')
			> :global(svg)
				transform: rotate(-45deg)

	&:focus-visible
		outline: 2px solid var(--primary)
		outline-offset: 1px

.media-search-field
	position: relative
	display: flex
	align-items: center
	flex: 1 1 0%
	min-width: 0
	height: var(--media-filter-item-height, 2.25rem)
	box-sizing: border-box
	background: var(--surface-container)
	border: none
	border-radius: var(--shape-corner-m)
	transition: all var(--m3e-duration-short) ease

	&:hover
		background: var(--surface-container-high)

	&:focus-within
		background: unquote('color-mix(in srgb, var(--primary) 12%, var(--surface-container-high))')
		box-shadow: 0 0 0 1.5px unquote('color-mix(in srgb, var(--primary) 40%, transparent)')

.media-search-icon
	display: flex
	align-items: center
	justify-content: center
	padding-left: 0.75rem
	color: var(--on-surface-variant)
	pointer-events: none
	transition: color var(--m3e-duration-short) ease

:global(.media-search-field:focus-within) .media-search-icon
	color: var(--primary)

.media-search-input
	flex: 1
	min-width: 0
	height: 100%
	padding: 0 0.5rem
	font-size: 0.8125rem
	color: var(--on-surface)
	background: transparent
	border: none
	outline: none
	box-sizing: border-box

	&::placeholder
		color: var(--on-surface-variant)
		opacity: 0.75

.media-search-clear
	display: flex
	align-items: center
	justify-content: center
	padding: 0.25rem 0.6rem
	color: var(--on-surface-variant)
	background: transparent
	border: none
	cursor: pointer
	border-radius: var(--shape-corner-full)
	transition: color var(--m3e-duration-short) ease

	&:hover
		color: var(--on-surface)

	> :global(svg)
		width: 1rem
		height: 1rem
</style>
