<script lang="ts">
/**
 * MediaFilterGroup - статическая секция заголовка для группы бокового фильтра медиатеки.
 */
import type { Snippet } from "svelte";

let {
	title,
	children,
}: {
	title: string;
	collapsible?: boolean;
	defaultOpen?: boolean;
	children: Snippet;
} = $props();
</script>

<div class="media-sidebar-group">
	<div class="media-sidebar-group__header static">
		<span class="media-sidebar-group__title">{title}</span>
	</div>

	<div class="media-sidebar-group__body">
		{@render children()}
	</div>
</div>

<style>
.media-sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.media-sidebar-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.25rem;
  background: transparent;
  border: none;
  font: var(--m3e-type-label-small);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--on-surface-variant);
  user-select: none;
}
.media-sidebar-group__body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
</style>
