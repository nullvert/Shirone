<script lang="ts">
/**
 * M3E 通用原子 — Skeleton 加载占位。
 * variant: text（一行文字）/ circle（圆形，头像等）/ rect（矩形块，默认）；
 * width / height / radius 可覆盖；shimmer 高光扫过动画。
 */
let {
	variant = "rect",
	width,
	height,
	/** 圆角覆盖（默认按形状） */
	radius,
	class: className = "",
}: {
	variant?: "text" | "circle" | "rect";
	width?: string;
	height?: string;
	radius?: string;
	class?: string;
} = $props();

const style = [
	width ? `width: ${width}` : "",
	height ? `height: ${height}` : "",
	radius ? `border-radius: ${radius}` : "",
]
	.filter(Boolean)
	.join(";");
</script>

<span
	class="m3-skeleton m3-skeleton--{variant} {className}"
	style={style || undefined}
	aria-hidden="true"
></span>

<style>
.m3-skeleton {
  position: relative;
  display: inline-block;
  width: 4rem;
  height: 1rem;
  overflow: hidden;
  background: var(--surface-container-high);
  vertical-align: middle;
}
.m3-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--on-surface) 7%, transparent), transparent);
  animation: m3-skeleton-shimmer 1.6s infinite;
}
.m3-skeleton--text {
  height: 1rem;
  border-radius: var(--shape-corner-s);
}
.m3-skeleton--circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--shape-corner-full);
}
.m3-skeleton--rect {
  border-radius: var(--shape-corner-s);
}
@-moz-keyframes m3-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}
@-webkit-keyframes m3-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}
@-o-keyframes m3-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}
@keyframes m3-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}
</style>
