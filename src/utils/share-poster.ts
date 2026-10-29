/**
 * 分享海报生成工具。
 *
 * Генерация карточки публикации (Telegram / Social share banner).
 * Соотношение сторон 16:9 (1200x675) или 1200x630 (OG стандарт).
 * Дизайн:
 * - Фоновое изображение обложки растягивается на весь холст с мягким тёмным градиентным затемнением
 * - Вверху дата публикации
 * - В центре крупный заголовок и краткое описание статьи
 * - Внизу слева автор (Javohir), справа домен сайта
 */

export const SHARE_POSTER_WIDTH = 1200;
export const SHARE_POSTER_HEIGHT = 675; // 16:9 widescreen ratio, perfect for Telegram/socials

const PAGE_PADDING_X = 80;
const PAGE_PADDING_Y = 64;
const CONTENT_WIDTH = SHARE_POSTER_WIDTH - PAGE_PADDING_X * 2;

const DATE_FONT_SIZE = 26;
const TITLE_FONT_SIZE = 60;
const TITLE_LINE_HEIGHT = 76;
const DESCRIPTION_FONT_SIZE = 30;
const DESCRIPTION_LINE_HEIGHT = 44;
const FOOTER_FONT_SIZE = 26;

const FONT_FAMILY = 'Roboto, system-ui, -apple-system, "Segoe UI", sans-serif';

export interface SharePosterPalette {
	surfaceContainerLowest: string;
	surfaceContainerLow: string;
	surfaceContainerHigh?: string;
	onSurface: string;
	onSurfaceVariant: string;
	primary: string;
	primaryContainer: string;
	onPrimaryContainer: string;
	outlineVariant: string;
}

export interface SharePosterLabels {
	author: string;
	scanToRead: string;
}

export interface SharePosterInput {
	title: string;
	description: string;
	author: string;
	published: string;
	siteTitle: string;
	url: string;
	coverUrl?: string;
	avatarUrl?: string;
	labels?: SharePosterLabels;
	palette?: SharePosterPalette;
	signal?: AbortSignal;
}

interface DrawableImage {
	source: CanvasImageSource;
	close?: () => void;
}

/** 净化文件名，移除 Windows / POSIX 非法字符与控制字符。 */
export function sanitizeFilename(
	name: string,
	fallback = "article-share",
): string {
	const cleaned = Array.from(name)
		.filter((char) => {
			const code = char.charCodeAt(0);
			return code >= 32 && code !== 127 && !'<>:"/\\|?*'.includes(char);
		})
		.join("")
		.trim()
		.replace(/\s+/g, "-");
	return cleaned || fallback;
}

/** 从页面读取当前生效的主题计算颜色。 */
export function getSharePosterPalette(
	element: HTMLElement = document.documentElement,
): SharePosterPalette {
	const style = getComputedStyle(element);
	const getVar = (name: string, fallback: string) => {
		const value = style.getPropertyValue(name).trim();
		return value || fallback;
	};

	return {
		surfaceContainerLowest: getVar("--surface-container-lowest", "#ffffff"),
		surfaceContainerLow: getVar("--surface-container-low", "#f7f2fa"),
		surfaceContainerHigh: getVar("--surface-container-high", "#ece6f0"),
		onSurface: getVar("--on-surface", "#1d1b20"),
		onSurfaceVariant: getVar("--on-surface-variant", "#49454f"),
		primary: getVar("--primary", "#6750a4"),
		primaryContainer: getVar("--primary-container", "#eaddff"),
		onPrimaryContainer: getVar("--on-primary-container", "#21005d"),
		outlineVariant: getVar("--outline-variant", "#cac4d0"),
	};
}

/** 带超时与 CORS 保护的可选图片加载器。失败时返回 null 供排版降级。 */
async function loadDrawableImage(
	url?: string,
	signal?: AbortSignal,
	timeoutMs = 6000,
): Promise<DrawableImage | null> {
	if (!url || signal?.aborted) return null;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
		const onAbort = () => controller.abort();
		signal?.addEventListener("abort", onAbort, { once: true });

		try {
			const response = await fetch(url, { signal: controller.signal });
			if (!response.ok) return null;

			const contentType = response.headers.get("content-type") || "";
			if (contentType && !contentType.startsWith("image/")) return null;

			const blob = await response.blob();
			if (blob.size > 15 * 1024 * 1024) return null;

			if (typeof createImageBitmap === "function") {
				const bitmap = await createImageBitmap(blob);
				return { source: bitmap, close: () => bitmap.close() };
			}

			return await new Promise<DrawableImage | null>((resolve) => {
				const image = new Image();
				const blobUrl = URL.createObjectURL(blob);
				image.onload = () => {
					resolve({
						source: image,
						close: () => URL.revokeObjectURL(blobUrl),
					});
				};
				image.onerror = () => {
					URL.revokeObjectURL(blobUrl);
					resolve(null);
				};
				image.src = blobUrl;
			});
		} finally {
			clearTimeout(timeoutId);
			signal?.removeEventListener("abort", onAbort);
		}
	} catch {
		return null;
	}
}

