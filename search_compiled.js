import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/organisms/Search.svelte");import.meta.env = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SITE": "https://nullvert.uz", "SSR": false};import "/node_modules/.vite/deps/svelte_internal_disclose-version.js?v=53fb9772";
import "/node_modules/.vite/deps/svelte_internal_flags_legacy.js?v=53fb9772";

Search[$.FILENAME] = 'src/components/organisms/Search.svelte';

import * as $ from "/node_modules/.vite/deps/svelte_internal_client.js?v=53fb9772";
import IconButton from "/src/components/atoms/action/IconButton.svelte?t=1793114223515";
import SearchPanel from "/src/components/atoms/blog/SearchPanel.svelte?t=1793114223515";
import SearchBar from "/src/components/molecules/SearchBar.svelte?t=1793114223515";
import I18nKey from "/src/i18n/i18nKey.ts";
import { i18n } from "/src/i18n/translation.ts";
import Icon from "/src/components/atoms/display/Icon.svelte?t=1793114223515";
import { url } from "/src/utils/url-utils.ts";
import { onMount } from "/node_modules/.vite/deps/svelte.js?v=53fb9772";

var root = $.add_locations($.from_html(`<!> <!> <!>`, 1), Search[$.FILENAME], []);

function Search($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, false, Search);

	const panelResults = $.mutable_source();
	let keywordDesktop = $.tag($.mutable_source(""), 'keywordDesktop');
	let keywordMobile = $.tag($.mutable_source(""), 'keywordMobile');
	let result = $.tag($.mutable_source([]), 'result');
	let isSearching = false;
	let pagefindLoaded = false;
	let initialized = $.tag($.mutable_source(false), 'initialized');

	const fakeResult = [
		{
			url: url("/"),
			meta: { title: "This Is a Fake Search Result" },
			excerpt: "Because the search cannot work in the <mark>dev</mark> environment."
		},

		{
			url: url("/"),
			meta: { title: "If You Want to Test the Search" },
			excerpt: "Try running <mark>npm build && npm preview</mark> instead."
		}
	];

	const openPanel = () => {
		const panel = document.getElementById("search-panel");

		if (panel) {
			panel.classList.remove("float-panel-closed");

			setTimeout(
				() => {
					panel.querySelector("input")?.focus();
				},
				50
			);
		}
	};

	const togglePanel = () => {
		const panel = document.getElementById("search-panel");

		if (panel) {
			const isClosed = panel.classList.contains("float-panel-closed");

			if (isClosed) {
				openPanel();
			} else {
				panel.classList.add("float-panel-closed");
			}
		}
	};

	const setPanelVisibility = (show, isDesktop) => {
		const panel = document.getElementById("search-panel");

		if (!panel || !isDesktop) return;

		if (show) {
			panel.classList.remove("float-panel-closed");
		} else {
			panel.classList.add("float-panel-closed");
		}
	};

	const search = async (keyword, isDesktop) => {
		if (!keyword) {
			setPanelVisibility(false, isDesktop);
			$.set(result, []);

			return;
		}

		if (!$.get(initialized)) {
			return;
		}

		isSearching = true;

		try {
			let searchResults = [];

			if (import.meta.env.PROD) {
				if (!window.pagefind && $.strict_equals(typeof window.__loadPagefind, "function")) {
					(await $.track_reactivity_loss(window.__loadPagefind()))();
				}

				pagefindLoaded = $.strict_equals(typeof window.pagefind?.search, "function");

				if (pagefindLoaded && window.pagefind) {
					const response = (await $.track_reactivity_loss(window.pagefind.search(keyword)))();

					searchResults = (await $.track_reactivity_loss(Promise.all(response.results.map((item) => item.data()))))();
				} else {
					searchResults = [];
					console.error("Pagefind is not available in production environment.");
				}
			} else if (import.meta.env.DEV) {
				searchResults = fakeResult;
			}

			$.set(result, searchResults);
			setPanelVisibility($.get(result).length > 0, isDesktop);
		} catch(error) {
			console.error(...$.log_if_contains_state('error', "Search error:", error));
			$.set(result, []);
			setPanelVisibility(false, isDesktop);
		} finally {
			isSearching = false;
		}
	};

	onMount(() => {
		const initializeSearch = () => {
			$.set(initialized, true);
			pagefindLoaded = $.strict_equals(typeof window, "undefined", false) && !!window.pagefind && $.strict_equals(typeof window.pagefind.search, "function");
			console.log(...$.log_if_contains_state('log', "Pagefind status on init:", pagefindLoaded));

			if ($.get(keywordDesktop)) search($.get(keywordDesktop), true);
			if ($.get(keywordMobile)) search($.get(keywordMobile), false);
		};

		if (import.meta.env.DEV) {
			console.log("Pagefind is not available in development mode. Using mock data.");
			initializeSearch();
		} else {
			document.addEventListener("pagefindready", () => {
				console.log("Pagefind ready event received.");
				initializeSearch();
			});

			initializeSearch();
		}

		const handleToggleEvent = () => togglePanel();
		const handleOpenEvent = () => openPanel();

		document.addEventListener("search:toggle", handleToggleEvent);
		document.addEventListener("search:open", handleOpenEvent);

		return () => {
			document.removeEventListener("search:toggle", handleToggleEvent);
			document.removeEventListener("search:open", handleOpenEvent);
		};
	});

	$.legacy_pre_effect(() => ($.get(result)), () => {
		$.set(panelResults, $.get(result).map((r) => ({ url: r.url, title: r.meta.title, excerpt: r.excerpt })));
	});

	$.legacy_pre_effect(() => ($.get(initialized), $.get(keywordDesktop)), () => {
		if ($.get(initialized)) {
			(async () => {
				(await $.track_reactivity_loss(search($.get(keywordDesktop), true)))();
			})();
		}
	});

	$.legacy_pre_effect(() => ($.get(initialized), $.get(keywordMobile)), () => {
		if ($.get(initialized)) {
			(async () => {
				(await $.track_reactivity_loss(search($.get(keywordMobile), false)))();
			})();
		}
	});

	$.legacy_pre_effect_reset();

	var $$exports = { ...$.legacy_api() };

	$.init();

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived_safe_equal(() => (
			$.deep_read_state(i18n),
			$.deep_read_state(I18nKey),
			$.untrack(() => i18n(I18nKey.search))
		));

		$.add_svelte_meta(
			() => SearchBar(node, {
				id: 'search-input-desktop',
				name: 'search-desktop',
				get placeholder() {
					return $.get($0);
				},
				onfocus: () => search($.get(keywordDesktop), true),
				oncollapse: () => setPanelVisibility(false, true),
				get value() {
					return $.get(keywordDesktop);
				},

				set value($$value) {
					$.set(keywordDesktop, $$value);
				},
				$$legacy: true
			}),
			'component',
			Search,
			135,
			0,
			{ componentTag: 'SearchBar' }
		);
	}

	var node_1 = $.sibling(node, 2);

	$.add_svelte_meta(
		() => IconButton(node_1, {
			icon: 'material-symbols:search',
			label: 'Search Panel',
			id: 'search-switch',
			size: 'small',
			shape: 'round',
			onclick: togglePanel,
			class: 'lg:!hidden !w-10 !h-10 !text-[1.25rem]'
		}),
		'component',
		Search,
		145,
		0,
		{ componentTag: 'IconButton' }
	);

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived_safe_equal(() => (
			$.deep_read_state(i18n),
			$.deep_read_state(I18nKey),
			$.untrack(() => i18n(I18nKey.search))
		));

		$.add_svelte_meta(
			() => SearchPanel(node_2, {
				id: 'search-panel',
				class: 'float-panel float-panel-closed fixed top-16 inset-x-4 max-w-[36rem] mx-auto md:absolute md:top-20 md:inset-x-auto md:right-4 md:w-[30rem] z-[100]',
				get results() {
					return $.get(panelResults);
				},

				get placeholder() {
					return $.get($0);
				},

				get query() {
					return $.get(keywordMobile);
				},

				set query($$value) {
					$.set(keywordMobile, $$value);
				},
				$$legacy: true
			}),
			'component',
			Search,
			156,
			0,
			{ componentTag: 'SearchPanel' }
		);
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

