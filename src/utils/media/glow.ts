/**
 * Курсорный блик и 3D-наклон для карточек Masterpiece:
 * ультра-плавное следование (lerp) через requestAnimationFrame.
 * Записывает CSS-переменные --mx/--my/--px/--py/--tilt-x/--tilt-y/--angle.
 */

export interface GlowController {
	/** Pointer enter/move. `snap` мгновенно ставит блик в точку курсора. */
	track(event: PointerEvent, snap: boolean): void;
	/** Pointer leave: блик плавно возвращается в центр. */
	reset(event: PointerEvent): void;
	/** Демонстрационный режим без курсора (simulatedHover). */
	simulate(el: HTMLElement): void;
	destroy(): void;
}

export function createGlowController(isActive: () => boolean): GlowController {
	let raf = 0;
	let el: HTMLElement | null = null;
	let tx = 0;
	let ty = 0;
	let cx = 0;
	let cy = 0;
	let curDeg = 0;
	let w = 1;
	let h = 1;

	const tick = (): void => {
		if (!el) {
			raf = 0;
			return;
		}
		cx += (tx - cx) * 0.06;
		cy += (ty - cy) * 0.06;

		// Нормализованные координаты [-1 ... 1] для мягкого 3D наклона (6.5°)
		const nx = (cx / w - 0.5) * 2;
		const ny = (cy / h - 0.5) * 2;

		// Интерполяция угла по кратчайшей дуге (без скачков через 0°/360°)
		let targetDeg = Math.atan2(ny, nx) * (180 / Math.PI) + 90;
		if (targetDeg < 0) targetDeg += 360;
		const diff = ((targetDeg - curDeg + 540) % 360) - 180;
		curDeg += diff * 0.08;

		el.style.setProperty("--mx", `${cx.toFixed(1)}px`);
		el.style.setProperty("--my", `${cy.toFixed(1)}px`);
		el.style.setProperty("--px", `${((cx / w) * 100).toFixed(1)}%`);
		el.style.setProperty("--py", `${((cy / h) * 100).toFixed(1)}%`);
		el.style.setProperty("--tilt-x", `${(-ny * 6.5).toFixed(2)}deg`);
		el.style.setProperty("--tilt-y", `${(nx * 6.5).toFixed(2)}deg`);
		el.style.setProperty("--angle", `${curDeg.toFixed(1)}deg`);

		raf =
			Math.abs(tx - cx) + Math.abs(ty - cy) > 0.2 || Math.abs(diff) > 0.5
				? requestAnimationFrame(tick)
				: 0;
	};

	const start = (): void => {
		if (!raf) raf = requestAnimationFrame(tick);
	};

	return {
		track(event, snap) {
			if (typeof window === "undefined") return;
			if (!isActive() || event.pointerType === "touch") return;
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			el = event.currentTarget as HTMLElement;
			const rect = el.getBoundingClientRect();
			w = rect.width || 1;
			h = rect.height || 1;
			tx = event.clientX - rect.left;
			ty = event.clientY - rect.top;
			if (snap) {
				cx = tx;
				cy = ty;
			}
			start();
		},
		reset(event) {
			if (!el || event.pointerType === "touch") return;
			tx = w * 0.5;
			ty = h * 0.5;
			start();
		},
		simulate(target) {
			el = target;
			const rect = target.getBoundingClientRect();
			w = rect.width || 260;
			h = rect.height || 390;
			tx = w * 0.72;
			ty = h * 0.28;
			cx = tx;
			cy = ty;
			start();
		},
		destroy() {
			if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(raf);
			raf = 0;
		},
	};
}
