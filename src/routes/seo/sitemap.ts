import { Hono } from 'hono'
import { localizedUrl, type Locale, type SiteConfig } from '../../site'

export const PAGE_PATHS = [
  '/',
  '/tools/converter',
  '/tools/hex-to-rgb',
  '/tools/hex-to-hsl',
  '/tools/hex-to-cmyk',
  '/tools/rgb-to-hex',
  '/tools/rgb-to-hsl',
  '/tools/rgb-to-cmyk',
  '/tools/hsl-to-hex',
  '/tools/hsl-to-rgb',
  '/tools/hsl-to-cmyk',
  '/tools/cmyk-to-hex',
  '/tools/cmyk-to-rgb',
  '/tools/cmyk-to-hsl',
  '/tools/random-palette',
  '/tools/color-names',
  '/tools/fluid-placeholder',
  '/tools/image-compress'
] as const

const escapeXml = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')

const renderUrl = (config: SiteConfig, locale: Locale, path: string): string => {
  const loc = localizedUrl(config.origin, locale, path)
  const priority = path === '/' ? '1.0' : '0.8'
  const frequency = path === '/' ? 'daily' : 'weekly'
  return `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(localizedUrl(config.origin, 'en', path))}" />
    <xhtml:link rel="alternate" hreflang="zh" href="${escapeXml(localizedUrl(config.origin, 'zh', path))}" />
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export const createSitemapRoute = (config: SiteConfig): Hono => {
  const app = new Hono()

  app.get('/sitemap.xml', (c) => {
    const urls = (['en', 'zh'] as const)
      .flatMap(locale => PAGE_PATHS.map(path => renderUrl(config, locale, path)))
      .join('\n')
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`
    c.header('Content-Type', 'text/xml')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(xml)
  })

  return app
}
