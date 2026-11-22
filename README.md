# OJT portfolio

A static React/Vite portfolio with three project pages, an interactive SVG water portrait, and a pool of floating skills.

## Run locally

Vite requires Node.js 20.19+ or 22.12+; the local machine has Node.js 24.14.0. On this Windows PowerShell setup, use `npm.cmd` because `npm.ps1` is blocked by the local execution policy.

1. Run `npm.cmd ci` in this folder to install the exact versions from `package-lock.json`.
2. Run `npm.cmd audit`, then `npm.cmd run dev`.
3. Run `npm.cmd run build` and `npm.cmd run preview` to check the production output.

The site has no analytics or third-party scripts. Fonts are self-hosted.

## Edit content

Change text, skills, project entries, links, placeholders, and SEO fields in `src/data/portfolio.js`. Build-time metadata for the home and each project page is read from that file.

The SARIPH POS case study describes a local team project. Its research notes and run instructions are in `docs/sariph-pos-research.md`; its carousel contains a real local login capture and a source-verified architecture diagram. PioneerPath uses five demo screenshots stored in `public/images/pioneerpath/`. PitchPond uses four screenshots captured from the public prototype; numbers and prices shown in that demo UI are illustrative. Each project's `gallery` array in `src/data/portfolio.js` controls its carousel; add or remove entries there and the dots update automatically. Recurra's project data and placeholder are retained in the repository but hidden until the project is ready.

Before sharing the site, set `[SITE URL FOR SEO/OG IMAGE]` after deployment. The resume is intentionally not published because the current PDF contains private contact details and an older project entry.

Missing links are shown as pending text instead of broken anchors. Until `seo.siteUrl` is filled, the build omits absolute canonical and Open Graph image URLs.

## Hero portrait

The interactive SVG portrait uses `src/images/pic.png`. Replace that file to update the photo.

## Deploy to Vercel

Import this folder as a Vite project, use `npm run build` as the build command if setting it manually on Vercel, and serve `dist` as the output directory. `vercel.json` maps clean case-study URLs to their separate static HTML files. After deployment, set `seo.siteUrl` in the data file and rebuild so canonical and Open Graph image URLs become absolute.

The optional GitHub Pages path needs a base-path adjustment and different routing for clean project URLs; the initial release targets Vercel.

## Fonts

`public/fonts/instrument-sans-latin.woff2` and `public/fonts/newsreader-latin.woff2` are manually downloaded from Google Fonts' own font CDN using the official Google Fonts CSS endpoint. Their source URLs and the SIL Open Font License files are recorded in `public/fonts/README.md`. No `@fontsource` package is installed.
