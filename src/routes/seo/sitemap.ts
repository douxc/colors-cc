import { Hono } from 'hono'
import {
  hreflangAlternates,
  localizedUrl,
  type Locale,
  type SiteConfig
} from '../../site'

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

export const SITEMAP_LAST_MODIFIED = '2026-07-29'

const escapeXml = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')

const renderUrl = (config: SiteConfig, locale: Locale, path: string): string => {
  const loc = localizedUrl(config.origin, locale, path)
  const priority = path === '/' ? '1.0' : path === '/tools/image-compress' ? '0.9' : '0.8'
  const frequency = path === '/' ? 'daily' : 'weekly'
  const alternates = hreflangAlternates(path)
    .map(({ hreflang, href }) =>
      `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`)
    .join('\n')
  return `  <url>
    <loc>${loc}</loc>
${alternates}
    <mobile:mobile type="pc,mobile" />
    <lastmod>${SITEMAP_LAST_MODIFIED}</lastmod>
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

const sitemapUrls = (config: SiteConfig): string[] => (['en', 'zh'] as const)
  .filter(locale => config.enabledLocales.includes(locale))
  .flatMap(locale => PAGE_PATHS.map(path => localizedUrl(config.origin, locale, path)))

export const createSitemapRoute = (config: SiteConfig): Hono => {
  const app = new Hono()

  app.get('/sitemap.xml', (c) => {
    const urls = config.enabledLocales
      .flatMap(locale => PAGE_PATHS.map(path => renderUrl(config, locale, path)))
      .join('\n')
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.baidu.com/schemas/sitemap-mobile/1/">
${urls}
</urlset>`
    c.header('Content-Type', 'application/xml; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(xml)
  })

  app.get('/sitemap.txt', (c) => {
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(`${sitemapUrls(config).join('\n')}\n`)
  })

  return app
}
