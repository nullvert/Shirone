<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

let mode: LIGHT_DARK_MODE = $state(DARK_MODE);

onMount(() => {
	mode = getStoredTheme();
	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		applyThemeToDocument(mode);
	};
	darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);

	return () => {
		darkModePreference.removeEventListener(
			"change",
			changeThemeWhenSchemeChanged,
		);
	};
});

const THEME_CYCLE: LIGHT_DARK_MODE[] = [DARK_MODE, LIGHT_MODE, AUTO_MODE];

function toggleScheme() {
	const currentIndex = THEME_CYCLE.indexOf(mode);
	const nextMode = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
	mode = nextMode;
	setTheme(nextMode);
}
</script>

<div class="relative z-50 flex h-10 w-10 shrink-0 items-center justify-center">
    <button aria-label="Toggle Light/Dark/System Theme"
            title={mode === DARK_MODE ? 'Dark Mode' : mode === LIGHT_MODE ? 'Light Mode' : 'System Theme'}
            class="m3-state-layer relative inline-flex items-center justify-center rounded-full h-10 w-10 border-none cursor-pointer select-none text-[var(--on-surface)] transition-transform duration-200 active:scale-95"
            style="font-size: 1.25rem; line-height: 1; --m3e-state-color: var(--on-surface); --m3e-focus-outline: var(--on-surface);"
            id="scheme-switch" onclick={toggleScheme}>
        <div class="absolute transition-opacity duration-200" class:opacity-0={mode !== LIGHT_MODE}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute transition-opacity duration-200" class:opacity-0={mode !== DARK_MODE}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute transition-opacity duration-200" class:opacity-0={mode !== AUTO_MODE}>
            <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>
        </div>
    </button>
</div>
