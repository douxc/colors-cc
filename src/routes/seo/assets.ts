import { Hono } from 'hono'
import { htmlLang, localizedPath, type SiteConfig } from '../../site'

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="colors-cc" data-brand-mark="canvas-pair">
  <style>
    .generate { fill: #087f8c; }
    .prepare { fill: #fffefa; stroke: #1d1d1f; }
    .extension { stroke: #1d1d1f; }
    @media (prefers-color-scheme: dark) {
      .generate { fill: #62d5df; }
      .prepare { fill: #101011; stroke: #f5f5f7; }
      .extension { stroke: #f5f5f7; }
    }
  </style>
  <rect data-layer="generate" class="generate" x="5" y="9" width="36" height="36" rx="9" />
  <rect data-layer="prepare" class="prepare" x="24" y="20" width="32" height="32" rx="7" stroke-width="4" />
  <path data-extension="right" class="extension" d="M52 30h10" fill="none" stroke-width="4" />
  <path data-extension="bottom" class="extension" d="M46 46v12" fill="none" stroke-width="4" />
</svg>`

export const createSeoAssetsRoute = (config: SiteConfig): Hono => {
  const app = new Hono()

  app.get('/favicon.svg', (c) => {
    c.header('Content-Type', 'image/svg+xml; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=604800')
    return c.body(favicon)
  })

  app.get('/site.webmanifest', (c) => {
    const manifest = {
      name: 'colors-cc',
      short_name: 'colors-cc',
      description: config.defaultLocale === 'zh'
        ? '面向用户和 AI 智能体的色彩工具。'
        : 'Color tools for humans and AI agents.',
      lang: htmlLang(config.defaultLocale),
      start_url: localizedPath(config.defaultLocale, '/'),
      scope: '/',
      display: 'standalone',
      background_color: '#f7f9fc',
      theme_color: '#7456d8',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    }

    c.header('Content-Type', 'application/manifest+json; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(JSON.stringify(manifest))
  })

  return app
}
