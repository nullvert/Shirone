<script lang="ts">
/** 技能展示卡（分子）：图标、名称、说明与离散熟练度。 */

import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { reveal } from "@utils/motion";
import type { SkillItem, SkillLevel } from "@/types/skillsConfig";

let { skill, delay = 0 }: { skill: SkillItem; delay?: number } = $props();

const levelMeta: Record<SkillLevel, { value: number; key: I18nKey }> = {
	beginner: { value: 1, key: I18nKey.skillLevelBeginner },
	intermediate: { value: 2, key: I18nKey.skillLevelIntermediate },
	advanced: { value: 3, key: I18nKey.skillLevelAdvanced },
	expert: { value: 4, key: I18nKey.skillLevelExpert },
};

const meta = $derived(levelMeta[skill.level]);
const levelLabel = $derived(i18n(meta.key));
const fallback = $derived((skill.name.charAt(0) || "?").toUpperCase());
</script>

<article class="skill-card" data-level={skill.level} use:reveal={{ delay }}>
	<div class="skill-card__header">
		<span class="skill-card__icon" aria-hidden="true">
			{#if skill.icon}
				<Icon icon={skill.icon} />
			{:else}
				<span>{fallback}</span>
			{/if}
		</span>
		<div class="skill-card__identity">
			<h2>{skill.name}</h2>
			<span class="skill-card__level">{levelLabel}</span>
		</div>
	</div>

	{#if skill.description}
		<p class="skill-card__description">{skill.description}</p>
	{/if}

	<div
		class="skill-card__meter"
		role="meter"
		aria-label={`${i18n(I18nKey.skillLevel)}: ${levelLabel}`}
		aria-valuemin="1"
		aria-valuemax="4"
		aria-valuenow={meta.value}
		aria-valuetext={levelLabel}
	>
		{#each [1, 2, 3, 4] as segment}
			<span class:skill-card__segment--active={segment <= meta.value}></span>
		{/each}
	</div>
</article>

<style>
.skill-card {
  display: flex;
  flex-direction: column;
  gap: var(--m3e-space-3);
  min-width: 0;
  padding: var(--m3e-space-4);
  background: var(--card-bg);
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  transition: border-color var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate), box-shadow var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
}
.skill-card:hover {
  border-color: var(--outline);
  box-shadow: var(--m3e-elevation-1);
}
.skill-card__header {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-3);
  min-width: 0;
}
.skill-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: var(--shape-corner-m);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  font: var(--m3e-type-title-medium);
}
.skill-card__icon > :global(svg) {
  width: 1.5rem;
  height: 1.5rem;
}
.skill-card__identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
  width: 100%;
}
.skill-card__identity h2 {
  margin: 0;
  min-width: 0;
  color: var(--on-surface);
  font: var(--m3e-type-title-medium);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.skill-card__level {
  flex-shrink: 0;
  padding: 0.125rem 0.625rem;
  border-radius: var(--shape-corner-full);
  background: var(--secondary-container);
  color: var(--on-secondary-container);
  font: var(--m3e-type-label-small);
}
.skill-card__description {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-medium);
  line-height: 1.5;
}
.skill-card__meter {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--m3e-space-1);
}
.skill-card__meter > span {
  height: 0.375rem;
  border-radius: var(--shape-corner-full);
  background: var(--surface-container-highest);
}
.skill-card__meter > .skill-card__segment--active {
  background: var(--primary);
}
</style>
