import { describe, it, expect } from 'vitest'
import app from './index'

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
      expect(xml).toContain('https://colors-cc.top/')
      expect(xml).toContain('https://colors-cc.top/tools/converter')
      expect(xml).toContain('https://colors-cc.top/tools/random-palette')
      expect(xml).toContain('https://colors-cc.top/tools/color-names')
      expect(xml).toContain('https://colors-cc.top/tools/fluid-placeholder')
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
      expect(html).not.toContain('__COLOR_API_CONTRACT__')
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
