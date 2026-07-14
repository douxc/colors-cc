import { describe, it, expect } from 'vitest'
import { createApp } from './app'
import app from './index'
import imageCompressTemplate from './pages/image-compress.html'
import { PAGE_PATHS } from './routes/seo/sitemap'
import { cnSiteConfig } from './site'
import homeTemplate from './templates/home.html'

const cnApp = createApp(cnSiteConfig, {
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
      expect(text).toContain('Allow: /')
      expect(text).toContain('Sitemap: https://colors-cc.top/sitemap.xml')
    })

    it('should serve /sitemap.xml', async () => {
      const res = await app.request('/sitemap.xml')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('text/xml')
      
      const xml = await res.text()
      expect(xml).toContain('<?xml version="1.0"')
      expect(xml).toContain('<urlset')
      expect(xml).toContain('https://colors-cc.top/en')
      expect(xml).toContain('https://colors-cc.top/zh')
      expect(xml).toContain('https://colors-cc.top/en/tools/converter')
      expect(xml).toContain('https://colors-cc.top/zh/tools/random-palette')
      expect(xml).toContain('hreflang="en"')
      expect(xml).toContain('hreflang="zh"')
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
      expect(english).toContain('https://colors-cc.top/en')

      expect(chineseResponse.status).toBe(200)
      expect(chinese).toContain('<html lang="zh-CN">')
      expect(chinese).toContain('用颜色构建。')
      expect(chinese).toContain('href="/en"')
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
      expect(chinese).toContain('就绪 · 所有格式已同步')
      expect(chineseImage).toContain('图片压缩、排列与水印')
    })

    it('should publish reciprocal cross-domain hreflang links', async () => {
      const html = await (await app.request('/zh/tools/converter')).text()

      expect(html).toContain('hreflang="en" href="https://colors-cc.top/en/tools/converter"')
      expect(html).toContain('hreflang="zh-CN" href="https://www.colors-cc.top/zh/tools/converter"')
      expect(html).toContain('hreflang="x-default"')
    })

    it('should preserve valid scripts after Chinese localization', async () => {
      const paths = ['/zh', '/zh/tools/random-palette', '/zh/tools/fluid-placeholder']

      for (const path of paths) {
        const html = await (await app.request(path)).text()
        expectValidInlineScripts(html)
      }
    })
  })

  describe('CN VPS edition', () => {
    it('should use Chinese for legacy routes and the www origin', async () => {
      const [homeResponse, robotsResponse, sitemapResponse] = await Promise.all([
        cnApp.request('/'),
        cnApp.request('/robots.txt'),
        cnApp.request('/sitemap.xml')
      ])
      const [home, robots, sitemap] = await Promise.all([
        homeResponse.text(),
        robotsResponse.text(),
        sitemapResponse.text()
      ])

      expect(home).toContain('<html lang="zh-CN">')
      expect(home).toContain('https://www.colors-cc.top/zh')
      expect(robots).toContain('Sitemap: https://www.colors-cc.top/sitemap.xml')
      expect(sitemap).toContain('https://www.colors-cc.top/en/tools/converter')
      expect(sitemap).toContain('https://www.colors-cc.top/zh/tools/converter')
    })

    it('should include the ICP filing on every CN HTML page', async () => {
      for (const locale of ['en', 'zh'] as const) {
        for (const path of PAGE_PATHS) {
          const requestPath = `/${locale}${path === '/' ? '' : path}`
          const response = await cnApp.request(requestPath)
          const html = await response.text()

          expect(response.status, requestPath).toBe(200)
          expect(html, requestPath).toContain('苏ICP备2024075067号-4')
          expect(html, requestPath).toContain('https://beian.miit.gov.cn/')
        }
      }
    })

    it('should not show ICP filing on the global Worker edition', async () => {
      const html = await (await app.request('/zh')).text()
      expect(html).not.toContain('苏ICP备2024075067号-4')
    })
  })

  describe('Theme support', () => {
    it.each(['/', '/tools/converter', '/tools/image-compress'])(
      'should render system, light, and dark theme controls on %s',
      async (path) => {
        const res = await app.request(path)
        const html = await res.text()

        expect(res.status).toBe(200)
        expect(html).toContain('data-theme-select')
        expect(html).toContain('<option value="system">System</option>')
        expect(html).toContain('<option value="light">Light</option>')
        expect(html).toContain('<option value="dark">Dark</option>')
        expect(html).toContain('colors-cc-theme')
        expect(html).toContain("prefers-color-scheme: dark")
        expect(html).toContain(":root[data-theme='dark']")
        expect(html).not.toContain('__THEME_INIT_SCRIPT__')
        expect(html).not.toContain('__THEME_CONTROL_SCRIPT__')
      }
    )
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
