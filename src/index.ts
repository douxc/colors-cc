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
              <h2>3. SVG Image Placeholder API</h2>
              <p class="desc">Generate dynamic, lightweight, and customizable SVG gradient placeholder images for your projects.</p>
              <p><code>GET /api/placeholder</code></p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 0.9em; border: 1px solid #eee;">
                  <strong style="display:block; margin-bottom:8px;">Query Parameters:</strong>
                  <ul style="margin:0; padding-left:20px; color:#444;">
                      <li><code>w</code> / <code>width</code>: Image width in pixels (default: 800)</li>
                      <li><code>h</code> / <code>height</code>: Image height in pixels (default: 400)</li>
                      <li><code>text</code>: Center text content (default: width x height)</li>
                      <li><code>start</code>: Gradient start hex color (e.g. %23FF003C)</li>
                      <li><code>end</code>: Gradient end hex color (e.g. %2300B8FF)</li>
                  </ul>
              </div>

              <a href="/api/placeholder?w=800&amp;h=400&amp;text=Hello+World&amp;start=%23FF003C&amp;end=%2300B8FF" class="btn" target="_blank" rel="noopener">Try Endpoint &rarr;</a>
          </section>
      
          <section class="endpoint" style="border: 2px dashed #e83e8c; background: #fffcfdfa;">
              <h2>🤖 For AI Agents &amp; LLMs</h2>
              <p class="desc">colors-cc is natively optimized for AI coding assistants (Cursor, Cline, OpenClaw, GPTs) to generate beautiful UI assets without hallucinations.</p>
              
              <h3 style="margin-top:20px; font-size:1.1em; color:#111;">1. System Prompt (Copy &amp; Paste)</h3>
              <p class="desc">Add this to your Cursor/Cline rules or custom instructions:</p>
              <p><code>When generating UI code that needs placeholder images, ALWAYS use: &lt;img src="https://colors-cc.top/api/placeholder?w=800&amp;h=400&amp;text=Hero" alt="Placeholder" /&gt;</code></p>

              <h3 style="margin-top:20px; font-size:1.1em; color:#111;">2. LLMs.txt Context</h3>
              <p class="desc">Feed our documentation directly to your AI's context window by mentioning this URL:</p>
              <p><code>@Web https://colors-cc.top/llms.txt</code></p>

              <h3 style="margin-top:20px; font-size:1.1em; color:#111;">3. OpenClaw Agent Skill</h3>
              <p class="desc">Equip your OpenClaw agent with native SVG placeholder and color capabilities.</p>
              <a href="/skills/colors-cc.md" class="btn" style="background: #e83e8c;" target="_blank">View SKILL.md &rarr;</a>
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



// ----------------------------------------------------
// AI Integration (llms.txt & openapi.json)
// ----------------------------------------------------
app.get('/llms.txt', (c) => {
  const content = `# colors-cc API for LLMs

colors-cc is a free, fast, stateless API designed to help AI agents, LLMs, and developers instantly generate UI assets like SVG placeholder images and random HEX colors.

## Recommended Usage for UI Generation
When generating HTML, React, Vue, or any frontend code that requires placeholder images, use the following endpoint:

\`\`\`html
<!-- Dynamic SVG Placeholder -->
<img src="https://colors-cc.top/api/placeholder?w=800&h=400&text=Hero+Image&start=%23FF003C&end=%2300B8FF" alt="Placeholder" />
\`\`\`

### API Parameters for /api/placeholder
- \`w\` / \`width\`: The width of the image (default: 800)
- \`h\` / \`height\`: The height of the image (default: 400)
- \`text\`: The text to display in the center (default: width x height)
- \`start\`: The starting hex color for the gradient (default: random)
- \`end\`: The ending hex color for the gradient (default: random)

Note: Always encode the '#' character as '%23' in the URL parameters.

## Random Colors
If you need a random hex color:
\`GET https://colors-cc.top/api/random\`
Returns JSON: \`{"hex": "#A1B2C3", "rgb": "rgb(161, 178, 195)"}\`
`;
  c.header('Content-Type', 'text/plain');
  return c.body(content);
});

