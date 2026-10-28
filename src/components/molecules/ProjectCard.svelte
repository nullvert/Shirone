<script lang="ts">
/**
 * 项目卡片（分子）：统一卡片壳 + 单一骨架，无断点分叉。
 * - 卡片壳对齐站点卡片语言（FriendCard/MediaPosterCard/SkillCard）：
 *   --card-bg + outline-variant 描边 + corner-l，hover 升级描边与 elevation-2；
 * - 代表项目（featured）：高亮边框渐变 + Featured 徽章；
 * - 有封面：通栏 16/9 媒体区（aspect-ratio 锁高 + object-fit: cover），
 *   任何宽度下图片都不可能撑高卡片，手机端不再被拉伸；
 *   加载前显示主题色渐变占位；封面可点（website）时整图外链；
 * - 无封面：回退为精致图标瓷砖头（图标 + 标题/阶段并排），不保留空图槽；
 * - 阶段为 tonal pill：语义色经 inline --project-phase-color 注入
 *   （shipped → tertiary / building → primary / exploring → secondary，
 *   与 ANIME_STATUS_META 的角色映射同源），避免动态 class 触发
 *   Svelte unused-CSS 剥离（见 rules/pitfalls.md 1.6）；
 * - 技术栈微胶囊（micro-badges）：统一 tonal pill 风格；
 * - 操作链接：M3 胶囊操作按钮，带图标与交互动效；
 * - 封面加载失败自动回退到图标形态，不破版。
 */
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { reveal } from "@utils/motion";
import type { ProjectItem, ProjectPhase } from "@/types/projectsConfig";

let { project, delay = 0 }: { project: ProjectItem; delay?: number } = $props();

let coverFailed = $state(false);

const phaseMeta: Record<
	ProjectPhase,
	{ key: I18nKey; icon: string; color: string }
> = {
	shipped: {
		key: I18nKey.projectPhaseShipped,
		icon: "material-symbols:check-circle-outline-rounded",
		color: "var(--tertiary)",
	},
	building: {
		key: I18nKey.projectPhaseBuilding,
		icon: "material-symbols:construction-rounded",
		color: "var(--primary)",
	},
	exploring: {
		key: I18nKey.projectPhaseExploring,
		icon: "material-symbols:explore-outline-rounded",
		color: "var(--secondary)",
	},
};

const phase = $derived(phaseMeta[project.phase]);
const showCover = $derived(Boolean(project.cover) && !coverFailed);
</script>

