import { describe, it, expect } from 'vitest'
import app from './index'

describe('colors-cc API', () => {
  describe('GET /api/random', () => {
    it('should return random color with hex, rgb, and timestamp', async () => {
      const res = await app.request('/api/random')
      expect(res.status).toBe(200)
      
      const data = await res.json() as { hex: string; rgb: string; timestamp: string }
      expect(data).toHaveProperty('hex')
      expect(data).toHaveProperty('rgb')
      expect(data).toHaveProperty('timestamp')
      expect(data.hex).toMatch(/^#[0-9A-F]{6}$/)
      expect(data.rgb).toMatch(/^rgb\(\d+, \d+, \d+\)$/)
    })
  })

  describe('GET /api/palette', () => {
    it('should return default cyberpunk palette', async () => {
      const res = await app.request('/api/palette')
      expect(res.status).toBe(200)
      
      const data = await res.json() as { theme: string; colors: string[]; count: number }
      expect(data).toHaveProperty('theme')
      expect(data).toHaveProperty('colors')
      expect(data).toHaveProperty('count')
      expect(data.theme).toBe('cyberpunk')
      expect(Array.isArray(data.colors)).toBe(true)
      expect(data.colors.length).toBeGreaterThan(0)
    })

    it('should return vaporwave palette when requested', async () => {
      const res = await app.request('/api/palette?theme=vaporwave')
      expect(res.status).toBe(200)
      
      const data = await res.json() as { theme: string }
      expect(data.theme).toBe('vaporwave')
    })
  })

  describe('GET /api/convert', () => {
    it('should convert hex to all formats', async () => {
      const res = await app.request('/api/convert?hex=%23FF5733')
      expect(res.status).toBe(200)
      
      const data = await res.json() as { hex: string; rgb: string; hsl: string; cmyk: string }
      expect(data.hex).toBe('#FF5733')
      expect(data.rgb).toBe('rgb(255, 87, 51)')
      expect(data.hsl).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
      expect(data.cmyk).toMatch(/^cmyk\(\d+%, \d+%, \d+%, \d+%\)$/)
    })

    it('should return error for missing parameter', async () => {
      const res = await app.request('/api/convert')
      expect(res.status).toBe(400)
      
      const data = await res.json() as { error: string }
      expect(data).toHaveProperty('error')
    })

    it('should return error for invalid hex', async () => {
      const res = await app.request('/api/convert?hex=invalid')
      expect(res.status).toBe(400)
      
      const data = await res.json() as { error: string }
      expect(data).toHaveProperty('error')
    })
  })

  describe('GET /api/all-names', () => {
    it('should return CSS color names object', async () => {
      const res = await app.request('/api/all-names')
      expect(res.status).toBe(200)
      expect(res.headers.get('Cache-Control')).toContain('max-age=31536000')
      
      const data = await res.json() as Record<string, string>
      expect(data).toHaveProperty('AliceBlue')
      expect(data).toHaveProperty('Tomato')
      expect(data.AliceBlue).toBe('#F0F8FF')
      expect(data.Tomato).toBe('#FF6347')
    })
  })

  describe('GET /api/placeholder', () => {
    it('should return SVG with default dimensions', async () => {
      const res = await app.request('/api/placeholder')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      expect(res.headers.get('Cache-Control')).toContain('max-age=31536000')
      
      const svg = await res.text()
      expect(svg).toContain('<svg')
      expect(svg).toContain('width="800"')
      expect(svg).toContain('height="400"')
    })

    it('should clamp dimensions to valid range', async () => {
      const res = await app.request('/api/placeholder?w=10&h=5000')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('width="50"')
      expect(svg).toContain('height="4000"')
    })

    it('should accept custom text', async () => {
      const res = await app.request('/api/placeholder?text=Hello+World')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('Hello World')
    })

    it('should escape XML in text', async () => {
      const res = await app.request('/api/placeholder?text=%3Cscript%3Ealert%281%29%3C%2Fscript%3E')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('&lt;script&gt;')
      expect(svg).not.toContain('<script>')
    })

    it('should accept valid hex colors', async () => {
      const res = await app.request('/api/placeholder?start=%23FF0000&end=%230000FF')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('#FF0000')
      expect(svg).toContain('#0000FF')
    })
  })

  describe('GET /api/fluid-placeholder', () => {
    it('should return animated SVG with default pastel theme', async () => {
      const res = await app.request('/api/fluid-placeholder')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      expect(res.headers.get('Cache-Control')).toContain('immutable')
      
      const svg = await res.text()
      expect(svg).toContain('<animate')
      expect(svg).toContain('attributeName="stop-color"')
      expect(svg).toContain('#FFD6A5')
      expect(svg).toContain('#FFADAD')
      expect(svg).toContain('#E2A0FF')
    })

    it('should accept custom color stops', async () => {
      const res = await app.request('/api/fluid-placeholder?stops=%23FF0000,%230000FF')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('#FF0000')
      expect(svg).toContain('#0000FF')
      expect(svg).toContain('<animate')
    })

    it('should accept custom speed parameter', async () => {
      const res = await app.request('/api/fluid-placeholder?speed=15')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('dur="15s"')
    })

    it('should clamp speed to 1-30 range', async () => {
      const res1 = await app.request('/api/fluid-placeholder?speed=0')
      const svg1 = await res1.text()
      expect(svg1).toContain('dur="1s"')
      
      const res2 = await app.request('/api/fluid-placeholder?speed=50')
      const svg2 = await res2.text()
      expect(svg2).toContain('dur="30s"')
    })

    it('should accept custom dimensions', async () => {
      const res = await app.request('/api/fluid-placeholder?w=1200&h=600')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('width="1200"')
      expect(svg).toContain('height="600"')
    })

    it('should validate and filter invalid hex colors', async () => {
      const res = await app.request('/api/fluid-placeholder?stops=FF0000,invalid,%230000FF,12345,%2300FF00')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('#FF0000')
      expect(svg).toContain('#0000FF')
      expect(svg).toContain('#00FF00')
      expect(svg).not.toContain('invalid')
    })

    it('should use default stops if less than 2 valid colors provided', async () => {
      const res = await app.request('/api/fluid-placeholder?stops=%23FF0000')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('#FFD6A5')
      expect(svg).toContain('#FFADAD')
      expect(svg).toContain('#E2A0FF')
    })

    it('should accept optional text parameter', async () => {
      const res = await app.request('/api/fluid-placeholder?text=Animated')
      expect(res.status).toBe(200)
      
      const svg = await res.text()
      expect(svg).toContain('Animated')
      expect(svg).toContain('<text')
    })
  })

  describe('GET /openapi.json', () => {
    it('should return valid OpenAPI spec', async () => {
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
      expect(spec.servers).toHaveLength(2)
      expect(spec.servers[0].url).toBe('https://api.colors-cc.top')
      expect(spec.servers[1].url).toBe('https://colors-cc.top/api')
    })
  })

  describe('GET /llms.txt', () => {
    it('should return LLM documentation', async () => {
      const res = await app.request('/llms.txt')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      expect(res.headers.get('Cache-Control')).toContain('max-age=86400')
      
      const text = await res.text()
      expect(text).toContain('colors-cc.top')
      expect(text).toContain('/api/placeholder')
      expect(text).toContain('ENCODE HEX COLORS')
    })
  })

  describe('GET /robots.txt', () => {
    it('should return robots.txt with sitemap', async () => {
      const res = await app.request('/robots.txt')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/plain')
      
      const text = await res.text()
      expect(text).toContain('User-agent: *')
      expect(text).toContain('Allow: /')
      expect(text).toContain('Sitemap: https://colors-cc.top/sitemap.xml')
    })
  })

  describe('GET /sitemap.xml', () => {
    it('should return valid sitemap', async () => {
      const res = await app.request('/sitemap.xml')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('text/xml')
      
      const xml = await res.text()
      expect(xml).toContain('<?xml version="1.0"')
      expect(xml).toContain('<urlset')
      expect(xml).toContain('https://colors-cc.top/')
      expect(xml).toContain('https://colors-cc.top/tools/converter')
    })
  })

  describe('Tool Pages', () => {
    it('should render /tools/converter', async () => {
      const res = await app.request('/tools/converter')
      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')
      
      const html = await res.text()
      expect(html).toContain('Universal Color Converter')
      expect(html).toContain('<link rel="canonical"')
      expect(html).toContain('og:title')
    })

    it('should render /tools/random-palette', async () => {
      const res = await app.request('/tools/random-palette')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('Random Palette Generator')
      expect(html).toContain('palette-display')
    })

    it('should render /tools/color-names', async () => {
      const res = await app.request('/tools/color-names')
      expect(res.status).toBe(200)
      
      const html = await res.text()
      expect(html).toContain('HTML Color Names')
    })

    it('should return 404 for invalid conversion route', async () => {
      const res = await app.request('/tools/invalid-conversion')
      expect(res.status).toBe(404)
    })
  })

  describe('Dual Domain Support', () => {
    describe('API Subdomain (api.colors-cc.top)', () => {
      it('should serve API endpoints at root path', async () => {
        const res = await app.request('/random', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as { hex: string; rgb: string }
        expect(data).toHaveProperty('hex')
        expect(data).toHaveProperty('rgb')
      })

      it('should serve /palette at root path', async () => {
        const res = await app.request('/palette?theme=vaporwave', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as { theme: string }
        expect(data.theme).toBe('vaporwave')
      })

      it('should serve /convert at root path', async () => {
        const res = await app.request('/convert?hex=%23FF5733', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as { hex: string }
        expect(data.hex).toBe('#FF5733')
      })

      it('should serve /placeholder at root path', async () => {
        const res = await app.request('/placeholder?w=800&h=400', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      })

      it('should serve /fluid-placeholder at root path', async () => {
        const res = await app.request('/fluid-placeholder', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
      })

      it('should serve /all-names at root path', async () => {
        const res = await app.request('/all-names', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as Record<string, string>
        expect(data).toHaveProperty('AliceBlue')
      })

      it('should return 404 for non-API paths', async () => {
        const res = await app.request('/', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(404)
        
        const data = await res.json() as { error: string }
        expect(data.error).toContain('only serves API endpoints')
      })

      it('should return 404 for /tools on API subdomain', async () => {
        const res = await app.request('/tools/converter', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        expect(res.status).toBe(404)
      })
    })

    describe('Main Domain (colors-cc.top) - Legacy API paths', () => {
      it('should continue serving /api/random', async () => {
        const res = await app.request('/api/random', {
          headers: { 'host': 'colors-cc.top' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as { hex: string }
        expect(data).toHaveProperty('hex')
      })

      it('should continue serving /api/palette', async () => {
        const res = await app.request('/api/palette', {
          headers: { 'host': 'colors-cc.top' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as { theme: string }
        expect(data.theme).toBe('cyberpunk')
      })

      it('should serve homepage at root', async () => {
        const res = await app.request('/', {
          headers: { 'host': 'colors-cc.top' }
        })
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Type')).toContain('text/html')
      })

      it('should serve tool pages', async () => {
        const res = await app.request('/tools/converter', {
          headers: { 'host': 'colors-cc.top' }
        })
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Type')).toContain('text/html')
      })
    })

    describe('Response Consistency', () => {
      it('should return identical responses for both domain formats', async () => {
        const res1 = await app.request('/random', {
          headers: { 'host': 'api.colors-cc.top' }
        })
        const res2 = await app.request('/api/random', {
          headers: { 'host': 'colors-cc.top' }
        })
        
        expect(res1.status).toBe(res2.status)
        
        const data1 = await res1.json() as { hex: string; rgb: string }
        const data2 = await res2.json() as { hex: string; rgb: string }
        
        expect(data1).toHaveProperty('hex')
        expect(data1).toHaveProperty('rgb')
        expect(data2).toHaveProperty('hex')
        expect(data2).toHaveProperty('rgb')
      })

      it('should have consistent CORS headers', async () => {
        const res1 = await app.request('/random', {
          headers: { 'host': 'api.colors-cc.top', 'origin': 'https://example.com' }
        })
        const res2 = await app.request('/api/random', {
          headers: { 'host': 'colors-cc.top', 'origin': 'https://example.com' }
        })
        
        expect(res1.headers.get('access-control-allow-origin')).toBeTruthy()
        expect(res2.headers.get('access-control-allow-origin')).toBeTruthy()
      })
    })

    describe('Local Development Support', () => {
      it('should detect api.localhost for local dev', async () => {
        const res = await app.request('/random', {
          headers: { 'host': 'api.localhost:8787' }
        })
        expect(res.status).toBe(200)
        
        const data = await res.json() as { hex: string }
        expect(data).toHaveProperty('hex')
      })

      it('should treat localhost as main domain', async () => {
        const res = await app.request('/', {
          headers: { 'host': 'localhost:8787' }
        })
        expect(res.status).toBe(200)
        expect(res.headers.get('Content-Type')).toContain('text/html')
      })
    })
  })
})
