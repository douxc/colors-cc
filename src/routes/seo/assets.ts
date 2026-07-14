import { Hono } from 'hono'
import { htmlLang, localizedPath, type SiteConfig } from '../../site'

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="colors-cc">
  <defs>
    <linearGradient id="spectrum" x1="8" y1="56" x2="56" y2="8" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5EE7F7" />
      <stop offset="0.52" stop-color="#A78BFA" />
      <stop offset="1" stop-color="#F472B6" />
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#spectrum)" />
  <rect x="12" y="12" width="40" height="40" rx="11" fill="#111827" fill-opacity="0.88" />
  <circle cx="25" cy="32" r="7" fill="#5EE7F7" />
  <circle cx="39" cy="32" r="7" fill="#F472B6" />
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
