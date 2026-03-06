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
// 1. Frontend HTML (Minimalist Landing Page)
// ----------------------------------------------------
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>colors-cc API</title>
      <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; background: #fafafa; }
          h1 { color: #111; letter-spacing: -0.5px; }
          .subtitle { color: #666; margin-bottom: 40px; }
          .endpoint { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
          h3 { margin-top: 0; color: #222; }
          code { background: #f0f0f0; padding: 4px 8px; border-radius: 6px; font-size: 0.9em; font-family: monospace; color: #e83e8c; }
          .btn { display: inline-block; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 15px; font-size: 0.9em; font-weight: 500; transition: transform 0.1s; }
          .btn:active { transform: scale(0.98); }
          .footer { margin-top: 50px; text-align: center; color: #999; font-size: 0.85em; }
      </style>
  </head>
  <body>
      <h1>🎨 colors-cc API</h1>
      <p class="subtitle">A minimalist, free, and stateless Color API for developers. Built on Cloudflare Workers.</p>
      
      <div class="endpoint">
          <h3>1. Random Color</h3>
          <p>Get a completely random color in HEX and RGB formats.</p>
          <p><code>GET /api/random</code></p>
          <a href="/api/random" class="btn" target="_blank">Try Endpoint &rarr;</a>
      </div>

      <div class="endpoint">
          <h3>2. Color Palette</h3>
          <p>Get a curated color palette by theme (e.g., cyberpunk, vaporwave, retro).</p>
          <p><code>GET /api/palette?theme=cyberpunk</code></p>
          <a href="/api/palette?theme=cyberpunk" class="btn" target="_blank">Try Endpoint &rarr;</a>
      </div>

      <div class="endpoint">
          <h3>3. Color Convert (Coming Soon)</h3>
          <p>Convert HEX to RGB/HSL/CMYK.</p>
          <p><code>GET /api/convert?hex=FF5733</code></p>
      </div>

      <div class="footer">
          Powered by Hono.js & Cloudflare Workers | colors-cc.top
      </div>
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