function segmentText(text: string, granularity: "word" | "grapheme"): string[] {
	if (!text) return [];
	if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
		try {
			const segmenter = new Intl.Segmenter(undefined, { granularity });
			return Array.from(segmenter.segment(text), (segment) => segment.segment);
		} catch {
			// Fall through to the code-point-safe fallback.
		}
	}
	return Array.from(text);
}

/** 按可用宽度换行，达到上限后在最后一行追加省略号。 */
function wrapTextLines(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines: number,
): string[] {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (!normalized) return [];

	const tokens = segmentText(normalized, "word").flatMap((token) =>
		ctx.measureText(token).width > maxWidth
			? segmentText(token, "grapheme")
			: [token],
	);
	const lines: string[] = [];
	let currentLine = "";
	let truncated = false;

	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];
		const candidate = currentLine + token;
		if (ctx.measureText(candidate).width <= maxWidth) {
			currentLine = candidate;
			continue;
		}

		if (currentLine) {
			lines.push(currentLine.trimEnd());
			if (lines.length === maxLines) {
				truncated = true;
				break;
			}
		}
		currentLine = token.trimStart();
	}

	if (!truncated && currentLine && lines.length < maxLines) {
		lines.push(currentLine.trimEnd());
	}

	if (truncated && lines.length > 0) {
		const ellipsis = "\u2026";
		let lastLine = lines[lines.length - 1];
		while (
			lastLine &&
			ctx.measureText(`${lastLine}${ellipsis}`).width > maxWidth
		) {
			lastLine = segmentText(lastLine, "grapheme").slice(0, -1).join("");
		}
		lines[lines.length - 1] = `${lastLine.trimEnd()}${ellipsis}`;
	}

	return lines;
}

function drawCoverBackground(
	ctx: CanvasRenderingContext2D,
	image: CanvasImageSource,
	width: number,
	height: number,
) {
	const dimensions = image as { width?: number; height?: number };
	const imageWidth = Number(dimensions.width) || width;
	const imageHeight = Number(dimensions.height) || height;
	const imageAspect = imageWidth / imageHeight;
	const targetAspect = width / height;

	let sourceX = 0;
	let sourceY = 0;
	let sourceWidth = imageWidth;
	let sourceHeight = imageHeight;
	if (imageAspect > targetAspect) {
		sourceWidth = imageHeight * targetAspect;
		sourceX = (imageWidth - sourceWidth) / 2;
	} else {
		sourceHeight = imageWidth / targetAspect;
		sourceY = (imageHeight - sourceHeight) / 2;
	}

	ctx.drawImage(
		image,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		0,
		0,
		width,
		height,
	);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error("Canvas toBlob returned null"));
		}, "image/png");
	});
}

