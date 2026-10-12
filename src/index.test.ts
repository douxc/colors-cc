import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createApp } from './app'
import app from './index'
import { PAGE_PATHS } from './routes/seo/sitemap'
import { globalSiteConfig, localeInfo, localizedUrl, TOOL_REDIRECTS } from './site'
import { languageControlBlock } from './templates/language-control-html'
import homeTemplate from './templates/home.html'

const verificationApp = createApp({
  ...globalSiteConfig,
  verificationMeta: {
    'google-site-verification': 'google-code',
    'baidu-site-verification': 'baidu-code',
    '360-site-verification': '360-code',
    'bytedance-verification-code': 'bytedance-code'
  }
}, {
  home: homeTemplate
})

const OFFLINE_IMAGE_COMPRESS = 'https://offline-tools.colors-cc.top/image-compress/'

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
      expect(PAGE_PATHS).toHaveLength(17)
      expect(PAGE_PATHS).not.toContain('/tools/image-compress')
      expect(xml).not.toContain('/zh/tools/image-compress')
      expect(xml).toContain('<?xml version="1.0"')
      expect(xml).toContain('<urlset')
      expect(xml.match(/<url>/g)).toHaveLength(PAGE_PATHS.length * globalSiteConfig.enabledLocales.length)
      expect(xml).toContain('https://colors-cc.top/en')
      expect(xml).toContain('https://colors-cc.top/zh')
      expect(xml).toContain('https://colors-cc.top/en/tools/converter')
      expect(xml).toContain('https://colors-cc.top/zh/tools/random-palette')
      expect(xml).toContain('hreflang="en"')
      expect(xml).toContain('hreflang="zh-Hans"')
      expect(xml).not.toContain('hreflang="en-CN"')
      expect(xml).toContain('hreflang="zh-CN"')
      expect(xml).toContain('hreflang="x-default"')
      expect(xml).toContain('https://colors-cc.top/zh/tools/converter')
      expect(xml).not.toContain('www.colors-cc.top')
      expect(xml.match(/<mobile:mobile type="pc,mobile" \/>/g)).toHaveLength(PAGE_PATHS.length * globalSiteConfig.enabledLocales.length)
      expect(xml.match(/<lastmod>2026-10-12<\/lastmod>/g)).toHaveLength(PAGE_PATHS.length * globalSiteConfig.enabledLocales.length)
    })

    it('should serve a plain-text sitemap fallback', async () => {
      const res = await app.request('/sitemap.txt')
      const urls = (await res.text()).trim().split('\n')

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      expect(urls).toHaveLength(PAGE_PATHS.length * globalSiteConfig.enabledLocales.length)
      expect(urls).toContain('https://colors-cc.top/en/tools/converter')
      expect(urls).not.toContain('image-compress')
    })

    it('should serve stable favicon and web manifest assets', async () => {
      const [iconResponse, manifestResponse] = await Promise.all([
        app.request('/favicon.svg'),
        app.request('/site.webmanifest')
      ])
      const [icon, manifest] = await Promise.all([
        iconResponse.text(),
        manifestResponse.json() as Promise<{
          name: string
          start_url: string
          icons: Array<{ src: string; sizes: string; type: string; purpose: string }>
        }>
      ])

      expect(iconResponse.status).toBe(200)
      expect(iconResponse.headers.get('Content-Type')).toContain('image/svg+xml')
      expect(icon).toContain('<svg')
      expect(icon).toContain('data-brand-mark="canvas-pair"')
      expect(icon).toMatch(
        /<rect data-layer="generate" class="generate" x="5" y="9" width="36" height="36" rx="9"/
      )
      expect(icon).toMatch(
        /<rect data-layer="prepare" class="prepare" x="24" y="20" width="32" height="32" rx="7"/
      )
      expect(icon).toContain('<path data-extension="right" class="extension" d="M52 30h10"')
      expect(icon).toContain('<path data-extension="bottom" class="extension" d="M46 46v12"')
      expect(icon).toContain('.generate { fill: #087f8c; }')
      expect(icon).toContain('.prepare { fill: #fffefa; stroke: #1d1d1f; }')
      expect(icon).toContain('.extension { stroke: #1d1d1f; }')
      expect(icon).toContain('@media (prefers-color-scheme: dark)')
      expect(icon).toContain('.generate { fill: #62d5df; }')
      expect(icon).toContain('.prepare { fill: #101011; stroke: #f5f5f7; }')
      expect(icon).toContain('.extension { stroke: #f5f5f7; }')
      expect(icon).not.toContain('<linearGradient')
      expect(icon).not.toContain('<circle')
      expect(manifestResponse.status).toBe(200)
      expect(manifestResponse.headers.get('Content-Type')).toContain('application/manifest+json')
      expect(manifest.name).toBe('colors-cc')
      expect(manifest.start_url).toBe('/en')
      expect(manifest.icons).toEqual([
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ])
    })
  })

  describe('Tool Pages', () => {
    it('should render /tools/converter', async () => {
      const res = await app.request('/tools/converter')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      
      const html = await res.text()
      expect(html).toContain('Universal color converter')
      expect(html).toContain('Convert instantly between HEX, RGB, HSL, and CMYK with precise, synchronized values.')
      expect(html).toContain('Synchronized values')
      expect(html).toContain('<link rel="canonical"')
      expect(html).toContain('og:title')
    })

    it('should render /tools/random-palette', async () => {
      const res = await app.request('/tools/random-palette')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('Curated palette generator')
      expect(html).toContain('Choose a theme and copy individual colors or a complete palette.')
      expect(html).toContain('palette-display')
      expect(html).toContain('role="status"')
    })

    it('should render /tools/color-names', async () => {
      const res = await app.request('/tools/color-names')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('CSS color atlas')
      expect(html).toContain('Search the complete CSS named-color directory')
      expect(html).toContain('type="search"')
    })

    it('should render /tools/fluid-placeholder', async () => {
      const res = await app.request('/tools/fluid-placeholder')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('Fluid SVG studio')
      expect(html).toContain('Create lightweight SVG placeholders with smooth, looping animation')
      expect(html).toContain('palette=')
      expect(html).not.toContain('stops=')
    })

    describe('image-compress migration redirects', () => {
      it('should map the legacy tool path to the offline-tools destination', () => {
        expect(TOOL_REDIRECTS['/tools/image-compress']).toBe(OFFLINE_IMAGE_COMPRESS)
      })

      it('should 301 the global legacy route without a query', async () => {
        const res = await app.request('/tools/image-compress?mode=compress')
        expect(res.status).toBe(301)
        expect(res.headers.get('location')).toBe(OFFLINE_IMAGE_COMPRESS)
      })

      it('should 301 the global /en and /zh variants', async () => {
        for (const path of ['/en/tools/image-compress', '/zh/tools/image-compress']) {
          const res = await app.request(path)
          expect(res.status, path).toBe(301)
          expect(res.headers.get('location'), path).toBe(OFFLINE_IMAGE_COMPRESS)
        }
      })

      it('should drop every deep-link query when redirecting', async () => {
        for (const mode of ['compress', 'watermark', 'fan', 'unknown']) {
          const res = await app.request(`/tools/image-compress?mode=${mode}`)
          expect(res.status, mode).toBe(301)
          expect(res.headers.get('location'), mode).toBe(OFFLINE_IMAGE_COMPRESS)
          expect(res.headers.get('location'), mode).not.toContain('?')
        }
      })

      it('should return 404 for the removed worker asset', async () => {
        const res = await app.request('/assets/image-compress-worker.js')
        expect(res.status).toBe(404)
      })
    })

    describe('task-first tool workflows', () => {
      it('should render converter input before preview and share compact task styling', async () => {
        const [converterResponse, paletteResponse, namesResponse] = await Promise.all([
          app.request('/tools/converter'),
          app.request('/tools/random-palette'),
          app.request('/tools/color-names')
        ])
        const [converter, palette, names] = await Promise.all([
          converterResponse.text(),
          paletteResponse.text(),
          namesResponse.text()
        ])
        const inputsIndex = converter.indexOf('id="converter-inputs-title"')
        const previewIndex = converter.indexOf('id="converter-preview-title"')

        expect(inputsIndex).toBeGreaterThan(-1)
        expect(previewIndex).toBeGreaterThan(inputsIndex)
        expect(converter).toContain('class="tool-layout converter-layout"')
        expect(converter).toContain('.converter-layout {')
        expect(converter).toMatch(
          /\.converter-layout \{[^}]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(280px, \.75fr\);/
        )
        expect(converter).toMatch(
          /@media \(max-width: 1100px\)[\s\S]*\.converter-layout \{[^}]*grid-template-columns: 1fr;/
        )
        for (const html of [converter, palette, names]) {
          expect(html).toContain('.page-heading {')
          expect(html).toContain('padding: 40px 0 24px;')
          expect(html).toContain('font-size: clamp(2rem, 4vw, 3.35rem);')
          expect(html).toContain('.panel-copy-feedback')
        }
      })
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
    it('should render an editorial homepage around one real product result', async () => {
      const html = await (await app.request('/')).text()
      const heroIndex = html.indexOf('data-home-role="asset-hero"')
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const developersIndex = html.indexOf('id="for-ai"')
      const hero = html.slice(heroIndex, html.indexOf('class="tool-index"'))
      const showcase = html.slice(showcaseIndex, developersIndex)
      const workbench = html.slice(workbenchIndex, showcaseIndex)
      const developers = html.slice(developersIndex)

      expect(html.match(/data-home-role="product-result"/g) ?? []).toHaveLength(1)
      expect(hero).toContain('class="hero-action"')
      expect(hero).not.toContain('class="eyebrow"')
      expect(hero).not.toContain('class="path-index"')
      expect(showcase).toContain('class="product-stage"')
      expect(html).toContain('class="product-result-image"')
      expect(homeTemplate).toContain('.product-result-image { width: 100%; height: auto;')
      expect(showcase).toContain('width="1200"')
      expect(showcase).toContain('height="630"')
      expect(html).toContain('class="tool-index"')
      expect(showcase).not.toContain('class="workflow-group"')
      expect(showcase).not.toContain('2.4 MB → 684 KB')
      expect(workbench).not.toContain('class="window-dots"')
      expect(workbench).not.toContain('VISUAL STATE → API → CODE → AGENT')
      expect(developers).toContain('class="developer-resources"')
      expect(developers).toContain('id="copyAgentRule"')
      expect(developers).not.toContain('class="agent-signal"')
      expect(developers).not.toContain('class="ai-card"')
    })

    it('should keep editorial navigation compact and touch friendly on mobile', () => {
      const mobileBreakpoint = homeTemplate.slice(homeTemplate.indexOf('@media (max-width: 620px)'))

      expect(mobileBreakpoint).toContain('.hero-action { min-height: 44px;')
      expect(mobileBreakpoint).toContain('.product-stage { min-height:')
      expect(mobileBreakpoint).toContain('.tool-index { grid-template-columns: repeat(2, minmax(0, 1fr));')
      expect(mobileBreakpoint).toContain('.tool-index-link { min-height: 44px;')
    })

    it('should present generate and prepare as one visual asset workflow', async () => {
      const html = await (await app.request('/')).text()
      const heroIndex = html.indexOf('data-home-role="asset-hero"')
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const aiIndex = html.indexOf('id="for-ai"')
      const hero = html.slice(heroIndex, html.indexOf('class="tool-index"'))
      const showcase = html.slice(html.indexOf('class="tool-index"'), workbenchIndex)

      expect(heroIndex).toBeGreaterThan(-1)
      expect(showcaseIndex).toBeGreaterThan(heroIndex)
      expect(showcaseIndex).toBeGreaterThan(workbenchIndex)
      expect(aiIndex).toBeGreaterThan(workbenchIndex)
      expect(hero).toContain('Create, prepare, and deliver visual assets.')
      expect(hero).toContain('data-brand-path="generate"')
      expect(hero).toContain('data-brand-path="prepare"')
      expect(hero).toContain('href="#create"')
      expect(hero).toContain(`href="${OFFLINE_IMAGE_COMPRESS}"`)
      expect(showcase).toContain('data-workflow="generate"')
      expect(showcase).toContain('data-workflow="prepare"')
      expect(html).toContain('data-home-role="product-result"')
      expect(html).toContain('class="product-result-image"')
      expect(html).toContain('class="tool-index"')
      expect(html).not.toContain('data-home-role="image-feature"')
      expect(html).not.toContain('data-home-role="tool-launchpad"')
    })

    it('should group task links in workflow order with prepare cards pointing at offline-tools', async () => {
      const html = await (await app.request('/')).text()
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const showcase = html.slice(html.indexOf('class="tool-index"'), workbenchIndex)
      const generateIndex = showcase.indexOf('data-workflow="generate"')
      const prepareIndex = showcase.indexOf('data-workflow="prepare"')

      expect(generateIndex).toBeGreaterThan(-1)
      expect(prepareIndex).toBeGreaterThan(generateIndex)
      expect(showcase).toContain('href="#create"')
      expect(showcase).toContain('href="/en/tools/random-palette"')
      expect(showcase).toContain('href="/en/tools/converter"')
      expect(showcase).toContain('href="/en/tools/color-names"')
      expect(showcase).not.toContain('/tools/image-compress')
      const offlineLinks = showcase.match(/href="https:\/\/offline-tools\.colors-cc\.top\/image-compress\/"/g)
      expect(offlineLinks).toHaveLength(3)
    })

    it('should render /', async () => {
      const res = await app.request('/')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      
      const html = await res.text()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('colors-cc')
      expect(html).toContain('Placeholder workbench')
      expect(html).toContain('Agent prompt')
      expect(html).toContain('aria-label="Placeholder controls"')
      expect(html).not.toContain('/tools/image-compress')
      expect(html).not.toContain('__COLOR_API_CONTRACT__')
    })

    it('should preserve the placeholder workbench interaction contract', async () => {
      const html = await (await app.request('/')).text()

      expect(html).toContain('id="create"')
      expect(html).toContain('id="previewImage"')
      expect(html).toContain('id="previewStage"')
      expect(html).toContain('id="effectControls"')
      expect(html).toContain('id="presetControls"')
      expect(html).toContain('id="outputCode"')
      expect(html).toContain('id="copyOutput"')
      expect(html).toContain('id="quickCopy"')
      expect(html.match(/class="output-tab"/g)).toHaveLength(5)
      expect(html).toContain('const state = {')
      expect(html).toContain('new URLSearchParams(')
      expect(html).toContain('function render(delay = 180) {')
      expect(html).toContain('Tools.intent()')
      expect(html).toContain('Tools.track(')
    })

    it('should keep the placeholder workbench before the workflow showcase and developer outputs', async () => {
      const html = await (await app.request('/')).text()
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const aiIndex = html.indexOf('id="for-ai"')
      const workflowNavigation = html.slice(html.indexOf('class="tool-index"'), workbenchIndex)
      const normalizedHtml = html.replace(/\s+/g, ' ')

      expect(showcaseIndex).toBeGreaterThan(-1)
      expect(showcaseIndex).toBeGreaterThan(workbenchIndex)
      expect(aiIndex).toBeGreaterThan(workbenchIndex)
      expect(html).toContain('data-home-role="placeholder-primary"')
      expect(workflowNavigation).toContain('href="#create"')
      expect(workflowNavigation).toContain('href="/en/tools/converter"')
      expect(workflowNavigation).toContain('href="/en/tools/random-palette"')
      expect(workflowNavigation).toContain('href="/en/tools/color-names"')
      expect(workflowNavigation).toContain(`href="${OFFLINE_IMAGE_COMPRESS}"`)
      expect(html).not.toContain('class="task-rail"')
      expect(normalizedHtml).not.toContain('.hero { min-height: 610px;')
    })

    it('should keep developer resources below the primary workbench', async () => {
      const html = await (await app.request('/')).text()
      const workbenchIndex = html.indexOf('id="create"')
      const resourcesIndex = html.indexOf('class="developer-resources"')
      const aiSection = html.slice(html.indexOf('id="for-ai"'))

      expect(resourcesIndex).toBeGreaterThan(workbenchIndex)
      expect(aiSection).toContain('id="copyAgentRule"')
      expect(aiSection).toContain('href="/llms.txt"')
      expect(aiSection).toContain('href="/openapi.json"')
      expect(aiSection).toContain('href="/skills/colors-cc.md"')
    })

    it('should localize the generate and prepare workflow on /, /en, and /zh', async () => {
      const routes = [
        { path: '/', locale: 'en', prefix: '/en' },
        { path: '/en', locale: 'en', prefix: '/en' },
        { path: '/zh', locale: 'zh', prefix: '/zh' }
      ] as const

      for (const route of routes) {
        const response = await app.request(route.path)
        const html = await response.text()
        const heroIndex = html.indexOf('data-home-role="asset-hero"')
        const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
        const workbenchIndex = html.indexOf('id="create"')
        const workflowNavigation = html.slice(html.indexOf('class="tool-index"'), workbenchIndex)

        expect(response.status, route.path).toBe(200)
        expect(heroIndex, route.path).toBeGreaterThan(-1)
        expect(showcaseIndex, route.path).toBeGreaterThan(heroIndex)
        expect(html, route.path).toContain('data-home-role="placeholder-primary"')
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/converter"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/random-palette"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/color-names"`)
        const offlineLinks = workflowNavigation.match(/href="https:\/\/offline-tools\.colors-cc\.top\/image-compress\/"/g)
        expect(offlineLinks, route.path).toHaveLength(3)

        if (route.locale === 'zh') {
          expect(html).toContain('生成、处理并交付视觉素材。')
          expect(html).toContain('生成可复现的占位图与精选配色')
          expect(workflowNavigation).toContain('占位图')
          expect(workflowNavigation).toContain('转换器')
          expect(workflowNavigation).toContain('配色')
          expect(workflowNavigation).toContain('颜色名称')
          expect(workflowNavigation).toContain('添加水印')
        } else {
          expect(html).toContain('Create, prepare, and deliver visual assets.')
          expect(html).toContain('Create reproducible placeholders and curated palettes')
          expect(workflowNavigation).toContain('Placeholder')
          expect(workflowNavigation).toContain('Converter')
          expect(workflowNavigation).toContain('Palette')
          expect(workflowNavigation).toContain('Color names')
          expect(workflowNavigation).toContain('Watermark')
        }
      }
    })

    it('should reserve the mobile first viewport for the placeholder controls', () => {
      const mobileBreakpoint = homeTemplate.slice(homeTemplate.indexOf('@media (max-width: 620px)'))

      expect(mobileBreakpoint).toContain('.hero { padding: 28px 0 26px; }')
      expect(mobileBreakpoint).toContain('.hero h1 { font-size: clamp(2.35rem, 11vw, 3.05rem); }')
      expect(mobileBreakpoint).toContain('.hero-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));')
      expect(mobileBreakpoint).toContain('.product-stage { min-height: 164px;')
      expect(mobileBreakpoint).toContain('.tool-index { grid-template-columns: repeat(2, minmax(0, 1fr));')
      expect(mobileBreakpoint).toContain('main .button, main button { min-height: 44px; }')
      expect(mobileBreakpoint).toContain('main input:not([type="checkbox"]), main select { min-height: 44px; }')
      expect(mobileBreakpoint).toContain('.toggle-row, .developer-link { min-height: 44px; }')
      expect(mobileBreakpoint).toContain('.workbench-bar { min-height: 58px;')
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
      expect(english).toContain('Create, prepare, and deliver visual assets.')
      expect(english).toContain('Give every agent precise, reliable context.')
      expect(english).toContain('href="/zh"')
      expect(english).toContain('lang="zh-CN"')
      expect(english).toContain('https://colors-cc.top/en')

      expect(chineseResponse.status).toBe(200)
      expect(chinese).toContain('<html lang="zh-CN">')
      expect(chinese).toContain('生成、处理并交付视觉素材。')
      expect(chinese).toContain('为每个智能体提供精确、可靠的上下文。')
      expect(chinese).toContain('--leading-hero: 1.18;')
      expect(chinese).toContain('line-height: var(--leading-hero);')
      expect(chinese).toContain('href="/en"')
      expect(chinese).toContain('lang="en"')
      expect(chinese).toContain('https://colors-cc.top/zh')
      expect(chinese).toContain('const animated = new Set')
      expect(chinese).toContain('id="customPalette"')
      expect(chinese).not.toContain('animated效果')
      expect(chinese).not.toContain('custom配色')
    })

    it('should render both languages for tool pages', async () => {
      const [
        englishResponse,
        chineseResponse,
        chinesePaletteResponse,
        chineseNamesResponse,
        chineseFluidResponse
      ] = await Promise.all([
        app.request('/en/tools/converter'),
        app.request('/zh/tools/converter'),
        app.request('/zh/tools/random-palette'),
        app.request('/zh/tools/color-names'),
        app.request('/zh/tools/fluid-placeholder')
      ])
      const [english, chinese, chinesePalette, chineseNames, chineseFluid] = await Promise.all([
        englishResponse.text(),
        chineseResponse.text(),
        chinesePaletteResponse.text(),
        chineseNamesResponse.text(),
        chineseFluidResponse.text()
      ])

      expect(english).toContain('Universal color converter')
      expect(english).toContain('href="/zh/tools/converter"')
      expect(chinese).toContain('通用颜色转换器')
      expect(chinese).toContain('即时转换，获得精确、同步的各格式色值')
      expect(chinese).toContain('href="/en/tools/converter"')
      expect(chinese).toContain('转换完成 · 所有颜色格式已同步')
      expect(chinese).toContain('正在转换 ')
      expect(chinese).toContain('请输入有效的 {format} 色值')
      expect(chinese).not.toContain("'Converting '")
      expect(chinese).not.toContain("'That value is not a valid '")
      expect(chinesePalette).toContain('选择主题，复制单个颜色或整组配色。')
      expect(chineseNames).toContain('搜索完整的 CSS 颜色名称目录')
      expect(chineseFluid).toContain('生成轻量、流畅循环的 SVG 占位图')
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
        expect(english, englishPath).toContain('lang="zh-CN"')
        expect(chinese, chinesePath).toContain(`href="${englishPath}"`)
        expect(chinese, chinesePath).toContain('lang="en"')
      }
    })

    it('should publish hreflang alternates only on the canonical origin', async () => {
      const html = await (await app.request('/zh/tools/converter')).text()

      expect(html).toContain('hreflang="en" href="https://colors-cc.top/en/tools/converter"')
      expect(html).toContain('hreflang="zh-CN" href="https://colors-cc.top/zh/tools/converter"')
      expect(html).not.toContain('hreflang="en-CN"')
      expect(html).not.toContain('www.colors-cc.top')
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
        { app, config: globalSiteConfig }
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
            expect(title?.replaceAll('&amp;', '&').length, requestPath).toBeLessThanOrEqual(60)
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
            expect(html, requestPath).toContain(`property="og:locale" content="${localeInfo[locale].ogLocale}"`)
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
          const response = await app.request(`/zh${suffix}`, {
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

  describe('Retired mainland edition', () => {
    it('should not render the retired ICP filing on any page', async () => {
      for (const path of PAGE_PATHS) {
        const html = await (await app.request(path)).text()

        expect(html, path).not.toContain('苏ICP备2024075067号-4')
        expect(html, path).not.toContain('beian.miit.gov.cn')
      }
    })
  })

  describe('Global feedback mailto link', () => {
    it('should render the mailto feedback link on global EN home and converter', async () => {
      const [homeRes, converterRes] = await Promise.all([
        app.request('/'),
        app.request('/tools/converter')
      ])
      const [home, converter] = await Promise.all([
        homeRes.text(),
        converterRes.text()
      ])

      expect(homeRes.status).toBe(200)
      expect(converterRes.status).toBe(200)
      expect(home).toContain('mailto:douxc512@gmail.com')
      expect(home).toContain('>Feedback</a>')
      expect(converter).toContain('mailto:douxc512@gmail.com')
      expect(converter).toContain('>Feedback</a>')
    })

    it('should render the ZH feedback label on the global ZH converter page', async () => {
      const res = await app.request('/zh/tools/converter')
      const html = await res.text()

      expect(res.status).toBe(200)
      expect(html).toContain('mailto:douxc512@gmail.com')
      expect(html).toContain('>反馈</a>')
    })

  })

  describe('Shared brand chrome', () => {
    it('should render one shared Generate, Prepare, and Developers navigation on every page shell', async () => {
      for (const path of ['/', '/tools/converter', '/tools/random-palette']) {
        const html = await (await app.request(path)).text()

        expect(html.match(/data-site-chrome="navigation"/g), path).toHaveLength(1)
        expect(html.match(/data-site-chrome="footer"/g), path).toHaveLength(1)
        expect(html.match(/class="site-nav"/g), path).toHaveLength(1)
        expect(html, path).toContain('data-brand-mark="canvas-pair"')
        expect(html, path).toContain('>Generate</a>')
        expect(html, path).toContain(`href="${OFFLINE_IMAGE_COMPRESS}">Prepare</a>`)
        expect(html, path).toContain('>Developers</a>')
        expect(html, path).toContain('--paper: #f7f6f2;')
        expect(html, path).toContain('--ink: #1d1d1f;')
        expect(html, path).toContain('--accent-coral: #d45d4c;')
        expect(html, path).toContain('--surface-canvas: #eceae4;')
        expect(html, path).toContain('--radius-panel: 12px;')
        expect(html, path).toContain('--shadow-panel: 0 1px 2px rgba(29, 29, 31, 0.06);')
        expect(html, path).not.toContain('__SITE_NAV__')
        expect(html, path).not.toContain('__SITE_FOOTER__')
        expectValidInlineScripts(html)
      }
    })

    it('should render a quiet visual foundation without ambient effects or ornamental UI treatments', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toContain(
        '--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;'
      )
      expect(html).not.toMatch(/--font-sans:[^;]*\bInter\b/)
      expect(html).toMatch(/body \{[^}]*background: var\(--bg\);/s)
      expect(html).not.toContain('body::before')
      expect(html).not.toContain('--page-glow-')
      expect(html).not.toContain('--grid-line:')
      expect(html).toContain('--primary-gradient: var(--primary-bg);')
      expect(html).toContain('--primary-gradient-hover: var(--primary-hover-bg);')
      expect(html).not.toMatch(/--primary-gradient(?:-hover)?:[^;]*linear-gradient/)
      expect(html).toMatch(
        /\.button-primary \{[^}]*background: var\(--primary-bg\);[^}]*color: var\(--primary-text\);[^}]*box-shadow: none;/s
      )
      expect(html).not.toMatch(/\.eyebrow \{[^}]*font-family: var\(--font-mono\);/s)
      expect(html).not.toMatch(/\.eyebrow \{[^}]*text-transform: uppercase;/s)
      expect(html).not.toMatch(/\.panel \{[^}]*backdrop-filter:/s)
      expect(html).toMatch(/\.site-nav \{[^}]*min-height: 60px;/s)
      expect(html).toMatch(
        /@media \(max-width: 760px\)[\s\S]*\.nav-switch-option \{[^}]*width: 44px;[^}]*height: 44px;[^}]*min-height: 44px;/
      )
      // Language entries must outgrow the fixed square on compact viewports, or the
      // self-named labels are clipped; the broadening rule has to stay scoped to the
      // language control so the theme buttons keep their square shape.
      expect(html).toMatch(
        /@media \(max-width: 760px\)[\s\S]*\.nav-actions \.language-control \.nav-switch-option \{[^}]*width: auto;[^}]*flex: 1 1 auto;/
      )
      const optionRules = [...html.matchAll(/(?:^|\n)\s*([^{}\n]*\.nav-switch-option[^{}\n]*)\{([^}]*)\}/g)]
      const unscoped = optionRules.filter(rule => rule[1].trim() === '.nav-switch-option')
      expect(unscoped.length).toBeGreaterThan(0)
      for (const rule of unscoped) expect(rule[2]).not.toContain('width: auto')
    })

    it('should render a keyboard-operable compact menu with preferences inside it', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toContain('class="nav-menu"')
      expect(html).toContain('class="nav-menu-toggle"')
      expect(html).toContain('<details class="nav-menu" open')
      expect(html).toContain('aria-label="Open navigation menu"')
      expect(html).toContain('data-label-close="Close navigation menu"')
      expect(html).toContain('class="nav-menu-panel"')
      expect(html).toContain('class="nav-preferences"')
      expect(html).toContain("window.matchMedia('(max-width: 760px)')")
      expect(html).toContain('menu.open = !isCompact')
      expect(html).toMatch(
        /@media \(max-width: 760px\)[\s\S]*\.site-nav \{[^}]*min-height: 56px;[^}]*flex-wrap: nowrap;/
      )
      expect(html).toMatch(
        /@media \(max-width: 760px\)[\s\S]*\.nav-menu-toggle \{[^}]*min-width: 44px;[^}]*min-height: 44px;/
      )
    })

    it('should localize the shared chrome without changing stable locale URLs', async () => {
      const html = await (await app.request('/zh/tools/converter')).text()

      expect(html).toContain('>生成素材</a>')
      expect(html).toContain('>处理素材</a>')
      expect(html).toContain('>开发者</a>')
      expect(html).toContain('aria-label="打开导航菜单"')
      expect(html).toContain('href="/en/tools/converter"')
      expect(html.match(/data-site-chrome="navigation"/g)).toHaveLength(1)
    })
  })

  describe('Theme support', () => {
    it.each(['/', '/tools/converter', '/tools/random-palette'])(
      'should render language and theme switches on %s',
      async (path) => {
        const res = await app.request(path)
        const html = await res.text()

        expect(res.status).toBe(200)
        expect(html).toContain('class="nav-preference-control language-control"')
        expect(html).toContain('class="nav-preference-control theme-control"')
        expect(html).toContain('class="nav-switch-option language-option"')
        // Language choice is a plain link group, never a scripted disclosure.
        expect(html).not.toContain('class="language-toggle"')
        expect(html).not.toMatch(/<details[^>]*language-control/)
        expect(languageControlBlock(html)).not.toContain('<summary')
        expect(html).toContain('data-theme-option="light"')
        expect(html).toContain('data-theme-option="dark"')
        expect(html).toContain('data-theme-option="system"')
        expect(html).toContain('aria-pressed="false"')
        expect(html).toContain('class="theme-option-icon"')
        expect(html.match(/class="theme-option-icon"/g)).toHaveLength(3)
        expect(html).not.toContain('class="theme-system-label"')
        expect(html).not.toContain('>System</')
        expect(html).not.toContain('<span class="nav-preference-label">Theme</span>')
        expect(html).toContain('>简体中文</a>')
        expect(html).toContain('>English</a>')
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

    it('should align navbar utility controls with the navigation links', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toMatch(
        /\.nav-segmented \{[^}]*padding: 0;[^}]*border: 0;[^}]*background: transparent;/s
      )
      expect(html).not.toContain('.nav-segmented { padding: 2px;')
      expect(html).toContain(
        '.nav-switch-option:hover { color: var(--text); background: var(--surface-soft); }'
      )
      expect(html).toMatch(
        /\.nav-switch-option\[aria-current='page'\],[^}]*background: var\(--surface-strong\);[^}]*color: var\(--text\);[^}]*box-shadow: none;/s
      )
      expect(html).toMatch(
        /\.nav-actions > \.button-quiet \{[^}]*border: 0;[^}]*background: transparent;[^}]*color: var\(--text-muted\);/s
      )
      expect(html).toContain(
        '.nav-actions > .button-quiet:hover { transform: none; color: var(--text); background: var(--surface-soft); }'
      )
    })

    it('should preserve an accessible navigation path on compact screens', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toContain('aria-current="page">Generate</a>')
      expect(html).toContain('--shell-inline-padding: 28px;')
      expect(html).toContain('width: min(1384px, 100%);')
      expect(html).toContain('width: calc(100% + (2 * var(--shell-inline-padding)));')
      expect(html).toContain('margin-left: calc(-1 * var(--shell-inline-padding));')
      expect(html).not.toContain('@media (min-width: 2048px)')
      expect(html).toContain('--shell-inline-padding: 18px;')
      expect(html).toContain('--shell-inline-padding: 14px;')
      expect(html).toContain('@media (max-width: 760px)')
      expect(html).toMatch(/\.site-nav \{[^}]*min-height: 56px;[^}]*flex-wrap: nowrap;/)
      expect(html).toContain('.nav-menu[open] > .nav-menu-panel {')
      expect(html).not.toContain('.nav-links { display: none; }')
    })

    it('should remove the language preference visible label while keeping accessible names', async () => {
      const html = await (await app.request('/en')).text()

      expect(html).not.toContain('nav-preference-label')
      expect(html).toContain('class="nav-preference-control language-control"')
      expect(html).toContain('>简体中文</a>')
      expect(html).toContain('>English</a>')
      expect(html).toContain('aria-label="Language"')
      // Self-named entries stay visible text on their own links, not a collapsed label.
      const control = languageControlBlock(html)
      expect(control).toContain('>日本語</a>')
      expect(control).not.toContain('<summary')
      expect(control).toContain('aria-current="page"')
    })

    it('should render square theme buttons aligned with language buttons', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toMatch(/\.nav-switch-option \{[^}]*width: 44px;/)
      expect(html).toMatch(/\.nav-switch-option \{[^}]*height: 44px;/)
      expect(html).toMatch(/\.nav-switch-option \{[^}]*min-height: 44px;/)
      expect(html).not.toContain('min-width: 30px')
      expect(html).not.toMatch(/\.nav-switch-option \{[^}]*height: 34px/)
      expect(html).not.toContain('.theme-option { padding-inline: 0;')
      expect(html.match(/class="theme-option-icon"/g)).toHaveLength(3)
    })

    it('should space navbar utility controls with a 16px gap', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toMatch(/\.nav-actions \{[^}]*gap: 16px;/)
      expect(html).toMatch(/\.nav-utility-group \{[^}]*gap: 16px;/)
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

  describe('offline-tools migration collateral', () => {
    const repoRoot = new URL('../', import.meta.url).pathname
    const read = (relative: string): string =>
      readFileSync(join(repoRoot, relative), 'utf8')

    it('should update the verify-seo URL count and migration checks', () => {
      const verifySeo = read('scripts/verify-seo.ts')

      expect(verifySeo).toContain('enabledLocales.length * PAGE_PATHS.length')
      expect(verifySeo).toContain('OFFLINE_IMAGE_COMPRESS')
      expect(verifySeo).toContain('verifyRedirect')
      expect(verifySeo).toContain('verifyMigratedToolRedirects')
      expect(verifySeo).not.toContain('enabledLocales.length * 18')
      const pageChecks = verifySeo.slice(verifySeo.indexOf('pageChecks'))
      expect(pageChecks).not.toContain('image-compress')
    })

    it('should drop the codec build from wrangler and package scripts', () => {
      const wrangler = read('wrangler.toml')
      expect(wrangler).not.toContain('[build]')
      expect(wrangler).not.toContain('build:image-codecs')

      const packageJson = read('package.json')
      expect(packageJson).not.toContain('build:image-codecs')
    })

    it('should delete every image-compress source file', () => {
      const removed = [
        'src/pages/image-compress.html',
        'src/client/image-compress-worker.ts',
        'src/image-compression/png-strategy.ts',
        'src/image-compression/png-strategy.test.ts',
        'src/image-compression/png-worker.integration.test.ts',
        'scripts/build-image-codecs.ts',
        'src/generated/image-compress-worker.html'
      ]
      for (const relative of removed) {
        expect(existsSync(join(repoRoot, relative)), relative).toBe(false)
      }

      const i18n = read('src/i18n/index.ts')
      expect(i18n).not.toContain('localizeImageHtml')
      expect(i18n).not.toContain('imageChineseToEnglish')
      expect(i18n).not.toContain('imageEnglishToChinese')
    })
  })
})
