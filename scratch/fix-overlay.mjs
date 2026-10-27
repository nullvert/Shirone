import fs from "fs";

const file = "src/components/molecules/MediaCardOverlay.svelte";
let s = fs.readFileSync(file, "utf8");

const target = `:global(.media-card--title-on-poster)`;
const idx = s.indexOf(target);
if (idx === -1) {
  console.error("target not found");
  process.exit(1);
}

const newStyles = `:global(.media-card--title-on-poster)
\t.media-card__overlay
\t\topacity: 1
\t\tpointer-events: auto
\t\tbackground: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 28%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.82) 70%, rgba(6, 6, 8, 0.96) 88%, #060608 100%)
\t\ttransition: background var(--m3e-duration-long) var(--m3e-easing-standard)

\t\t.media-card__overlay-title,
\t\t.media-card__overlay-meta
\t\t\ttransform: none
\t\t\topacity: 1
\t\t\ttransition: none

\t\t.media-card__overlay-details
\t\t\tdisplay: grid
\t\t\tgrid-template-rows: 0fr
\t\t\topacity: 0
\t\t\tpointer-events: none
\t\t\ttransition:
\t\t\t\tgrid-template-rows var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate),
\t\t\t\topacity var(--m3e-duration-medium) var(--m3e-easing-standard)

\t\t.media-card__overlay-details-inner
\t\t\tmin-height: 0
\t\t\toverflow: hidden
\t\t\twill-change: transform
\t\t\ttransform: translate3d(0, 4px, 0)
\t\t\topacity: 0
\t\t\ttransition:
\t\t\t\ttransform var(--m3e-duration-long) var(--m3e-easing-emphasized-decelerate),
\t\t\t\topacity var(--m3e-duration-medium) var(--m3e-easing-standard)

:global(.media-card--title-on-poster:hover),
:global(.media-card--title-on-poster.media-card--hovered)
\t.media-card__overlay
\t\tbackground: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.78) 30%, rgba(0, 0, 0, 0.94) 75%, #060608 100%)

\t\t.media-card__overlay-details
\t\t\tgrid-template-rows: 1fr
\t\t\topacity: 1
\t\t\tpointer-events: auto

\t\t.media-card__overlay-details-inner
\t\t\ttransform: translate3d(0, 0, 0)
\t\t\topacity: 1
</style>
`;

s = s.slice(0, idx) + newStyles;
fs.writeFileSync(file, s, "utf8");
console.log("Successfully fixed MediaCardOverlay.svelte");