if (import.meta.hot) {
	Search = $.hmr(Search);

	import.meta.hot.acceptExports(["default"],(module) => {
		Search[$.HMR].update(module.default);
	});
}

export default Search;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsT0FBTztBQUNQLE9BQU8saUJBQWU7QUFDdEIsT0FBTyxlQUFhO0FBQ3BCLG9CQUFTO0FBQ1QsU0FBTyxZQUFVO0FBQ2pCLGlCQUFTO0FBQ1QsU0FBUztBQUdULFNBQUksZUFBaUI7Ozs7bUNBWHJCLENBQUM7Ozs7O0NBY0QsSUFBSSx3Q0FBYztDQUNsQixJQUFJO0NBQ0osSUFBSTtDQUVKLElBQUcsY0FBZTtLQUNqQixpQkFBTztLQUNQLHFDQUFjOztPQWNSOztHQUlMLFNBQVM7R0FFWCxRQUVBLE9BQU07R0FFTCxTQUNDOzs7O0dBR0EsS0FBSztHQUNOLFFBQ0Q7R0FHQyxTQUFNOzs7O09BSUosa0JBQVU7UUFDWCxRQUFPOztNQUNOLE9BQU07R0FDUDs7R0FDRDtVQUFBO0tBQ0Q7SUFFQTtJQUFBLEVBQU07O0VBQ0w7OztPQUlDLG9CQUF1QjtFQUN4QixjQUFPOztNQUNOLE9BQU07R0FDUDs7R0FDRDtJQUVBO0dBQ0MsT0FBSztJQUNKLG9CQUFtQixvQkFBZ0I7R0FDbkM7Ozs7T0FLQTtFQUNEOztFQUVBLGVBQWM7O01BR2IsTUFBSTtHQUVKLE1BQUksVUFBWSxPQUFJLG9CQUFNO1NBRXZCO1NBS0QsVUFFRSx3QkFBZTs7OztPQUlqQixTQUFNLE9BQVcsU0FBYSxjQUF1QjtPQUNyRDtzQkFHTTs7Ozs7O2FBS1AsY0FBZ0I7R0FDakI7OztFQUlELGNBQVM7O01BRVI7R0FDQTs7R0FFQSxnQkFBYztJQUNmLEtBQ0QsMENBR0MsT0FDQyxnQkFBYyxhQUNkO01BSUEsOEJBQ0EsT0FDSTtJQUNMOztJQUVBLHdDQUF5Qjs7SUFDeEIsc0JBQ0M7S0FFRCxrQkFBaUI7O0tBQ2xCLGlCQUFPLDBDQUNOLFNBQVMsc0JBQWlCO0lBRXpCO0tBQ0E7S0FDRCxvRUFBaUI7SUFDbEI7R0FFQSxPQUFNLHlCQUEwQjtJQUNoQyxnQkFBTTtHQUVOOztTQUdBO0dBQ0MseUJBQVMsaUJBQW9CLFlBQWlCO1VBQzlDLE9BQVM7R0FDVjtTQUNBO0dBRUQsbUJBQW9CO0VBQ25CLFVBQUM7R0FDQSxjQUFhO0VBQ2Q7Q0FDRDs7ZUFHYztRQUNaLHlCQUE0QjtTQUM3QixhQUFHO0dBQ0osd0NBQ1MsaUNBQ1QsMENBQ1UsZ0JBQWEsUUFBVTtHQUNoQyxRQUFTOztHQUNWLFVBQUksaUJBQVksOEJBQWU7R0FDL0IsVUFBTSxnQkFBZSxhQUFPLGdCQUFDO0VBQzdCOztFQUVBLElBQUksWUFBYSxJQUFFLEtBQU87R0FDMUIsUUFBSSxJQUNGLGlFQUNGO0dBQ0U7RUFDRDtHQUNELFNBQVUsaUJBQWlCLHVCQUFPO0lBQ2xDLFFBQVcsb0NBQWE7SUFDeEI7R0FDQTs7R0FDQTtFQUNBOztFQUVDLE1BQUM7RUFDRjs7RUFFQywwQkFBVztFQUNaLFNBQVEsaUJBQWE7O0VBRXJCLGFBQWM7R0FDZCxTQUFXLG9CQUFlO0dBQzFCLFNBQUksb0JBQTBCLGVBQVE7RUFDckM7Ozs7UUF2TEMsMENBRUYsS0FBTSxPQUVKLE9BQUssRUFBSSxLQUFHLE9BQ1osU0FDQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQXRCSTtxQkFEUDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBQ087cUJBRFAiLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIlNlYXJjaC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdCBsYW5nPVwidHNcIj5cclxuaW1wb3J0IEljb25CdXR0b24gZnJvbSBcIkBjb21wb25lbnRzL2F0b21zL2FjdGlvbi9JY29uQnV0dG9uLnN2ZWx0ZVwiO1xyXG5pbXBvcnQgU2VhcmNoUGFuZWwgZnJvbSBcIkBjb21wb25lbnRzL2F0b21zL2Jsb2cvU2VhcmNoUGFuZWwuc3ZlbHRlXCI7XHJcbmltcG9ydCBTZWFyY2hCYXIgZnJvbSBcIkBjb21wb25lbnRzL21vbGVjdWxlcy9TZWFyY2hCYXIuc3ZlbHRlXCI7XHJcbmltcG9ydCBJMThuS2V5IGZyb20gXCJAaTE4bi9pMThuS2V5XCI7XHJcbmltcG9ydCB7IGkxOG4gfSBmcm9tIFwiQGkxOG4vdHJhbnNsYXRpb25cIjtcclxuaW1wb3J0IEljb24gZnJvbSBcIkBpY29uaWZ5L3N2ZWx0ZVwiO1xyXG5pbXBvcnQgeyB1cmwgfSBmcm9tIFwiQHV0aWxzL3VybC11dGlscy50c1wiO1xyXG5pbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xyXG5pbXBvcnQgdHlwZSB7IFNlYXJjaFJlc3VsdCB9IGZyb20gXCJAL2dsb2JhbFwiO1xyXG5cclxubGV0IGtleXdvcmREZXNrdG9wID0gXCJcIjtcclxubGV0IGtleXdvcmRNb2JpbGUgPSBcIlwiO1xyXG5sZXQgcmVzdWx0OiBTZWFyY2hSZXN1bHRbXSA9IFtdO1xyXG5sZXQgaXNTZWFyY2hpbmcgPSBmYWxzZTtcclxubGV0IHBhZ2VmaW5kTG9hZGVkID0gZmFsc2U7XHJcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuJDogcGFuZWxSZXN1bHRzID0gcmVzdWx0Lm1hcCgocikgPT4gKHtcclxuXHR1cmw6IHIudXJsLFxyXG5cdHRpdGxlOiByLm1ldGEudGl0bGUsXHJcblx0ZXhjZXJwdDogci5leGNlcnB0LFxyXG59KSk7XHJcblxyXG5jb25zdCBmYWtlUmVzdWx0OiBTZWFyY2hSZXN1bHRbXSA9IFtcclxuXHR7XHJcblx0XHR1cmw6IHVybChcIi9cIiksXHJcblx0XHRtZXRhOiB7XHJcblx0XHRcdHRpdGxlOiBcIlRoaXMgSXMgYSBGYWtlIFNlYXJjaCBSZXN1bHRcIixcclxuXHRcdH0sXHJcblx0XHRleGNlcnB0OlxyXG5cdFx0XHRcIkJlY2F1c2UgdGhlIHNlYXJjaCBjYW5ub3Qgd29yayBpbiB0aGUgPG1hcms+ZGV2PC9tYXJrPiBlbnZpcm9ubWVudC5cIixcclxuXHR9LFxyXG5cdHtcclxuXHRcdHVybDogdXJsKFwiL1wiKSxcclxuXHRcdG1ldGE6IHtcclxuXHRcdFx0dGl0bGU6IFwiSWYgWW91IFdhbnQgdG8gVGVzdCB0aGUgU2VhcmNoXCIsXHJcblx0XHR9LFxyXG5cdFx0ZXhjZXJwdDogXCJUcnkgcnVubmluZyA8bWFyaz5ucG0gYnVpbGQgJiYgbnBtIHByZXZpZXc8L21hcms+IGluc3RlYWQuXCIsXHJcblx0fSxcclxuXTtcclxuXHJcbmNvbnN0IG9wZW5QYW5lbCA9ICgpID0+IHtcclxuXHRjb25zdCBwYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VhcmNoLXBhbmVsXCIpO1xyXG5cdGlmIChwYW5lbCkge1xyXG5cdFx0cGFuZWwuY2xhc3NMaXN0LnJlbW92ZShcImZsb2F0LXBhbmVsLWNsb3NlZFwiKTtcclxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHRwYW5lbC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiaW5wdXRcIik/LmZvY3VzKCk7XHJcblx0XHR9LCA1MCk7XHJcblx0fVxyXG59O1xyXG5cclxuY29uc3QgdG9nZ2xlUGFuZWwgPSAoKSA9PiB7XHJcblx0Y29uc3QgcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaC1wYW5lbFwiKTtcclxuXHRpZiAocGFuZWwpIHtcclxuXHRcdGNvbnN0IGlzQ2xvc2VkID0gcGFuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZmxvYXQtcGFuZWwtY2xvc2VkXCIpO1xyXG5cdFx0aWYgKGlzQ2xvc2VkKSB7XHJcblx0XHRcdG9wZW5QYW5lbCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cGFuZWwuY2xhc3NMaXN0LmFkZChcImZsb2F0LXBhbmVsLWNsb3NlZFwiKTtcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5jb25zdCBzZXRQYW5lbFZpc2liaWxpdHkgPSAoc2hvdzogYm9vbGVhbiwgaXNEZXNrdG9wOiBib29sZWFuKTogdm9pZCA9PiB7XHJcblx0Y29uc3QgcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlYXJjaC1wYW5lbFwiKTtcclxuXHRpZiAoIXBhbmVsIHx8ICFpc0Rlc2t0b3ApIHJldHVybjtcclxuXHJcblx0aWYgKHNob3cpIHtcclxuXHRcdHBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJmbG9hdC1wYW5lbC1jbG9zZWRcIik7XHJcblx0fSBlbHNlIHtcclxuXHRcdHBhbmVsLmNsYXNzTGlzdC5hZGQoXCJmbG9hdC1wYW5lbC1jbG9zZWRcIik7XHJcblx0fVxyXG59O1xyXG5cclxuY29uc3Qgc2VhcmNoID0gYXN5bmMgKGtleXdvcmQ6IHN0cmluZywgaXNEZXNrdG9wOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcblx0aWYgKCFrZXl3b3JkKSB7XHJcblx0XHRzZXRQYW5lbFZpc2liaWxpdHkoZmFsc2UsIGlzRGVza3RvcCk7XHJcblx0XHRyZXN1bHQgPSBbXTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdGlmICghaW5pdGlhbGl6ZWQpIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdGlzU2VhcmNoaW5nID0gdHJ1ZTtcclxuXHJcblx0dHJ5IHtcclxuXHRcdGxldCBzZWFyY2hSZXN1bHRzOiBTZWFyY2hSZXN1bHRbXSA9IFtdO1xyXG5cclxuXHRcdGlmIChpbXBvcnQubWV0YS5lbnYuUFJPRCkge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0IXdpbmRvdy5wYWdlZmluZCAmJlxyXG5cdFx0XHRcdHR5cGVvZiAoXHJcblx0XHRcdFx0XHR3aW5kb3cgYXMgdW5rbm93biBhcyB7IF9fbG9hZFBhZ2VmaW5kPzogKCkgPT4gUHJvbWlzZTx1bmtub3duPiB9XHJcblx0XHRcdFx0KS5fX2xvYWRQYWdlZmluZCA9PT0gXCJmdW5jdGlvblwiXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdGF3YWl0IChcclxuXHRcdFx0XHRcdHdpbmRvdyBhcyB1bmtub3duIGFzIHsgX19sb2FkUGFnZWZpbmQ6ICgpID0+IFByb21pc2U8dW5rbm93bj4gfVxyXG5cdFx0XHRcdCkuX19sb2FkUGFnZWZpbmQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRwYWdlZmluZExvYWRlZCA9IHR5cGVvZiB3aW5kb3cucGFnZWZpbmQ/LnNlYXJjaCA9PT0gXCJmdW5jdGlvblwiO1xyXG5cdFx0XHRpZiAocGFnZWZpbmRMb2FkZWQgJiYgd2luZG93LnBhZ2VmaW5kKSB7XHJcblx0XHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCB3aW5kb3cucGFnZWZpbmQuc2VhcmNoKGtleXdvcmQpO1xyXG5cdFx0XHRcdHNlYXJjaFJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChcclxuXHRcdFx0XHRcdHJlc3BvbnNlLnJlc3VsdHMubWFwKChpdGVtKSA9PiBpdGVtLmRhdGEoKSksXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzZWFyY2hSZXN1bHRzID0gW107XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihcIlBhZ2VmaW5kIGlzIG5vdCBhdmFpbGFibGUgaW4gcHJvZHVjdGlvbiBlbnZpcm9ubWVudC5cIik7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSBpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xyXG5cdFx0XHRzZWFyY2hSZXN1bHRzID0gZmFrZVJlc3VsdDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQgPSBzZWFyY2hSZXN1bHRzO1xyXG5cdFx0c2V0UGFuZWxWaXNpYmlsaXR5KHJlc3VsdC5sZW5ndGggPiAwLCBpc0Rlc2t0b3ApO1xyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRjb25zb2xlLmVycm9yKFwiU2VhcmNoIGVycm9yOlwiLCBlcnJvcik7XHJcblx0XHRyZXN1bHQgPSBbXTtcclxuXHRcdHNldFBhbmVsVmlzaWJpbGl0eShmYWxzZSwgaXNEZXNrdG9wKTtcclxuXHR9IGZpbmFsbHkge1xyXG5cdFx0aXNTZWFyY2hpbmcgPSBmYWxzZTtcclxuXHR9XHJcbn07XHJcblxyXG5vbk1vdW50KCgpID0+IHtcclxuXHRjb25zdCBpbml0aWFsaXplU2VhcmNoID0gKCkgPT4ge1xyXG5cdFx0aW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG5cdFx0cGFnZWZpbmRMb2FkZWQgPVxyXG5cdFx0XHR0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmXHJcblx0XHRcdCEhd2luZG93LnBhZ2VmaW5kICYmXHJcblx0XHRcdHR5cGVvZiB3aW5kb3cucGFnZWZpbmQuc2VhcmNoID09PSBcImZ1bmN0aW9uXCI7XHJcblx0XHRjb25zb2xlLmxvZyhcIlBhZ2VmaW5kIHN0YXR1cyBvbiBpbml0OlwiLCBwYWdlZmluZExvYWRlZCk7XHJcblx0XHRpZiAoa2V5d29yZERlc2t0b3ApIHNlYXJjaChrZXl3b3JkRGVza3RvcCwgdHJ1ZSk7XHJcblx0XHRpZiAoa2V5d29yZE1vYmlsZSkgc2VhcmNoKGtleXdvcmRNb2JpbGUsIGZhbHNlKTtcclxuXHR9O1xyXG5cclxuXHRpZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xyXG5cdFx0Y29uc29sZS5sb2coXHJcblx0XHRcdFwiUGFnZWZpbmQgaXMgbm90IGF2YWlsYWJsZSBpbiBkZXZlbG9wbWVudCBtb2RlLiBVc2luZyBtb2NrIGRhdGEuXCIsXHJcblx0XHQpO1xyXG5cdFx0aW5pdGlhbGl6ZVNlYXJjaCgpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwicGFnZWZpbmRyZWFkeVwiLCAoKSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiUGFnZWZpbmQgcmVhZHkgZXZlbnQgcmVjZWl2ZWQuXCIpO1xyXG5cdFx0XHRpbml0aWFsaXplU2VhcmNoKCk7XHJcblx0XHR9KTtcclxuXHRcdGluaXRpYWxpemVTZWFyY2goKTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGhhbmRsZVRvZ2dsZUV2ZW50ID0gKCkgPT4gdG9nZ2xlUGFuZWwoKTtcclxuXHRjb25zdCBoYW5kbGVPcGVuRXZlbnQgPSAoKSA9PiBvcGVuUGFuZWwoKTtcclxuXHJcblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNlYXJjaDp0b2dnbGVcIiwgaGFuZGxlVG9nZ2xlRXZlbnQpO1xyXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWFyY2g6b3BlblwiLCBoYW5kbGVPcGVuRXZlbnQpO1xyXG5cclxuXHRyZXR1cm4gKCkgPT4ge1xyXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNlYXJjaDp0b2dnbGVcIiwgaGFuZGxlVG9nZ2xlRXZlbnQpO1xyXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNlYXJjaDpvcGVuXCIsIGhhbmRsZU9wZW5FdmVudCk7XHJcblx0fTtcclxufSk7XHJcblxyXG4kOiBpZiAoaW5pdGlhbGl6ZWQpIHtcclxuXHQoYXN5bmMgKCkgPT4ge1xyXG5cdFx0YXdhaXQgc2VhcmNoKGtleXdvcmREZXNrdG9wLCB0cnVlKTtcclxuXHR9KSgpO1xyXG59XHJcblxyXG4kOiBpZiAoaW5pdGlhbGl6ZWQpIHtcclxuXHQoYXN5bmMgKCkgPT4ge1xyXG5cdFx0YXdhaXQgc2VhcmNoKGtleXdvcmRNb2JpbGUsIGZhbHNlKTtcclxuXHR9KSgpO1xyXG59XHJcbjwvc2NyaXB0PlxyXG5cclxuPCEtLSDmoYzpnaLmkJzntKLvvJpTZWFyY2hCYXIg5YiG5a2Q77yINDBweCDlm77moIfmjInpkq7vvIxob3Zlci/ngrnlh7vlsZXlvIDmiJDog7blm4rmkJzntKLmnaHvvIkgLS0+XHJcbjxTZWFyY2hCYXJcclxuICAgIGJpbmQ6dmFsdWU9e2tleXdvcmREZXNrdG9wfVxyXG4gICAgaWQ9XCJzZWFyY2gtaW5wdXQtZGVza3RvcFwiXHJcbiAgICBuYW1lPVwic2VhcmNoLWRlc2t0b3BcIlxyXG4gICAgcGxhY2Vob2xkZXI9e2kxOG4oSTE4bktleS5zZWFyY2gpfVxyXG4gICAgb25mb2N1cz17KCkgPT4gc2VhcmNoKGtleXdvcmREZXNrdG9wLCB0cnVlKX1cclxuICAgIG9uY29sbGFwc2U9eygpID0+IHNldFBhbmVsVmlzaWJpbGl0eShmYWxzZSwgdHJ1ZSl9XHJcbi8+XHJcblxyXG48IS0tIHRvZ2dsZSBidG4gZm9yIHBob25lL3RhYmxldCB2aWV3IC0tPlxyXG48SWNvbkJ1dHRvblxyXG4gICAgaWNvbj1cIm1hdGVyaWFsLXN5bWJvbHM6c2VhcmNoXCJcclxuICAgIGxhYmVsPVwiU2VhcmNoIFBhbmVsXCJcclxuICAgIGlkPVwic2VhcmNoLXN3aXRjaFwiXHJcbiAgICBzaXplPVwic21hbGxcIlxyXG4gICAgc2hhcGU9XCJyb3VuZFwiXHJcbiAgICBvbmNsaWNrPXt0b2dnbGVQYW5lbH1cclxuICAgIGNsYXNzPVwibGc6IWhpZGRlbiAhdy0xMCAhaC0xMCAhdGV4dC1bMS4yNXJlbV1cIlxyXG4vPlxyXG5cclxuPCEtLSBzZWFyY2ggcGFuZWzvvIhibG9nL1NlYXJjaFBhbmVsIOWOn+WtkO+8m+W8gOWQiOeUseiwg+eUqOaWuSBjbGFzc0xpc3Qg5o6n5Yi277yM5LiOIERpc3BsYXlTZXR0aW5ncyDlkIzmrL7vvIkgLS0+XHJcbjxTZWFyY2hQYW5lbFxyXG4gICAgaWQ9XCJzZWFyY2gtcGFuZWxcIlxyXG4gICAgY2xhc3M9XCJmbG9hdC1wYW5lbCBmbG9hdC1wYW5lbC1jbG9zZWQgZml4ZWQgdG9wLTE2IGluc2V0LXgtNCBtYXgtdy1bMzZyZW1dIG14LWF1dG8gbWQ6YWJzb2x1dGUgbWQ6dG9wLTIwIG1kOmluc2V0LXgtYXV0byBtZDpyaWdodC00IG1kOnctWzMwcmVtXSB6LVsxMDBdXCJcclxuICAgIGJpbmQ6cXVlcnk9e2tleXdvcmRNb2JpbGV9XHJcbiAgICByZXN1bHRzPXtwYW5lbFJlc3VsdHN9XHJcbiAgICBwbGFjZWhvbGRlcj17aTE4bihJMThuS2V5LnNlYXJjaCl9XHJcbi8+XHJcbiJdLCJmaWxlIjoiQzovVXNlcnMvVXNlci9Qcm9qZWN0cy9TaGlyb25lL3NyYy9jb21wb25lbnRzL29yZ2FuaXNtcy9TZWFyY2guc3ZlbHRlIn0=