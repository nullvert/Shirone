<script lang="ts">
/**
 * MediaFilterGroup - titled section wrapper for the media sidebar filter.
 */
import type { Snippet } from "svelte";

let { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="media-sidebar-group">
	<span class="media-sidebar-group__title">{title}</span>
	{@render children()}
</div>

<style lang="stylus">
.media-sidebar-group
	display: flex
	flex-direction: column
	gap: 0.4rem

	&__title
		font-size: 0.6875rem
		font-weight: 700
		text-transform: uppercase
		letter-spacing: 0.08em
		color: var(--on-surface-variant)
		padding-left: 0.2rem
</style>
