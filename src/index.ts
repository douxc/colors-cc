import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for all API routes so frontend apps can call it
app.use('/api/*', cors())

// Helper to generate random hex
const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()

// Simple HEX to RGB helper
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

// ----------------------------------------------------
// 1. Frontend HTML (SEO Optimized Landing Page)
// ----------------------------------------------------
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Free Color API - Random HEX, RGB & Palette Generator | colors-cc</title>
      
      <!-- SEO Meta Tags -->
      <meta name="description" content="A blazing fast, free, and stateless Color API for developers and designers. Generate random HEX/RGB colors and curated palettes in JSON format with zero authentication.">
      <meta name="keywords" content="Color API, free API, random hex generator, color palette API, JSON color, frontend tools, colors-cc, web design">
      <meta name="author" content="colors-cc">
      <meta name="robots" content="index, follow">
      <link rel="canonical" href="https://colors-cc.top/">
      
      <!-- Open Graph / Facebook / Discord -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://colors-cc.top/">
      <meta property="og:title" content="Free Color API for Developers | colors-cc">
      <meta property="og:description" content="Generate random colors and curated palettes instantly. A free, stateless JSON API built on Cloudflare edge nodes.">
      
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:url" content="https://colors-cc.top/">
      <meta name="twitter:title" content="Free Color API for Developers | colors-cc">
      <meta name="twitter:description" content="Generate random colors and curated palettes instantly. A free, stateless JSON API.">

      <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; background: #fafafa; }
          header { text-align: left; margin-bottom: 45px; }
          h1 { color: #111; letter-spacing: -0.5px; font-size: 2.5em; margin-bottom: 10px; }
          .subtitle { color: #666; font-size: 1.1em; }
          section.endpoint { background: #fff; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
          h2 { margin-top: 0; color: #222; font-size: 1.3em; }
          p.desc { color: #555; margin-bottom: 15px; }
          code { background: #f0f0f0; padding: 5px 10px; border-radius: 6px; font-size: 0.95em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #e83e8c; }
          .btn { display: inline-block; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 15px; font-size: 0.9em; font-weight: 500; transition: transform 0.1s, background 0.2s; }
          .btn:hover { background: #333; }
          .btn:active { transform: scale(0.98); }
          footer { margin-top: 50px; text-align: center; color: #999; font-size: 0.85em; padding-top: 20px; border-top: 1px solid #eaeaea; }
          a { color: #666; text-decoration: none; }
          a:hover { text-decoration: underline; }
      </style>
  </head>
  <body>
      <header>
          <h1>🎨 colors-cc API</h1>
          <p class="subtitle">A minimalist, free, and stateless JSON Color API for developers. Built on the edge with Cloudflare Workers.</p>
      </header>
      
      <main>
          <section class="endpoint">
              <h2>1. Random Color API</h2>
              <p class="desc">Generate a completely random color in HEX and RGB formats. Perfect for frontend mock data and placeholders.</p>
              <p><code>GET /api/random</code></p>
              <a href="/api/random" class="btn" target="_blank" rel="noopener">Try Endpoint &rarr;</a>
          </section>

          <section class="endpoint">
              <h2>2. Color Palette API</h2>
              <p class="desc">Fetch a curated color palette by theme (e.g., cyberpunk, vaporwave, retro, monochrome) for UI design inspiration.</p>
              <p><code>GET /api/palette?theme=cyberpunk</code></p>
              <a href="/api/palette?theme=cyberpunk" class="btn" target="_blank" rel="noopener">Try Endpoint &rarr;</a>
          </section>

          <section class="endpoint">
              <h2>3. Color Format Conversion (Coming Soon)</h2>
              <p class="desc">Convert HEX color codes to RGB, HSL, and CMYK formats via a simple GET request.</p>
              <p><code>GET /api/convert?hex=FF5733</code></p>
          </section>
      </main>

      <footer>
          <p>Powered by Hono.js & Cloudflare Workers | <a href="https://colors-cc.top">colors-cc.top</a></p>
      </footer>
  </body>
  </html>`
  return c.html(html)
})

// ----------------------------------------------------
// 2. API Endpoints
// ----------------------------------------------------

// API: Random Color
app.get('/api/random', (c) => {
  const hex = randomHex()
  return c.json({
    hex: hex,
    rgb: hexToRgb(hex),
    timestamp: new Date().toISOString()
  })
})

// API: Palette
app.get('/api/palette', (c) => {
  const theme = c.req.query('theme') || 'cyberpunk'
  
  const palettes: Record<string, string[]> = {
    cyberpunk: ['#FCEE09', '#00FF41', '#00B8FF', '#FF003C', '#D902EE'],
    vaporwave: ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF', '#FFFB96'],
    retro: ['#E24E1B', '#F8A91F', '#F2E8CF', '#386641', '#BC4749'],
    monochrome: ['#121212', '#333333', '#777777', '#CCCCCC', '#F5F5F5']
  }
  
  const colors = palettes[theme] || palettes['cyberpunk']
  
  return c.json({ 
    theme, 
    colors,
    count: colors.length
  })
})

export default app
