import { describe, it, expect } from 'vitest'
import { createApp } from './app'
import app from './index'
import imageCompressTemplate from './pages/image-compress.html'
import { PAGE_PATHS } from './routes/seo/sitemap'
import { cnSiteConfig, globalSiteConfig, localizedUrl } from './site'
import homeTemplate from './templates/home.html'

const cnApp = createApp(cnSiteConfig, {
  home: homeTemplate,
  imageCompress: imageCompressTemplate
})

const verificationApp = createApp({
  ...globalSiteConfig,
  verificationMeta: {
    'google-site-verification': 'google-code',
    'baidu-site-verification': 'baidu-code',
    '360-site-verification': '360-code',
    'bytedance-verification-code': 'bytedance-code'
  }
}, {
  home: homeTemplate,
  imageCompress: imageCompressTemplate
})

const expectValidInlineScripts = (html: string): void => {
  const scripts = html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)
  for (const script of scripts) {
    expect(() => new Function(script[1])).not.toThrow()
  }
}

describe('colors-cc Frontend', () => {
  describe('Documentation Routes', () => {
    it('should serve /openapi.json', async () => {
      const res = await app.request('/openapi.json')
      expect(res.status).toBe(200)
      expect(res.headers.get('Cache-Control')).toContain('max-age=86400')
      
      const spec = await res.json() as { openapi: string; info: { title: string }; paths: Record<string, unknown>; servers: Array<{ url: string }> }
      expect(spec.openapi).toBe('3.0.0')
      expect(spec.info.title).toBe('colors-cc API')
      expect(spec.paths).toHaveProperty('/random')
      expect(spec.paths).toHaveProperty('/palette')
      expect(spec.paths).toHaveProperty('/convert')
      expect(spec.paths).toHaveProperty('/placeholder')
      expect(spec.paths).toHaveProperty('/fluid-placeholder')
      expect(spec.servers).toHaveLength(1)
      expect(spec.servers[0].url).toBe('https://api.colors-cc.top')

      const placeholder = spec.paths['/placeholder'] as {
        get: { operationId: string; parameters: Array<{ name: string }> }
      }
      expect(placeholder.get.operationId).toBe('generatePlaceholder')
      expect(placeholder.get.parameters.map(parameter => parameter.name)).toContain('palette')
    })

    it('should serve /llms.txt', async () => {
      const res = await app.request('/llms.txt')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      expect(res.headers.get('Cache-Control')).toContain('max-age=86400')
      
      const text = await res.text()
      expect(text).toContain('colors-cc.top')
      expect(text).toContain('https://api.colors-cc.top/placeholder')
      expect(text).toContain('ENCODE HEX COLORS')
    })

    it('should serve /skills/colors-cc.md', async () => {
      const res = await app.request('/skills/colors-cc.md')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/markdown')
      expect(res.headers.get('Cache-Control')).toContain('max-age=86400')
      
      const text = await res.text()
      expect(text).toContain('SKILL: ColorsCC')
      expect(text).toContain('https://api.colors-cc.top')
      expect(text).toContain('palette=%23FF003C,%2300B8FF')
      expect(text).not.toContain('stops=')
      expect(text).not.toContain('start=')
    })
  })

  describe('SEO Routes', () => {
    it('should serve /robots.txt', async () => {
      const res = await app.request('/robots.txt')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      
      const text = await res.text()
      expect(text).toContain('User-agent: *')
      expect(text).toContain('User-agent: Googlebot')
      expect(text).toContain('User-agent: Baiduspider')
      expect(text).toContain('User-agent: 360Spider')
      expect(text).toContain('User-agent: Bytespider')
      expect(text).toContain('Allow: /')
      expect(text).toContain('Sitemap: https://colors-cc.top/sitemap.xml')
      expect(text).toContain('Sitemap: https://colors-cc.top/sitemap.txt')
    })

    it('should serve /sitemap.xml', async () => {
      const res = await app.request('/sitemap.xml')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('application/xml')
      
      const xml = await res.text()
      expect(xml).toContain('<?xml version="1.0"')
      expect(xml).toContain('<urlset')
      expect(xml.match(/<url>/g)).toHaveLength(PAGE_PATHS.length * 2)
      expect(xml).toContain('https://colors-cc.top/en')
      expect(xml).toContain('https://colors-cc.top/zh')
      expect(xml).toContain('https://colors-cc.top/en/tools/converter')
      expect(xml).toContain('https://colors-cc.top/zh/tools/random-palette')
      expect(xml).toContain('hreflang="en"')
      expect(xml).toContain('hreflang="zh-Hans"')
      expect(xml).not.toContain('hreflang="en-CN"')
      expect(xml).toContain('hreflang="zh-CN"')
      expect(xml).toContain('hreflang="x-default"')
      expect(xml).toContain('https://www.colors-cc.top/zh/tools/converter')
      expect(xml.match(/<mobile:mobile type="pc,mobile" \/>/g)).toHaveLength(PAGE_PATHS.length * 2)
      expect(xml.match(/<lastmod>2026-07-14<\/lastmod>/g)).toHaveLength(PAGE_PATHS.length * 2)
    })

    it('should serve a plain-text sitemap fallback', async () => {
      const res = await app.request('/sitemap.txt')
      const urls = (await res.text()).trim().split('\n')

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      expect(urls).toHaveLength(PAGE_PATHS.length * 2)
      expect(urls).toContain('https://colors-cc.top/en/tools/converter')
      expect(urls).toContain('https://colors-cc.top/zh/tools/image-compress')
    })

    it('should serve stable favicon and web manifest assets', async () => {
      const [iconResponse, manifestResponse] = await Promise.all([
        app.request('/favicon.svg'),
        app.request('/site.webmanifest')
      ])
      const [icon, manifest] = await Promise.all([
        iconResponse.text(),
        manifestResponse.json() as Promise<{ name: string; start_url: string; icons: unknown[] }>
      ])

      expect(iconResponse.status).toBe(200)
      expect(iconResponse.headers.get('Content-Type')).toContain('image/svg+xml')
      expect(icon).toContain('<svg')
      expect(manifestResponse.status).toBe(200)
      expect(manifestResponse.headers.get('Content-Type')).toContain('application/manifest+json')
      expect(manifest.name).toBe('colors-cc')
      expect(manifest.start_url).toBe('/en')
      expect(manifest.icons).toHaveLength(1)
    })
  })

  describe('Tool Pages', () => {
    it('should render /tools/converter', async () => {
      const res = await app.request('/tools/converter')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      
      const html = await res.text()
      expect(html).toContain('Universal color converter')
      expect(html).toContain('Synchronized values')
      expect(html).toContain('<link rel="canonical"')
      expect(html).toContain('og:title')
    })

    it('should render /tools/random-palette', async () => {
      const res = await app.request('/tools/random-palette')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('Curated palette generator')
      expect(html).toContain('palette-display')
      expect(html).toContain('role="status"')
    })

    it('should render /tools/color-names', async () => {
      const res = await app.request('/tools/color-names')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('CSS color atlas')
      expect(html).toContain('type="search"')
    })

    it('should render /tools/fluid-placeholder', async () => {
      const res = await app.request('/tools/fluid-placeholder')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('Fluid SVG studio')
      expect(html).toContain('palette=')
      expect(html).not.toContain('stops=')
    })

    it('should render the browser-only image studio', async () => {
      const res = await app.request('/tools/image-compress')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')

      const html = await res.text()
      expect(html).toContain('Image compression, layout, and watermarking')
      expect(html).toContain('data-mode="fan"')
      expect(html).toContain('data-mode="watermark"')
      expect(html).toContain('data-mode="compress"')
      expect(html).toContain('aria-current="page">Image tools</a>')
      expect(html).not.toContain('fetch(')
      expect(html).not.toContain('__SHARED_STYLES__')
    })

    it('should return 404 for invalid tool route', async () => {
      const res = await app.request('/tools/invalid-tool')
      expect(res.status).toBe(404)
    })

    it('should render /tools/hex-to-rgb', async () => {
      const res = await app.request('/tools/hex-to-rgb')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('HEX to RGB converter')
    })

    it('should return 404 for invalid conversion route', async () => {
      const res = await app.request('/tools/invalid-to-invalid')
      expect(res.status).toBe(404)
    })
  })

  describe('Homepage', () => {
    it('should render /', async () => {
      const res = await app.request('/')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      
      const html = await res.text()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('colors-cc')
      expect(html).toContain('Color workbench')
      expect(html).toContain('Agent prompt')
      expect(html).toContain('aria-label="Placeholder controls"')
      expect(html).toContain('/tools/image-compress')
      expect(html).not.toContain('__COLOR_API_CONTRACT__')
    })
  })

  describe('Bilingual pages', () => {
    it('should render localized homepages with stable language URLs', async () => {
      const [englishResponse, chineseResponse] = await Promise.all([
        app.request('/en'),
        app.request('/zh')
      ])
      const [english, chinese] = await Promise.all([
        englishResponse.text(),
        chineseResponse.text()
      ])

      expect(englishResponse.status).toBe(200)
      expect(english).toContain('<html lang="en">')
      expect(english).toContain('Build in color.')
      expect(english).toContain('href="/zh"')
      expect(english).toContain('aria-label="Simplified Chinese"')
      expect(english).toContain('https://colors-cc.top/en')

      expect(chineseResponse.status).toBe(200)
      expect(chinese).toContain('<html lang="zh-CN">')
      expect(chinese).toContain('用色彩构建。')
      expect(chinese).toContain('--leading-hero: 1.18;')
      expect(chinese).toContain('line-height: var(--leading-hero);')
      expect(chinese).toContain('href="/en"')
      expect(chinese).toContain('aria-label="英文"')
      expect(chinese).toContain('https://colors-cc.top/zh')
      expect(chinese).toContain('const animatedEffects')
      expect(chinese).toContain('id="customPalette"')
      expect(chinese).not.toContain('animated效果')
      expect(chinese).not.toContain('custom配色')
    })

    it('should render both languages for tool pages', async () => {
      const [englishResponse, chineseResponse, chineseImageResponse] = await Promise.all([
        app.request('/en/tools/converter'),
        app.request('/zh/tools/converter'),
        app.request('/zh/tools/image-compress')
      ])
      const [english, chinese, chineseImage] = await Promise.all([
        englishResponse.text(),
        chineseResponse.text(),
        chineseImageResponse.text()
      ])

      expect(english).toContain('Universal color converter')
      expect(english).toContain('href="/zh/tools/converter"')
      expect(chinese).toContain('通用颜色转换器')
      expect(chinese).toContain('href="/en/tools/converter"')
      expect(chinese).toContain('转换完成 · 所有颜色格式已同步')
      expect(chinese).toContain('正在转换 ')
      expect(chinese).toContain('输入的内容不是有效的 ')
      expect(chinese).not.toContain("'Converting '")
      expect(chinese).not.toContain("'That value is not a valid '")
      expect(chineseImage).toContain('图片压缩、排列与水印')
    })

    it('should switch languages on the same valid path across every page', async () => {
      for (const path of PAGE_PATHS) {
        const suffix = path === '/' ? '' : path
        const englishPath = `/en${suffix}`
        const chinesePath = `/zh${suffix}`
        const [englishResponse, chineseResponse] = await Promise.all([
          app.request(englishPath),
          app.request(chinesePath)
        ])
        const [english, chinese] = await Promise.all([
          englishResponse.text(),
          chineseResponse.text()
        ])

        expect(englishResponse.status, englishPath).toBe(200)
        expect(chineseResponse.status, chinesePath).toBe(200)
        expect(english, englishPath).toContain(`href="${chinesePath}"`)
        expect(english, englishPath).toContain('aria-label="Simplified Chinese"')
        expect(chinese, chinesePath).toContain(`href="${englishPath}"`)
        expect(chinese, chinesePath).toContain('aria-label="英文"')
      }
    })

    it('should publish reciprocal cross-domain hreflang links', async () => {
      const html = await (await app.request('/zh/tools/converter')).text()

      expect(html).toContain('hreflang="en" href="https://colors-cc.top/en/tools/converter"')
      expect(html).toContain('hreflang="zh-CN" href="https://www.colors-cc.top/zh/tools/converter"')
      expect(html).not.toContain('hreflang="en-CN"')
      expect(html).toContain('hreflang="x-default"')
    })

    it('should preserve valid scripts after Chinese localization', async () => {
      const paths = ['/zh', '/zh/tools/random-palette', '/zh/tools/fluid-placeholder']

      for (const path of paths) {
        const html = await (await app.request(path)).text()
        expectValidInlineScripts(html)
      }
    })

    it('should apply language-aware readable typography to every localized page', async () => {
      for (const locale of ['en', 'zh'] as const) {
        for (const path of PAGE_PATHS) {
          const requestPath = `/${locale}${path === '/' ? '' : path}`
          const response = await app.request(requestPath)
          const html = await response.text()

          expect(response.status, requestPath).toBe(200)
          expect(html, requestPath).toContain(`<html lang="${locale === 'zh' ? 'zh-CN' : 'en'}">`)
          expect(html, requestPath).toContain('--leading-body: 1.62;')
          expect(html, requestPath).toContain('--leading-copy: 1.68;')
          expect(html, requestPath).toContain('html[lang="zh-CN"] {')
          expect(html, requestPath).toContain('--leading-body: 1.75;')
          expect(html, requestPath).toContain('--leading-copy: 1.8;')
          expect(html, requestPath).toContain('--leading-display: 1.2;')
          expect(html, requestPath).toContain('line-height: var(--leading-body);')
          expect(html, requestPath).toContain('line-height: var(--leading-display);')
          expect(html, requestPath).toContain('line-height: var(--leading-copy);')
          expect(html, requestPath).not.toContain('line-height: .86;')
          expect(html, requestPath).not.toContain('line-height: .98;')
        }
      }
    })
  })

  describe('Search engine metadata', () => {
    it('should render complete, unique SEO metadata on every localized page and deployment', async () => {
      const deployments = [
        { app, config: globalSiteConfig },
        { app: cnApp, config: cnSiteConfig }
      ]

      for (const deployment of deployments) {
        for (const locale of deployment.config.enabledLocales) {
          const titles = new Set<string>()
          const descriptions = new Set<string>()

          for (const path of PAGE_PATHS) {
            const suffix = path === '/' ? '' : path
            const requestPath = `/${locale}${suffix}`
            const response = await deployment.app.request(requestPath)
            const html = await response.text()
            const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
            const description = html.match(
              /<meta name="description" content="([^"]+)"/
            )?.[1]
            const structuredDataMatch = html.match(
              /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
            )

            expect(response.status, requestPath).toBe(200)
            expect(title, requestPath).toBeTruthy()
            expect(title?.length, requestPath).toBeLessThanOrEqual(60)
            expect(description, requestPath).toBeTruthy()
            expect(description?.length, requestPath).toBeLessThanOrEqual(180)
            titles.add(title as string)
            descriptions.add(description as string)
            expect(html.match(/rel="canonical"/g), requestPath).toHaveLength(1)
            expect(html, requestPath).toContain(
              `<link rel="canonical" href="${localizedUrl(deployment.config.origin, locale, path)}"`
            )
            expect(html, requestPath).toContain('hreflang="en"')
            expect(html, requestPath).toContain('hreflang="zh-Hans"')
            expect(html, requestPath).not.toContain('hreflang="en-CN"')
            expect(html, requestPath).toContain('hreflang="zh-CN"')
            expect(html, requestPath).toContain('hreflang="x-default"')
            expect(html, requestPath).toContain('name="applicable-device" content="pc,mobile"')
            expect(html, requestPath).toContain('name="Baiduspider" content="index, follow"')
            expect(html, requestPath).toContain('max-image-preview:large')
            expect(html, requestPath).toContain(`property="og:locale" content="${locale === 'zh' ? 'zh_CN' : 'en_US'}"`)
            expect(html, requestPath).toContain('property="og:image:width" content="1200"')
            expect(html, requestPath).toContain('property="og:image:height" content="630"')
            expect(html, requestPath).toContain('property="og:image:alt"')
            expect(html, requestPath).toContain('name="twitter:image:alt"')
            expect(html, requestPath).toContain('rel="sitemap" type="application/xml"')
            expect(html, requestPath).toContain('rel="icon" type="image/svg+xml"')
            expect(html, requestPath).toContain('rel="manifest"')
            expect(structuredDataMatch, requestPath).toBeTruthy()

            const structuredData = JSON.parse(structuredDataMatch?.[1] ?? '{}') as {
              '@graph'?: Array<{ '@type'?: string }>
            }
            const types = structuredData['@graph']?.map(item => item['@type']) ?? []

            expect(types, requestPath).toContain('WebApplication')
            if (path === '/') {
              expect(types, requestPath).toContain('WebSite')
              expect(types, requestPath).toContain('Organization')
            } else {
              expect(types, requestPath).toContain('BreadcrumbList')
              expect(html, requestPath).toContain('class="breadcrumb"')
            }
          }

          expect(titles.size, `${deployment.config.origin}/${locale}`).toBe(PAGE_PATHS.length)
          expect(descriptions.size, `${deployment.config.origin}/${locale}`).toBe(PAGE_PATHS.length)
        }
      }
    })

    it('should canonicalize global legacy routes to English', async () => {
      for (const path of PAGE_PATHS) {
        const response = await app.request(path)
        const html = await response.text()

        expect(response.status, `${globalSiteConfig.origin}${path}`).toBe(200)
        expect(html, `${globalSiteConfig.origin}${path}`).toContain(
          `<link rel="canonical" href="${localizedUrl(globalSiteConfig.origin, 'en', path)}"`
        )
      }
    })

    it('should expose webmaster verification tags only when configured', async () => {
      const [homeResponse, toolResponse] = await Promise.all([
        Promise.resolve(verificationApp.request('/en')),
        Promise.resolve(verificationApp.request('/en/tools/converter'))
      ])
      const [home, tool] = await Promise.all([
        homeResponse.text(),
        toolResponse.text()
      ])

      expect(home).toContain('name="google-site-verification" content="google-code"')
      expect(home).toContain('name="baidu-site-verification" content="baidu-code"')
      expect(home).toContain('name="360-site-verification" content="360-code"')
      expect(home).toContain('name="bytedance-verification-code" content="bytedance-code"')
      expect(tool).not.toContain('google-code')
      expect(tool).not.toContain('baidu-code')
    })

    it('should inject deployment verification values into home pages at runtime', async () => {
      const bindings = {
        SEO_GOOGLE_SITE_VERIFICATION: ' runtime-google ',
        SEO_BAIDU_SITE_VERIFICATION: 'runtime-baidu',
        SEO_360_SITE_VERIFICATION: 'runtime-360',
        SEO_BYTEDANCE_VERIFICATION_CODE: 'runtime-bytedance',
        SEO_EXTRA_VERIFICATION_META: JSON.stringify({
          sogou_site_verification: 'runtime-sogou'
        })
      }
      const [homeResponse, toolResponse] = await Promise.all([
        Promise.resolve(app.request('/en', undefined, bindings)),
        Promise.resolve(app.request('/en/tools/converter', undefined, bindings))
      ])
      const [home, tool] = await Promise.all([
        homeResponse.text(),
        toolResponse.text()
      ])

      expect(home).toContain('name="google-site-verification" content="runtime-google"')
      expect(home).toContain('name="baidu-site-verification" content="runtime-baidu"')
      expect(home).toContain('name="360-site-verification" content="runtime-360"')
      expect(home).toContain('name="bytedance-verification-code" content="runtime-bytedance"')
      expect(home).toContain('name="sogou_site_verification" content="runtime-sogou"')
      expect(tool).not.toContain('runtime-google')
      expect(tool).not.toContain('runtime-sogou')
    })

    it('should ignore malformed or unsafe extra verification metadata', async () => {
      const malformedResponse = await app.request('/en', undefined, {
        SEO_EXTRA_VERIFICATION_META: '{not-json'
      })
      const unsafeResponse = await app.request('/en', undefined, {
        SEO_EXTRA_VERIFICATION_META: JSON.stringify({
          'safe-verification': ' safe-code ',
          'unsafe\" onload="alert(1)': 'unsafe-code',
          empty: '   ',
          nonString: 42
        })
      })
      const [malformed, unsafe] = await Promise.all([
        malformedResponse.text(),
        unsafeResponse.text()
      ])

      expect(malformed).not.toContain('not-json')
      expect(unsafe).toContain('name="safe-verification" content="safe-code"')
      expect(unsafe).not.toContain('unsafe-code')
      expect(unsafe).not.toContain('name="empty"')
      expect(unsafe).not.toContain('name="nonString"')
    })

    it('should serve rendered Chinese pages to major domestic crawlers', async () => {
      const crawlers = ['Baiduspider/2.0', '360Spider', 'Bytespider']

      for (const crawler of crawlers) {
        for (const path of PAGE_PATHS) {
          const suffix = path === '/' ? '' : path
          const response = await cnApp.request(`/zh${suffix}`, {
            headers: { 'User-Agent': crawler }
          })
          const html = await response.text()

          expect(response.status, `${crawler} ${path}`).toBe(200)
          expect(html, `${crawler} ${path}`).toContain('<html lang="zh-CN">')
          expect(html, `${crawler} ${path}`).toContain('name="robots" content="index, follow')
        }
      }
    })

    it('should serve rendered English pages to Googlebot', async () => {
      for (const path of PAGE_PATHS) {
        const suffix = path === '/' ? '' : path
        const response = await app.request(`/en${suffix}`, {
          headers: { 'User-Agent': 'Googlebot/2.1' }
        })
        const html = await response.text()

        expect(response.status, path).toBe(200)
        expect(html, path).toContain('<html lang="en">')
        expect(html, path).toContain('name="googlebot" content="index, follow')
      }
    })
  })

  describe('CN VPS edition', () => {
    it('should build only Chinese localized routes and the www origin', async () => {
      const [homeResponse, chineseResponse, englishResponse, legacyToolResponse,
        robotsResponse, sitemapResponse, textSitemapResponse, manifestResponse] = await Promise.all([
        cnApp.request('/'),
        cnApp.request('/zh'),
        cnApp.request('/en'),
        cnApp.request('/tools/converter'),
        cnApp.request('/robots.txt'),
        cnApp.request('/sitemap.xml'),
        cnApp.request('/sitemap.txt'),
        cnApp.request('/site.webmanifest')
      ])
      const [home, chinese, robots, sitemap, textSitemap, manifest] = await Promise.all([
        homeResponse.text(),
        chineseResponse.text(),
        robotsResponse.text(),
        sitemapResponse.text(),
        textSitemapResponse.text(),
        manifestResponse.json() as Promise<{ start_url: string; lang: string }>
      ])

      expect(homeResponse.status).toBe(200)
      expect(home).toContain('<html lang="zh-CN">')
      expect(home).toContain('https://www.colors-cc.top/zh')
      expect(chineseResponse.status).toBe(200)
      expect(chinese).toContain('<html lang="zh-CN">')
      expect(englishResponse.status).toBe(404)
      expect(legacyToolResponse.status).toBe(404)
      expect(robots).toContain('Sitemap: https://www.colors-cc.top/sitemap.xml')
      expect(sitemap.match(/<url>/g)).toHaveLength(PAGE_PATHS.length)
      expect(sitemap).not.toContain('<loc>https://www.colors-cc.top/en')
      expect(sitemap).toContain('https://www.colors-cc.top/zh/tools/converter')
      expect(textSitemap.trim().split('\n')).toHaveLength(PAGE_PATHS.length)
      expect(textSitemap).not.toContain('https://www.colors-cc.top/en')
      expect(manifest.start_url).toBe('/zh')
      expect(manifest.lang).toBe('zh-CN')
    })

    it('should include the ICP filing on every CN HTML page', async () => {
      for (const path of PAGE_PATHS) {
        const requestPath = `/zh${path === '/' ? '' : path}`
        const response = await cnApp.request(requestPath)
        const html = await response.text()

        expect(response.status, requestPath).toBe(200)
        expect(html, requestPath).toContain('苏ICP备2024075067号-4')
        expect(html, requestPath).toContain('https://beian.miit.gov.cn/')
      }

      const rootHtml = await (await cnApp.request('/')).text()
      expect(rootHtml).toContain('苏ICP备2024075067号-4')
    })

    it('should hide language switching while keeping theme controls', async () => {
      for (const path of ['/zh', '/zh/tools/converter', '/zh/tools/image-compress']) {
        const response = await cnApp.request(path)
        const html = await response.text()

        expect(response.status, path).toBe(200)
        expect(html, path).not.toContain('class="nav-preference-control language-control"')
        expect(html, path).not.toContain('class="nav-switch-option language-option"')
        expect(html, path).not.toContain('href="/en')
        expect(html, path).toContain('class="nav-preference-control theme-control"')
        expect(html, path).toContain('data-theme-option="system"')
        expect(html, path).not.toContain('<span class="nav-preference-label">主题</span>')
        expect(html, path).not.toContain('>System</')
        expect(html.match(/class="theme-option-icon"/g), path).toHaveLength(3)
      }
    })

    it('should not show ICP filing on the global Worker edition', async () => {
      const html = await (await app.request('/zh')).text()
      expect(html).not.toContain('苏ICP备2024075067号-4')
    })
  })

  describe('Theme support', () => {
    it.each(['/', '/tools/converter', '/tools/image-compress'])(
      'should render language and theme switches on %s',
      async (path) => {
        const res = await app.request(path)
        const html = await res.text()

        expect(res.status).toBe(200)
        expect(html).toContain('class="nav-preference-control language-control"')
        expect(html).toContain('class="nav-preference-control theme-control"')
        expect(html).toContain('class="nav-switch-option language-option"')
        expect(html).toContain('data-theme-option="light"')
        expect(html).toContain('data-theme-option="dark"')
        expect(html).toContain('data-theme-option="system"')
        expect(html).toContain('aria-pressed="false"')
        expect(html).toContain('class="theme-option-icon"')
        expect(html.match(/class="theme-option-icon"/g)).toHaveLength(3)
        expect(html).not.toContain('class="theme-system-label"')
        expect(html).not.toContain('>System</')
        expect(html).not.toContain('<span class="nav-preference-label">Theme</span>')
        expect(html).toContain('>简</a>')
        expect(html).toContain('>EN</a>')
        expect(html).not.toContain('data-theme-toggle')
        expect(html).not.toContain('data-theme-select')
        expect(html).not.toContain('class="theme-select"')
        expect(html).toContain('colors-cc-theme')
        expect(html).toContain('root.dataset.themePreference = theme')
        expect(html).toContain("prefers-color-scheme: dark")
        expect(html).toContain(":root[data-theme='dark']")
        expect(html).toContain('outline: 3px solid var(--focus-ring)')
        expect(html).not.toContain('outline: none')
        expect(html).not.toContain('__THEME_INIT_SCRIPT__')
        expect(html).not.toContain('__THEME_CONTROL_SCRIPT__')
      }
    )

    it('should preserve an accessible navigation path on compact screens', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toContain('aria-current="page">Convert</a>')
      expect(html).toContain('--shell-inline-padding: 28px;')
      expect(html).toContain('width: min(1384px, 100%);')
      expect(html).toContain('width: calc(100% + (2 * var(--shell-inline-padding)));')
      expect(html).toContain('margin-left: calc(-1 * var(--shell-inline-padding));')
      expect(html).toContain('@media (min-width: 2048px)')
      expect(html).toContain('--shell-inline-padding: 18px;')
      expect(html).toContain('--shell-inline-padding: 14px;')
      expect(html).toContain('.nav-links {\n      order: 3;')
      expect(html).not.toContain('.nav-links { display: none; }')
    })
  })

  describe('Global 404 Handler', () => {
    it('should return 404 status with llms.txt content', async () => {
      const res = await app.request('/some/random/path')
      expect(res.status).toBe(404)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      expect(res.headers.get('Cache-Control')).toContain('max-age=3600')
      
      const text = await res.text()
      expect(text).toContain('colors-cc.top - Agent & LLM Documentation')
    })
  })
})