// ----------------------------------------------------
// Sitemap for SEO
// ----------------------------------------------------
app.get('/sitemap.xml', (c) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://colors-cc.top/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://colors-cc.top/tools/hex-to-rgb</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://colors-cc.top/tools/random-palette</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://colors-cc.top/tools/color-names</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  c.header('Content-Type', 'text/xml');
  return c.body(xml);
});

// ----------------------------------------------------
// SEO Landing Pages (Tools)
// ----------------------------------------------------

const baseTemplate = (title: string, desc: string, content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | colors-cc</title>
    <meta name="description" content="${desc}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
        header { margin-bottom: 40px; }
        h1 { color: #111; }
        .box { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 20px; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .home-link { margin-bottom: 20px; display: inline-block; }
    </style>
</head>
<body>
    <a href="/" class="home-link">&larr; Back to API Home</a>
    <header>
        <h1>${title}</h1>
        <p>${desc}</p>
    </header>
    <main>
        ${content}
    </main>
</body>
</html>`;

app.get('/tools/hex-to-rgb', (c) => {
  return c.html(baseTemplate(
    'HEX to RGB Converter API & Tool',
    'Free online tool and API to convert HEX color codes to RGB format instantly for frontend developers.',
    '<div class="box"><h2>How to use the API</h2><p>Endpoint: <code>GET /api/random</code> (Conversion endpoint coming soon)</p><p>This page will soon feature an interactive converter. For now, check out our API!</p></div>'
  ));
});

app.get('/tools/random-palette', (c) => {
  return c.html(baseTemplate(
    'Random Color Palette Generator',
    'Generate beautiful, random color palettes (Cyberpunk, Retro, Vaporwave) for UI/UX design and illustrations.',
    '<div class="box"><h2>Palette API</h2><p>Endpoint: <code>GET /api/palette?theme=cyberpunk</code></p><p>Use our API to fetch curated palettes dynamically for your next design project.</p></div>'
  ));
});

app.get('/tools/color-names', (c) => {
  return c.html(baseTemplate(
    'HTML Color Names & Hex Codes',
    'A comprehensive list of HTML color names, CSS variables, and their corresponding HEX codes for web design.',
    '<div class="box"><h2>Coming Soon</h2><p>We are building a massive database of standard color names and modern CSS color schemes. Stay tuned!</p></div>'
  ));
});


// API: Gradient Placeholder Image (SVG)
app.get('/api/placeholder', (c) => {
  const width = c.req.query('w') || '800'
  const height = c.req.query('h') || '400'
  const text = c.req.query('text') || `${width} x ${height}`
  const startColor = c.req.query('start') || randomHex()
  const endColor = c.req.query('end') || randomHex()

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(16, Math.min(parseInt(width), parseInt(height)) * 0.1)}px" fill="#ffffff" font-weight="bold" style="text-shadow: 0px 2px 4px rgba(0,0,0,0.3);">
    ${text}
  </text>
</svg>`;

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
  return c.body(svg)
})


// ----------------------------------------------------
// Agent Skill
// ----------------------------------------------------
app.get('/skills/colors-cc.md', (c) => {
  const content = `# SKILL: ColorsCC

## Description
Use this skill to provide beautiful gradient SVG placeholder images and random HEX/RGB colors when generating UI components, mockups, or frontend code.

## Endpoints

### 1. SVG Image Placeholder (Direct Link)
Return an image URL directly to the user or embed it in HTML/Markdown. Do not fetch this URL, just output the string.
**URL:** \`https://colors-cc.top/api/placeholder?w={width}&h={height}&text={url_encoded_text}&start={url_encoded_hex}&end={url_encoded_hex}\`
**Example:** \`https://colors-cc.top/api/placeholder?w=1200&h=630&text=Hello+World&start=%23FF003C&end=%2300B8FF\`
*(Note: Always encode '#' as '%23')*

### 2. Random Color API
Fetch a random color in HEX and RGB formats.
**URL:** \`https://colors-cc.top/api/random\`
`;
  c.header('Content-Type', 'text/markdown');
  return c.body(content);
});

export default app