{#snippet coverImage()}
	<img
		src={project.cover}
		alt={project.coverAlt ?? project.title}
		loading="lazy"
		decoding="async"
		onerror={() => (coverFailed = true)}
	/>
	<span class="project-card__scrim" aria-hidden="true"></span>
	{#if project.featured}
		<span class="project-card__featured-badge" aria-hidden="true">
			<Icon icon="material-symbols:star-rounded" />
			<span>{i18n(I18nKey.pinned)}</span>
		</span>
	{/if}
{/snippet}

<article
	class={`project-card ${showCover ? "project-card--with-cover" : "project-card--without-cover"} ${project.featured ? "project-card--featured" : ""}`}
	data-project={project.key}
	style={`--project-phase-color: ${phase.color};`}
	use:reveal={{ delay }}
>
	{#if showCover}
		{#if project.website}
			<a
				class="project-card__cover"
				href={project.website}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${project.title} · ${i18n(I18nKey.projectVisit)}`}
			>
				{@render coverImage()}
			</a>
		{:else}
			<div class="project-card__cover">
				{@render coverImage()}
			</div>
		{/if}
	{/if}

	<div class="project-card__body">
		<div class="project-card__header">
			{#if !showCover}
				<span class="project-card__icon" aria-hidden="true">
					<Icon icon={project.icon ?? "material-symbols:deployed-code-outline-rounded"} />
				</span>
			{/if}

			<div class="project-card__heading">
				<div class="project-card__title-row">
					<h2 class="project-card__title">{project.title}</h2>
					{#if project.year}
						<span class="project-card__year">{project.year}</span>
					{/if}
				</div>
				<span class="project-card__phase" data-phase={project.phase}>
					<Icon icon={phase.icon} aria-hidden="true" />
					{i18n(phase.key)}
				</span>
			</div>
		</div>

		<p class="project-card__summary">{project.summary}</p>

		{#if project.technologies.length > 0}
			<ul
				class="project-card__technologies"
				aria-label={i18n(I18nKey.projectTechnologies)}
			>
				{#each project.technologies as technology (technology)}
					<li>{technology}</li>
				{/each}
			</ul>
		{/if}

		{#if project.website || project.repository}
			<div class="project-card__actions">
				{#if project.website}
					<a href={project.website} target="_blank" rel="noopener noreferrer">
						<Icon icon="material-symbols:open-in-new-rounded" aria-hidden="true" />
						{i18n(I18nKey.projectVisit)}
					</a>
				{/if}
				{#if project.repository}
					<a href={project.repository} target="_blank" rel="noopener noreferrer">
						<Icon icon="fa7-brands:github" aria-hidden="true" />
						{i18n(I18nKey.projectSource)}
					</a>
				{/if}
			</div>
		{/if}
	</div>
</article>

<style>
.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  transition: border-color var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate), box-shadow var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate), transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate), background-color var(--m3e-duration-medium) var(--m3e-easing-standard);
/* 代表项目特色高亮：边框微光 */
/* 封面：16/9 稳定比例锁高，图片永远按 cover 裁切，杜绝纵向拉伸 */
/* 代表项目封面角标：毛玻璃 + star 图标 */
/* 无封面紧凑变体：技术栈与源码操作合并一行，纵向节奏与有封面卡片对齐 */
/* 图标瓷砖：无封面项目的视觉锚点（有封面时不渲染） */
/* 阶段 tonal pill：语义色来自 inline --project-phase-color */
/* 技术栈徽标：微胶囊（micro-badges）风格 */
/* 操作按钮：M3 胶囊操作按钮 */
}
.project-card:hover {
  border-color: var(--outline);
  box-shadow: var(--m3e-elevation-2);
  transform: translateY(-2px);
  background: color-mix(in oklab, var(--on-surface) 2%, var(--card-bg));
}
.project-card--featured {
  border-color: color-mix(in oklab, var(--primary) 38%, var(--outline-variant));
}
.project-card--featured:hover {
  border-color: var(--primary);
}
.project-card__cover {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16/9;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(160deg, color-mix(in oklab, var(--primary) 16%, var(--surface-container-low)), var(--surface-container-high));
  text-decoration: none;
}
.project-card__cover:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
.project-card__cover > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate);
}
.project-card:hover .project-card__cover > img {
  transform: scale(1.05);
}
.project-card__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 40%, rgba(0,0,0,0.2) 100%);
  opacity: 0.6;
  transition: opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.project-card:hover .project-card__scrim {
  opacity: 0.8;
}
.project-card__featured-badge {
  position: absolute;
  top: 0.625rem;
  left: 0.625rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: var(--shape-corner-full);
  background: color-mix(in srgb, #000 60%, transparent);
  backdrop-filter: blur(0.375rem);
  -webkit-backdrop-filter: blur(0.375rem);
  color: #fff;
  font: var(--m3e-type-label-small);
  font-weight: 700;
  border: 1px solid rgba(255,255,255,0.15);
}
.project-card__featured-badge > :global(svg) {
  width: 0.875rem;
  height: 0.875rem;
  color: #facc15;
}
.project-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--m3e-space-3);
  min-width: 0;
  padding: var(--m3e-space-4) var(--m3e-space-4);
}
.project-card__header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}
.project-card--without-cover .project-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem 1rem;
  padding: 1.125rem 1.25rem;
}
.project-card--without-cover .project-card__header,
.project-card--without-cover .project-card__summary {
  grid-column: 1/-1;
}
.project-card--without-cover .project-card__summary {
  min-height: 2.8em;
}
.project-card--without-cover .project-card__technologies {
  align-self: center;
}
.project-card--without-cover .project-card__actions {
  align-self: center;
  justify-content: flex-end;
  margin-top: 0;
  padding-top: 0;
}
@media (max-width: 27.5rem) {
  .project-card--without-cover .project-card__body {
    grid-template-columns: minmax(0, 1fr);
  }
  .project-card--without-cover .project-card__header,
  .project-card--without-cover .project-card__summary {
    grid-column: 1;
  }
  .project-card--without-cover .project-card__actions {
    justify-content: flex-start;
  }
}
.project-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.875rem;
  height: 2.875rem;
  flex-shrink: 0;
  box-sizing: border-box;
  border-radius: var(--shape-corner-m);
  background: linear-gradient(135deg, color-mix(in oklab, var(--primary) 14%, var(--surface-container-high)), var(--surface-container-highest));
  border: 1px solid var(--outline-variant);
  color: var(--primary);
  transition: transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate), box-shadow var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
}
.project-card__icon > :global(svg) {
  width: 1.5rem;
  height: 1.5rem;
}
.project-card:hover .project-card__icon {
  transform: translateY(-0.125rem);
  box-shadow: var(--m3e-elevation-1);
}
.project-card__heading {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.375rem;
  min-width: 0;
}
.project-card__title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}
.project-card__title {
  margin: 0;
  min-width: 0;
  color: var(--on-surface);
  font: var(--m3e-type-title-small);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
  transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.project-card:hover .project-card__title {
  color: var(--primary);
}
.project-card__year {
  flex-shrink: 0;
  padding: 0.0625rem 0.375rem;
  border-radius: var(--shape-corner-xs);
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
  font-variant-numeric: tabular-nums;
}
.project-card__phase {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.3125rem;
  min-width: 0;
  padding: 0.125rem 0.5625rem;
  border-radius: var(--shape-corner-full);
  background: color-mix(in oklab, var(--project-phase-color) 12%, transparent);
  color: var(--project-phase-color);
  font: var(--m3e-type-label-small);
  font-weight: 600;
  border: 1px solid color-mix(in oklab, var(--project-phase-color) 20%, transparent);
}
.project-card__phase > :global(svg) {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}
.project-card__summary {
  display: -webkit-box;
  min-height: 2.8em;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  line-height: 1.5;
}
.project-card__technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3125rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.project-card__technologies li {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
  font-weight: 500;
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.project-card__technologies li:hover {
  background: var(--surface-container-highest);
  color: var(--on-surface);
}
.project-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.25rem;
}
.project-card__actions a {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--shape-corner-m);
  background: color-mix(in oklab, var(--primary) 8%, transparent);
  color: var(--primary);
  font: var(--m3e-type-label-medium);
  font-weight: 600;
  text-decoration: none;
  border: 1px solid color-mix(in oklab, var(--primary) 16%, transparent);
  transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard), box-shadow var(--m3e-duration-short) var(--m3e-easing-standard), transform var(--m3e-duration-short) var(--m3e-easing-standard);
}
.project-card__actions a:hover {
  background: color-mix(in oklab, var(--primary) 16%, transparent);
  box-shadow: var(--m3e-elevation-1);
  transform: translateY(-1px);
}
.project-card__actions a > :global(svg) {
  width: 1rem;
  height: 1rem;
}
</style>
