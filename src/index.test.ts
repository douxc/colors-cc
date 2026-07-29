import { describe, it, expect } from 'vitest'
import { createApp } from './app'
import app from './index'
import imageCompressWorker from './generated/image-compress-worker.html'
import imageCompressTemplate from './pages/image-compress.html'
import { PAGE_PATHS } from './routes/seo/sitemap'
import { cnSiteConfig, globalSiteConfig, localizedUrl } from './site'
import homeTemplate from './templates/home.html'

const cnApp = createApp(cnSiteConfig, {
  home: homeTemplate,
  imageCompress: imageCompressTemplate,
  imageCompressWorker
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
  imageCompress: imageCompressTemplate,
  imageCompressWorker
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
      expect(xml.match(/<lastmod>2026-07-29<\/lastmod>/g)).toHaveLength(PAGE_PATHS.length * 2)
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
      expect(html).toContain('id="compressPreview"')
      expect(html).toContain('id="compressPreviewImage"')
      expect(html).toContain('id="compressLoading"')
      expect(html).toContain('role="status"')
      expect(html).toContain('aria-live="polite"')
      expect(html).toContain('class="compress-preview" id="compressPreview" hidden')
      expect(html).toContain('els.compressPreviewImage.src = item.url')
      expect(html).toContain('function showCompressionPreview(item, current, total)')
      expect(html).toContain('showCompressionPreview(item, i + 1, state.images.length)')
      expect(html).toMatch(/finally\s*{\s*hideCompressionPreview\(\)/)
      expect(html).toContain('/assets/image-compress-worker.js')
      expect(html).toContain('libimagequant-oxipng')
      expect(html).toContain('GPL-3.0-or-later')
      expect(html).toContain('github.com/douxc/colors-cc')
      expect(html).toContain('aria-current="page">Prepare</a>')
      expect(html).not.toContain('fetch(')
      expect(html).not.toContain('__SHARED_STYLES__')
    })

    it('should turn the empty state into a drop-or-choose upload affordance', async () => {
      const [enRes, zhRes] = await Promise.all([
        app.request('/tools/image-compress'),
        app.request('/zh/tools/image-compress')
      ])
      const [en, zh] = await Promise.all([enRes.text(), zhRes.text()])

      // EN SSR renders the new empty-state upload guidance copy.
      expect(en).toContain('Drop or choose images')
      // ZH SSR renders the new empty-state upload guidance copy.
      expect(zh).toContain('拖放或选择图片')
      // #emptyState opens the file picker on click/keyboard by reusing #fileInput.
      expect(en).toContain('els.fileInput.click()')
      // #emptyState binds drop so users can drag-and-drop images onto it.
      expect(en).toMatch(/els\.emptyState\.addEventListener\(\s*["']drop/)
    })

    it('should mirror export/clear actions in the stage header', async () => {
      const [enRes, zhRes] = await Promise.all([
        app.request('/tools/image-compress'),
        app.request('/zh/tools/image-compress')
      ])
      const [en, zh] = await Promise.all([enRes.text(), zhRes.text()])

      // Top action buttons exist with unique ids alongside the sidebar ones.
      expect(en).toContain('id="exportButtonTop"')
      expect(en).toContain('id="clearButtonTop"')
      expect(zh).toContain('id="exportButtonTop"')
      expect(zh).toContain('id="clearButtonTop"')
      // Default copy mirrors the sidebar buttons.
      expect(zh).toContain('导出 JPEG')
      expect(zh).toContain('清空')
      // Top buttons reuse the same export/clear handlers as the sidebar.
      expect(en).toMatch(/exportButtonTop\.addEventListener\(\s*["']click["'].*exportJpeg/)
      expect(en).toMatch(/clearButtonTop\.addEventListener\(\s*["']click["'].*clearImages/)
    })

    describe('task-first tool workflows', () => {
      it('should default image processing to compression and accept only supported deep-link modes', async () => {
        const responses = await Promise.all([
          app.request('/tools/image-compress'),
          app.request('/tools/image-compress?mode=compress'),
          app.request('/tools/image-compress?mode=watermark'),
          app.request('/tools/image-compress?mode=fan'),
          app.request('/tools/image-compress?mode=unknown')
        ])
        const pages = await Promise.all(responses.map(response => response.text()))

        responses.forEach(response => expect(response.status).toBe(200))
        pages.forEach((html) => {
          expect(html).toContain('const allowedModes = new Set(["compress", "watermark", "fan"])')
          expect(html).toContain(
            'const requestedMode = new URLSearchParams(window.location.search).get("mode")'
          )
          expect(html).toContain(
            'const initialMode = allowedModes.has(requestedMode) ? requestedMode : "compress"'
          )
          expect(html).toContain('mode: initialMode')
          expect(html).toContain('setMode(initialMode)')
        })

        const html = pages[0]
        expect(html).toContain(
          'class="mode-btn active" data-mode="compress" aria-pressed="true"'
        )
        expect(html).toContain('data-mode="watermark" aria-pressed="false"')
        expect(html).toContain('data-mode="fan" aria-pressed="false"')
        expect(html).toContain('id="sizeSection" hidden')
        expect(html).toContain('id="fanSection" hidden')
        expect(html).toContain('id="watermarkSection" hidden')
        expect(html).toContain('id="exportButton" type="button" disabled>Compress and export automatically')
        expect(html).toContain('btn.setAttribute("aria-pressed", String(isActive))')
      })

      it('should prioritize upload and expose a one-tap mobile settings/preview workflow', async () => {
        const html = await (await app.request('/tools/image-compress')).text()
        const appIndex = html.indexOf('class="app"')
        const aboutIndex = html.indexOf('class="about-tool"')

        expect(appIndex).toBeGreaterThan(-1)
        expect(aboutIndex).toBeGreaterThan(appIndex)
        expect(html).toContain('class="mobile-panel-switch"')
        expect(html).toContain(
          'id="mobileSettingsTab" type="button" aria-controls="imageSettings" aria-pressed="true"'
        )
        expect(html).toContain(
          'id="mobilePreviewTab" type="button" aria-controls="imagePreview" aria-pressed="false"'
        )
        expect(html).toContain('id="imageSettings"')
        expect(html).toContain('id="imagePreview"')
        expect(html).toContain('function setMobilePanel(panel)')
        expect(html).toMatch(/async function addFiles[\s\S]*setMobilePanel\("preview"\)/)
        expect(html).toContain('class="mobile-export-bar"')
        expect(html).toContain('id="mobileExportButton"')
        expect(html).toContain('els.mobileExportButton.textContent = label')
        expect(html).toContain('els.mobileExportButton.disabled = disabled')
        expect(html).toMatch(
          /mobileExportButton\.addEventListener\(\s*["']click["']\s*,\s*exportJpeg/
        )
        expect(html).toMatch(
          /\.mobile-panel-switch button \{[^}]*min-height: 44px;/
        )
        expect(html).toContain('padding-bottom: calc(12px + env(safe-area-inset-bottom))')
      })

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
          expect(html).toContain('padding: 48px 0 24px;')
          expect(html).toContain('font-size: clamp(2rem, 4vw, 3.35rem);')
          expect(html).toContain('.panel-copy-feedback')
        }
      })
    })

    it('should serve the self-hosted PNG codec worker', async () => {
      const res = await app.request('/assets/image-compress-worker.js')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/javascript')
      expect(res.headers.get('Cache-Control')).toContain('must-revalidate')

      const worker = await res.text()
      expect(worker.length).toBeGreaterThan(600_000)
      expect(worker).toContain('GPL-3.0-or-later')
      expect(worker).toContain('github.com/douxc/colors-cc')
      expect(worker).toContain('THIRD_PARTY_NOTICES.md')
      expect(worker).toContain('compress-png')
      expect(worker).toContain('libimagequant-oxipng')
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
    it('should present generate and prepare as one visual asset workflow', async () => {
      const html = await (await app.request('/')).text()
      const heroIndex = html.indexOf('data-home-role="asset-hero"')
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const aiIndex = html.indexOf('id="for-ai"')
      const hero = html.slice(heroIndex, showcaseIndex)
      const showcase = html.slice(showcaseIndex, workbenchIndex)

      expect(heroIndex).toBeGreaterThan(-1)
      expect(showcaseIndex).toBeGreaterThan(heroIndex)
      expect(workbenchIndex).toBeGreaterThan(showcaseIndex)
      expect(aiIndex).toBeGreaterThan(workbenchIndex)
      expect(hero).toContain('Generate, prepare, and ship visual assets.')
      expect(hero).toContain('data-brand-path="generate"')
      expect(hero).toContain('data-brand-path="prepare"')
      expect(hero).toContain('href="#create"')
      expect(hero).toContain('href="/en/tools/image-compress?mode=compress"')
      expect(showcase).toContain('data-workflow="generate"')
      expect(showcase).toContain('data-workflow="prepare"')
      expect(showcase).toContain('class="placeholder-output-preview"')
      expect(showcase).toContain('class="compression-result"')
      expect(showcase).toContain('class="watermark-proof"')
      expect(showcase).toContain('class="fan-layout-proof"')
      expect(html).not.toContain('data-home-role="image-feature"')
      expect(html).not.toContain('data-home-role="tool-launchpad"')
    })

    it('should group task links in workflow order with direct prepare modes', async () => {
      const html = await (await app.request('/')).text()
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const showcase = html.slice(showcaseIndex, workbenchIndex)
      const generateIndex = showcase.indexOf('data-workflow="generate"')
      const prepareIndex = showcase.indexOf('data-workflow="prepare"')
      const compressIndex = showcase.indexOf('/en/tools/image-compress?mode=compress')
      const watermarkIndex = showcase.indexOf('/en/tools/image-compress?mode=watermark')
      const fanIndex = showcase.indexOf('/en/tools/image-compress?mode=fan')

      expect(generateIndex).toBeGreaterThan(-1)
      expect(prepareIndex).toBeGreaterThan(generateIndex)
      expect(showcase).toContain('href="#create"')
      expect(showcase).toContain('href="/en/tools/random-palette"')
      expect(showcase).toContain('href="/en/tools/converter"')
      expect(showcase).toContain('href="/en/tools/color-names"')
      expect(compressIndex).toBeGreaterThan(prepareIndex)
      expect(watermarkIndex).toBeGreaterThan(compressIndex)
      expect(fanIndex).toBeGreaterThan(watermarkIndex)
    })

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
      expect(html).toContain('function buildUrl() {')
      expect(html).toContain('function renderPreview() {')
      expect(html).toContain('function commit(delay = 180) {')
      expect(html).toContain('function syncQuery() {')
    })

    it('should keep the placeholder workbench between the workflow showcase and developer outputs', async () => {
      const html = await (await app.request('/')).text()
      const showcaseIndex = html.indexOf('data-home-role="workflow-showcase"')
      const workbenchIndex = html.indexOf('id="create"')
      const aiIndex = html.indexOf('id="for-ai"')
      const workflowNavigation = html.slice(showcaseIndex, workbenchIndex)
      const normalizedHtml = html.replace(/\s+/g, ' ')

      expect(showcaseIndex).toBeGreaterThan(-1)
      expect(workbenchIndex).toBeGreaterThan(showcaseIndex)
      expect(aiIndex).toBeGreaterThan(workbenchIndex)
      expect(html).toContain('data-home-role="placeholder-primary"')
      expect(workflowNavigation).toContain('href="#create"')
      expect(workflowNavigation).toContain('href="/en/tools/converter"')
      expect(workflowNavigation).toContain('href="/en/tools/random-palette"')
      expect(workflowNavigation).toContain('href="/en/tools/color-names"')
      expect(workflowNavigation).toContain('href="/en/tools/image-compress?mode=compress"')
      expect(html).not.toContain('class="task-rail"')
      expect(normalizedHtml).not.toContain('.hero { min-height: 610px;')
    })

    it('should keep the agent example below the primary workbench', async () => {
      const html = await (await app.request('/')).text()
      const workbenchIndex = html.indexOf('id="create"')
      const agentIndex = html.indexOf('class="agent-signal"')
      const aiSection = html.slice(html.indexOf('id="for-ai"'))

      expect(agentIndex).toBeGreaterThan(workbenchIndex)
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
        const workflowNavigation = html.slice(showcaseIndex, workbenchIndex)

        expect(response.status, route.path).toBe(200)
        expect(heroIndex, route.path).toBeGreaterThan(-1)
        expect(showcaseIndex, route.path).toBeGreaterThan(heroIndex)
        expect(html, route.path).toContain('data-home-role="placeholder-primary"')
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/converter"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/random-palette"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/color-names"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/image-compress?mode=compress"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/image-compress?mode=watermark"`)
        expect(workflowNavigation, route.path).toContain(`href="${route.prefix}/tools/image-compress?mode=fan"`)

        if (route.locale === 'zh') {
          expect(html).toContain('生成、处理并交付视觉素材。')
          expect(html).toContain('生成可直接用于原型的视觉素材，在本地处理真实图片')
          expect(workflowNavigation).toContain('占位图')
          expect(workflowNavigation).toContain('转换器')
          expect(workflowNavigation).toContain('配色')
          expect(workflowNavigation).toContain('颜色名称')
          expect(workflowNavigation).toContain('添加水印')
        } else {
          expect(html).toContain('Generate, prepare, and ship visual assets.')
          expect(html).toContain('Create prototype-ready visuals, process real images locally')
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

      expect(mobileBreakpoint).toContain('.hero .eyebrow { display: none; }')
      expect(mobileBreakpoint).toContain('.hero { padding: 14px 0 10px; }')
      expect(mobileBreakpoint).toContain('.hero h1 { font-size: clamp(1.8rem, 8vw, 2.2rem); }')
      expect(mobileBreakpoint).toContain('.hero-paths { grid-template-columns: repeat(2, minmax(0, 1fr));')
      expect(mobileBreakpoint).toContain('.workflow-visual { display: none; }')
      expect(mobileBreakpoint).toContain('.workflow-tasks { grid-template-columns: repeat(2, minmax(0, 1fr));')
      expect(mobileBreakpoint).toContain('main .button, main button { min-height: 44px; }')
      expect(mobileBreakpoint).toContain('main input:not([type="checkbox"]), main select { min-height: 44px; }')
      expect(mobileBreakpoint).toContain('.toggle-row, .ai-link { min-height: 44px; }')
      expect(mobileBreakpoint).toContain('.workbench-bar { min-height: 48px;')
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
      expect(english).toContain('Generate, prepare, and ship visual assets.')
      expect(english).toContain('href="/zh"')
      expect(english).toContain('aria-label="Simplified Chinese"')
      expect(english).toContain('https://colors-cc.top/en')

      expect(chineseResponse.status).toBe(200)
      expect(chinese).toContain('<html lang="zh-CN">')
      expect(chinese).toContain('生成、处理并交付视觉素材。')
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

  describe('Global feedback mailto link', () => {
    it('should render the mailto feedback link on global EN home, image-compress, and converter', async () => {
      const [homeRes, imageRes, converterRes] = await Promise.all([
        app.request('/'),
        app.request('/tools/image-compress'),
        app.request('/tools/converter')
      ])
      const [home, image, converter] = await Promise.all([
        homeRes.text(),
        imageRes.text(),
        converterRes.text()
      ])

      expect(homeRes.status).toBe(200)
      expect(imageRes.status).toBe(200)
      expect(converterRes.status).toBe(200)
      expect(home).toContain('mailto:douxc512@gmail.com')
      expect(home).toContain('>Feedback</a>')
      expect(image).toContain('mailto:douxc512@gmail.com')
      expect(image).toContain('>Feedback</a>')
      expect(converter).toContain('mailto:douxc512@gmail.com')
      expect(converter).toContain('>Feedback</a>')
    })

    it('should render the ZH feedback label on the global ZH image-compress page', async () => {
      const res = await app.request('/zh/tools/image-compress')
      const html = await res.text()

      expect(res.status).toBe(200)
      expect(html).toContain('mailto:douxc512@gmail.com')
      expect(html).toContain('>反馈</a>')
    })

    it('should not render the feedback link or leave the placeholder on the CN edition', async () => {
      const [homeRes, imageRes] = await Promise.all([
        cnApp.request('/zh'),
        cnApp.request('/zh/tools/image-compress')
      ])
      const [home, image] = await Promise.all([
        homeRes.text(),
        imageRes.text()
      ])

      expect(homeRes.status).toBe(200)
      expect(imageRes.status).toBe(200)
      expect(home).not.toContain('mailto:douxc512@gmail.com')
      expect(home).not.toContain('__FEEDBACK_LINK__')
      expect(image).not.toContain('mailto:douxc512@gmail.com')
      expect(image).not.toContain('__FEEDBACK_LINK__')
    })
  })

  describe('Shared brand chrome', () => {
    it('should render one shared Generate, Prepare, and Developers navigation on every page shell', async () => {
      for (const path of ['/', '/tools/converter', '/tools/image-compress']) {
        const html = await (await app.request(path)).text()

        expect(html.match(/data-site-chrome="navigation"/g), path).toHaveLength(1)
        expect(html.match(/data-site-chrome="footer"/g), path).toHaveLength(1)
        expect(html.match(/class="site-nav"/g), path).toHaveLength(1)
        expect(html, path).toContain('data-brand-mark="canvas-pair"')
        expect(html, path).toContain('>Generate</a>')
        expect(html, path).toContain('>Prepare</a>')
        expect(html, path).toContain('>Developers</a>')
        expect(html, path).toContain('--paper: #f3f0e9;')
        expect(html, path).toContain('--ink: #1d2025;')
        expect(html, path).toContain('--accent-coral: #d45d4c;')
        expect(html, path).toContain('--surface-canvas: #e7e3da;')
        expect(html, path).toContain('--radius-panel: 16px;')
        expect(html, path).toContain('--shadow-panel:')
        expect(html, path).not.toContain('__SITE_NAV__')
        expect(html, path).not.toContain('__SITE_FOOTER__')
        expectValidInlineScripts(html)
      }
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
        /@media \(max-width: 760px\)[\s\S]*\.site-nav \{[^}]*min-height: 64px;[^}]*flex-wrap: nowrap;/
      )
      expect(html).toMatch(
        /@media \(max-width: 760px\)[\s\S]*\.nav-menu-toggle \{[^}]*min-width: 44px;[^}]*min-height: 44px;/
      )
    })

    it('should localize the shared chrome without changing stable locale URLs', async () => {
      const html = await (await app.request('/zh/tools/image-compress')).text()

      expect(html).toContain('>生成素材</a>')
      expect(html).toContain('>处理素材</a>')
      expect(html).toContain('>开发者</a>')
      expect(html).toContain('aria-label="打开导航菜单"')
      expect(html).toContain('href="/en/tools/image-compress"')
      expect(html.match(/data-site-chrome="navigation"/g)).toHaveLength(1)
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
        /\.nav-switch-option\[aria-current='page'\],[^}]*background: var\(--surface-strong\);[^}]*color: var\(--text\);[^}]*box-shadow: 0 2px 8px rgba\(48, 58, 78, \.12\);/s
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
      expect(html).toMatch(/\.site-nav \{[^}]*min-height: 64px;[^}]*flex-wrap: nowrap;/)
      expect(html).toContain('.nav-menu[open] > .nav-menu-panel {')
      expect(html).not.toContain('.nav-links { display: none; }')
    })

    it('should remove the language preference visible label while keeping accessible names', async () => {
      const html = await (await app.request('/en')).text()

      expect(html).not.toContain('nav-preference-label')
      expect(html).toContain('class="nav-preference-control language-control"')
      expect(html).toContain('>简</a>')
      expect(html).toContain('>EN</a>')
      expect(html).toContain('aria-label="Language"')
    })

    it('should render square theme buttons aligned with language buttons', async () => {
      const html = await (await app.request('/tools/converter')).text()

      expect(html).toMatch(/\.nav-switch-option \{[^}]*width: 32px;/)
      expect(html).toMatch(/\.nav-switch-option \{[^}]*height: 32px;/)
      expect(html).toMatch(/\.nav-switch-option \{[^}]*min-height: 32px;/)
      expect(html).not.toContain('min-width: 30px')
      expect(html).not.toMatch(/\.nav-switch-option \{[^}]*height: 34px/)
      expect(html).not.toContain('.theme-option { padding-inline: 0;')
      expect(html.match(/class="theme-option-icon"/g)).toHaveLength(3)
    })

    it('should keep theme buttons square on the image-compress page', async () => {
      const html = await (await app.request('/tools/image-compress')).text()

      expect(html).toMatch(/\.nav-switch-option \{[^}]*min-height: 32px;/)
      expect(html).toMatch(/\.nav-switch-option \{[^}]*width: 32px;/)
      expect(html).toMatch(/\.nav-switch-option \{[^}]*height: 32px;/)
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
})
