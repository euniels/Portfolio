import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { portfolio } from './src/data/portfolio.js'

// Add 'recurra' back when its case study is ready to publish.
const pages = ['pioneerpath', 'pitchpond', 'sariph-pos']

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function portfolioMetadata() {
  return {
    name: 'portfolio-metadata',
    transformIndexHtml(html, context) {
      const filename = context.filename.replaceAll('\\', '/')
      const project = portfolio.projects.find(({ slug }) => filename.endsWith(`/projects/${slug}/index.html`))
      const title = project ? project.seo.title : portfolio.seo.title
      const description = project ? project.seo.description : portfolio.seo.description
      const route = project ? `/projects/${project.slug}` : '/'
      const siteUrl = portfolio.seo.siteUrl
      const hasSiteUrl = siteUrl && !siteUrl.startsWith('[')
      const head = [
        `<meta name="description" content="${escapeAttribute(description)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:title" content="${escapeAttribute(title)}" />`,
        `<meta property="og:description" content="${escapeAttribute(description)}" />`,
      ]

      if (hasSiteUrl) {
        const canonical = new URL(route, siteUrl).href
        head.push(`<link rel="canonical" href="${escapeAttribute(canonical)}" />`)
        head.push(`<meta property="og:url" content="${escapeAttribute(canonical)}" />`)
        head.push(`<meta property="og:image" content="${escapeAttribute(new URL('/og-card.svg', siteUrl).href)}" />`)
      }

      return html
        .replace('<title>Portfolio</title>', `<title>${escapeAttribute(title)}</title>`)
        .replace('<!--SEO_HEAD-->', head.join('\n    '))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), portfolioMetadata()],
  input: {
    home: resolve(import.meta.dirname, 'index.html'),
    ...Object.fromEntries(pages.map((slug) => [slug, resolve(import.meta.dirname, `projects/${slug}/index.html`)])),
  },
})