/** 生成固定比例 (16:9) 的社交分享海报（Telegram / Web）。 */
export async function generateSharePoster(
	input: SharePosterInput,
): Promise<Blob> {
	if (input.signal?.aborted) {
		throw new DOMException("Poster generation aborted", "AbortError");
	}

	if (typeof document !== "undefined" && document.fonts) {
		try {
			await document.fonts.ready;
		} catch {
			// 系统字体回退仍可完成绘制。
		}
	}

	const coverImage = await loadDrawableImage(input.coverUrl, input.signal);

	try {
		if (input.signal?.aborted) {
			throw new DOMException("Poster generation aborted", "AbortError");
		}

		const canvas = document.createElement("canvas");
		canvas.width = SHARE_POSTER_WIDTH;
		canvas.height = SHARE_POSTER_HEIGHT;

		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Unable to create 2d canvas context");

		// 1. Отрисовка фона: обложка статьи или темный премиальный фон
		if (coverImage) {
			drawCoverBackground(ctx, coverImage.source, canvas.width, canvas.height);
			// Глубокое затемнение: многослойный оверлей для идеальной читаемости текста поверх фото
			ctx.fillStyle = "rgba(12, 13, 16, 0.72)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Мягкий градиент снизу вверх для контраста футера
			const bottomGradient = ctx.createLinearGradient(
				0,
				canvas.height - 240,
				0,
				canvas.height,
			);
			bottomGradient.addColorStop(0, "rgba(8, 9, 12, 0)");
			bottomGradient.addColorStop(1, "rgba(8, 9, 12, 0.65)");
			ctx.fillStyle = bottomGradient;
			ctx.fillRect(0, canvas.height - 240, canvas.width, 240);
		} else {
			// Если обложки нет — градиентный темный фон
			const bgGradient = ctx.createLinearGradient(
				0,
				0,
				canvas.width,
				canvas.height,
			);
			bgGradient.addColorStop(0, "#16171d");
			bgGradient.addColorStop(0.5, "#101116");
			bgGradient.addColorStop(1, "#0a0b0e");
			ctx.fillStyle = bgGradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		// 2. Верхняя строка: дата публикации (полупрозрачный белый цвет)
		const dateY = PAGE_PADDING_Y + 10;
		if (input.published) {
			ctx.font = `500 ${DATE_FONT_SIZE}px ${FONT_FAMILY}`;
			ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
			ctx.textBaseline = "top";
			ctx.textAlign = "left";
			ctx.fillText(input.published, PAGE_PADDING_X, dateY);
		}

		// 3. Расчет текста: Заголовок и Описание
		ctx.font = `800 ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
		const titleLines = wrapTextLines(
			ctx,
			input.title || input.siteTitle,
			CONTENT_WIDTH,
			3,
		);
		const titleBlockHeight = titleLines.length * TITLE_LINE_HEIGHT;

		const cleanDesc =
			input.description && input.description.trim() !== input.title.trim()
				? input.description.trim()
				: "";

		ctx.font = `400 ${DESCRIPTION_FONT_SIZE}px ${FONT_FAMILY}`;
		const maxDescLines = titleLines.length > 2 ? 2 : 3;
		const descLines = cleanDesc
			? wrapTextLines(ctx, cleanDesc, CONTENT_WIDTH, maxDescLines)
			: [];
		const descBlockHeight =
			descLines.length > 0
				? descLines.length * DESCRIPTION_LINE_HEIGHT + 24
				: 0;

		const totalCenterHeight = titleBlockHeight + descBlockHeight;
		// Размещение центральной части с гармоничным отступом от даты
		const availableAreaTop = dateY + DATE_FONT_SIZE + 36;
		const availableAreaBottom =
			canvas.height - PAGE_PADDING_Y - FOOTER_FONT_SIZE - 40;
		const availableCenterY =
			(availableAreaTop + availableAreaBottom - totalCenterHeight) / 2;
		const contentTopY = Math.max(availableAreaTop, availableCenterY);

		// 4. Отрисовка заголовка (чистый яркий белый цвет)
		ctx.font = `800 ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`;
		ctx.fillStyle = "#ffffff";
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		titleLines.forEach((line, index) => {
			ctx.fillText(
				line,
				PAGE_PADDING_X,
				contentTopY + index * TITLE_LINE_HEIGHT,
			);
		});

		// 5. Отрисовка описания (мягкий светло-серый цвет)
		if (descLines.length > 0) {
			const descStartY = contentTopY + titleBlockHeight + 24;
			ctx.font = `400 ${DESCRIPTION_FONT_SIZE}px ${FONT_FAMILY}`;
			ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
			ctx.textBaseline = "top";
			ctx.textAlign = "left";
			descLines.forEach((line, index) => {
				ctx.fillText(
					line,
					PAGE_PADDING_X,
					descStartY + index * DESCRIPTION_LINE_HEIGHT,
				);
			});
		}

		// 6. Нижняя строка:
		// Слева: Имя автора (Javohir)
		// Справа: Домен сайта (например, nullvert.uz)
		const footerY = canvas.height - PAGE_PADDING_Y;
		ctx.font = `600 ${FOOTER_FONT_SIZE}px ${FONT_FAMILY}`;
		ctx.textBaseline = "bottom";

		// Автор слева
		const authorText = input.author || "Javohir";
		ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
		ctx.textAlign = "left";
		ctx.fillText(authorText, PAGE_PADDING_X, footerY);

		// Домен сайта справа (nullvert.uz)
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.textAlign = "right";
		ctx.fillText("nullvert.uz", canvas.width - PAGE_PADDING_X, footerY);

		return await canvasToBlob(canvas);
	} finally {
		coverImage?.close?.();
	}
}
