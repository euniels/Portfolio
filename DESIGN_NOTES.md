# Design notes

## Design direction

I read `.codex/skills/frontend-design/SKILL.md` before writing code. Its guidance shaped the site in three concrete ways: the hero has one memorable interaction, the section layouts tell the story without a generic card grid, and motion responds to scroll rather than running for decoration. The current hero pairs the student's headline and actions with an interactive water-shaped portrait. Three plain, curved wave layers rise with the About section, borrowing the staggered heights of [Jack Elder's portfolio](https://www.jackelder.design/) without copying its square transition. The waves move from light mint through muted blue to the About section's sea-blue.

The intended audience is an OJT recruiter or engineering mentor. The work should be quick to scan before opening a case study. The hero keeps its two-column layout over a single warm cream color, `#F3F2EC`, with a few quiet circles from the existing palette. The Expertise pool, project rows, journey, seminar, and contact sections remain in their established order.

## Type and color

Newsreader is the display face; Instrument Sans handles body copy and controls. Both are manually downloaded Google Fonts, self-hosted in `public/fonts` with their SIL Open Font License files. No `@fontsource` package or runtime font CDN is used.

The page uses navy `#131B2B`, deep blue `#2F4A63`, sea blue `#5B91A3`, and mint `#CFEAE0`. The hero is cream; the blue palette enters at the waves. A thin navy stroke keeps the organic photo boundary legible against the cream, with a pastel wash at its edges.

## Motion and accessibility

The portrait is one inline SVG containing the existing `src/images/pic.png`, a spring-driven clipping path, the matching outline and shadow, and a pointer hit area. It renders its resting shape immediately. IntersectionObserver pauses its requestAnimationFrame loop off-screen and resumes the retained point positions, velocities, and float phase with a clamped delta. Vertical touch swipes scroll normally; horizontal swipes on the portrait drag it. A keyboard-operable Nudge blob button provides another way to move it. The SVG has an accessible name, while the person's name and role remain real HTML. Reduced motion removes the ripples and leaves only a tiny, slow float.

The hero sits in a sticky stage while three SVG waves rise one after another over it. Their flat fills extend beneath each curved edge, so the final sea-blue layer fully covers the stage before the About section scrolls up from below. A passive scroll listener schedules direct SVG transform updates in one animation frame; React state does not update on scroll. On narrow screens the complete hero can be seen before pinning starts. Reduced motion replaces the pinned transition with a static curved divider. The pool keeps its own physics, ripple interaction, and readable DOM skill list.

## Earlier research and page structure

Earlier concepts consulted [Matter.js constraints](https://brm.io/matter-js/docs/classes/Constraint.html), [composites](https://brm.io/matter-js/docs/classes/Composite.html), [mouse constraint](https://brm.io/matter-js/docs/classes/MouseConstraint.html), and [Vercel's Ship badge article](https://vercel.com/blog/building-an-interactive-3d-event-badge-with-react-three-fiber). The current portrait uses its own small spring simulation; Three.js is no longer needed by the site.

PioneerPath, PitchPond, and SARIPH POS each have a separate HTML entry with their own build-time `<title>` and meta description from `src/data/portfolio.js`. Recurra is retained in source but excluded from the build until it is ready. Unknown links remain visibly marked. No analytics, tracking, external scripts, or secrets are part of this build.
