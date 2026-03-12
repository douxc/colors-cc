import { Hono } from 'hono'
import { cors } from 'hono/cors'

import homeTemplate from './templates/home.html'
import { Layout } from './templates/Layout'
import fluidDemoTemplate from './templates/fluid-demo.html'




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


function hexToHsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255, g = parseInt(result[2], 16) / 255, b = parseInt(result[3], 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function hexToCmyk(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255, g = parseInt(result[2], 16) / 255, b = parseInt(result[3], 16) / 255;
  let k = 1 - Math.max(r, g, b);
  if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
  let c = (1 - r - k) / (1 - k);
  let m = (1 - g - k) / (1 - k);
  let y = (1 - b - k) / (1 - k);
  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
}


// Color Parsing Helpers
function parseRgbToHex(rgbStr: string) {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return null;
  const r = parseInt(match[0]), g = parseInt(match[1]), b = parseInt(match[2]);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function parseHslToHex(hslStr: string) {
  const match = hslStr.match(/\d+/g);
  if (!match || match.length < 3) return null;
  let h = parseInt(match[0]) / 360, s = parseInt(match[1]) / 100, l = parseInt(match[2]) / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return "#" + (toHex(r) + toHex(g) + toHex(b)).toUpperCase();
}

function parseCmykToHex(cmykStr: string) {
  const match = cmykStr.match(/\d+/g);
  if (!match || match.length < 4) return null;
  let c = parseInt(match[0]) / 100, m = parseInt(match[1]) / 100, y = parseInt(match[2]) / 100, k = parseInt(match[3]) / 100;
  let r = 255 * (1 - c) * (1 - k);
  let g = 255 * (1 - m) * (1 - k);
  let b = 255 * (1 - y) * (1 - k);
  const toHex = (x: number) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return "#" + (toHex(r) + toHex(g) + toHex(b)).toUpperCase();
}

function normalizeToHex(query: any) {
  if (query.hex) {
    let hex = query.hex;
    if (!hex.startsWith('#')) hex = '#' + hex;
    return /^#[0-9A-F]{6}$/i.test(hex) ? hex : null;
  }
  if (query.rgb) return parseRgbToHex(query.rgb);
  if (query.hsl) return parseHslToHex(query.hsl);
  if (query.cmyk) return parseCmykToHex(query.cmyk);
  return null;
}

// ----------------------------------------------------
// 1. Frontend HTML (SEO Optimized Landing Page)
// ----------------------------------------------------
app.get('/', (c) => {
  const html = homeTemplate
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

// API: Convert HEX to RGB
app.get('/api/convert', (c) => {
  const query = c.req.query();
  if (!query.hex && !query.rgb && !query.hsl && !query.cmyk) {
    return c.json({ error: 'Missing color parameter (hex, rgb, hsl, or cmyk)' }, 400);
  }
  
  const baseHex = normalizeToHex(query);
  if (!baseHex) return c.json({ error: 'Invalid color format' }, 400);

  const rgb = hexToRgb(baseHex);
  const hsl = hexToHsl(baseHex);
  const cmyk = hexToCmyk(baseHex);

  return c.json({ hex: baseHex, rgb, hsl, cmyk });
});

// API: All Color Names
app.get('/api/all-names', (c) => {
  const colorNames: Record<string, string> = {
    "AliceBlue": "#F0F8FF", "AntiqueWhite": "#FAEBD7", "Aqua": "#00FFFF", "Aquamarine": "#7FFFD4", "Azure": "#F0FFFF",
    "Beige": "#F5F5DC", "Bisque": "#FFE4C4", "Black": "#000000", "BlanchedAlmond": "#FFEBCD", "Blue": "#0000FF", "BlueViolet": "#8A2BE2", "Brown": "#A52A2A", "BurlyWood": "#DEB887",
    "CadetBlue": "#5F9EA0", "Chartreuse": "#7FFF00", "Chocolate": "#D2691E", "Coral": "#FF7F50", "CornflowerBlue": "#6495ED", "Cornsilk": "#FFF8DC", "Crimson": "#DC143C", "Cyan": "#00FFFF",
    "DarkBlue": "#00008B", "DarkCyan": "#008B8B", "DarkGoldenRod": "#B8860B", "DarkGray": "#A9A9A9", "DarkGreen": "#006400", "DarkKhaki": "#BDB76B", "DarkMagenta": "#8B008B", "DarkOliveGreen": "#556B2F",
    "DarkOrange": "#FF8C00", "DarkOrchid": "#9932CC", "DarkRed": "#8B0000", "DarkSalmon": "#E9967A", "DarkSeaGreen": "#8FBC8F", "DarkSlateBlue": "#483D8B", "DarkSlateGray": "#2F4F4F", "DarkTurquoise": "#00CED1", "DarkViolet": "#9400D3", "DeepPink": "#FF1493", "DeepSkyBlue": "#00BFFF", "DimGray": "#696969", "DodgerBlue": "#1E90FF",
    "FireBrick": "#B22222", "FloralWhite": "#FFFAF0", "ForestGreen": "#228B22", "Fuchsia": "#FF00FF",
    "Gainsboro": "#DCDCDC", "GhostWhite": "#F8F8FF", "Gold": "#FFD700", "GoldenRod": "#DAA520", "Gray": "#808080", "Green": "#008000", "GreenYellow": "#ADFF2F",
    "HoneyDew": "#F0FFF0", "HotPink": "#FF69B4", "IndianRed": "#CD5C5C", "Indigo": "#4B0082", "Ivory": "#FFFFF0", "Khaki": "#F0E68C",
    "Lavender": "#E6E6FA", "LavenderBlush": "#FFF0F5", "LawnGreen": "#7CFC00", "LemonChiffon": "#FFFACD", "LightBlue": "#ADD8E6", "LightCoral": "#F08080", "LightCyan": "#E0FFFF", "LightGoldenRodYellow": "#FAFAD2", "LightGray": "#D3D3D3", "LightGreen": "#90EE90", "LightPink": "#FFB6C1", "LightSalmon": "#FFA07A", "LightSeaGreen": "#20B2AA", "LightSkyBlue": "#87CEFA", "LightSlateGray": "#778899", "LightSteelBlue": "#B0C4DE", "LightYellow": "#FFFFE0", "Lime": "#00FF00", "LimeGreen": "#32CD32", "Linen": "#FAF0E6",
    "Magenta": "#FF00FF", "Maroon": "#800000", "MediumAquaMarine": "#66CDAA", "MediumBlue": "#0000CD", "MediumOrchid": "#BA55D3", "MediumPurple": "#9370DB", "MediumSeaGreen": "#3CB371", "MediumSlateBlue": "#7B68EE", "MediumSpringGreen": "#00FA9A", "MediumTurquoise": "#48D1CC", "MediumVioletRed": "#C71585", "MidnightBlue": "#191970", "MintCream": "#F5FFFA", "MistyRose": "#FFE4E1", "Moccasin": "#FFE4B5",
    "NavajoWhite": "#FFDEAD", "Navy": "#000080", "OldLace": "#FDF5E6", "Olive": "#808000", "OliveDrab": "#6B8E23", "Orange": "#FFA500", "OrangeRed": "#FF4500", "Orchid": "#DA70D6",
    "PaleGoldenRod": "#EEE8AA", "PaleGreen": "#98FB98", "PaleTurquoise": "#AFEEEE", "PaleVioletRed": "#DB7093", "PapayaWhip": "#FFEFD5", "PeachPuff": "#FFDAB9", "Peru": "#CD853F", "Pink": "#FFC0CB", "Plum": "#DDA0DD", "PowderBlue": "#B0E0E6", "Purple": "#800080",
    "RebeccaPurple": "#663399", "Red": "#FF0000", "RosyBrown": "#BC8F8F", "RoyalBlue": "#4169E1",
    "SaddleBrown": "#8B4513", "Salmon": "#FA8072", "SandyBrown": "#F4A460", "SeaGreen": "#2E8B57", "SeaShell": "#FFF5EE", "Sienna": "#A0522D", "Silver": "#C0C0C0", "SkyBlue": "#87CEEB", "SlateBlue": "#6A5ACD", "SlateGray": "#708090", "Snow": "#FFFAFA", "SpringGreen": "#00FF7F", "SteelBlue": "#4682B4",
    "Tan": "#D2B48C", "Teal": "#008080", "Thistle": "#D8BFD8", "Tomato": "#FF6347", "Turquoise": "#40E0D0",
    "Violet": "#EE82EE", "Wheat": "#F5DEB3", "White": "#FFFFFF", "WhiteSmoke": "#F5F5F5", "Yellow": "#FFFF00", "YellowGreen": "#9ACD32"
  };
  return c.json(colorNames);
});



// ----------------------------------------------------
// AI Integration (llms.txt & openapi.json)
// ----------------------------------------------------
app.get('/llms.txt', (c) => {
  const content = "# colors-cc.top - Agent & LLM Documentation\n> A free, stateless API designed for AI Agents to generate UI assets, palettes, and colors.\n\n## Base URL\nhttps://colors-cc.top\n\n## Golden Rules for Agents\n1. DO NOT HALLUCINATE PARAMETERS. Only use the parameters listed below.\n2. ENCODE HEX COLORS. The '#' symbol MUST be encoded as '%23' in URLs.\n3. INLINE IMAGES. Use Markdown `![alt](url)` or HTML `<img>` directly; do not fetch image endpoints yourself.\n\n## API Endpoints\n\n### 1. SVG Gradient Placeholder\nGenerate dynamic, lightweight SVG gradient images.\n`GET /api/placeholder?w={width}&h={height}&text={url_encoded_text}&start={hex_encoded}&end={hex_encoded}`\n- `w`: Width (default: 800)\n- `h`: Height (default: 400)\n- `text`: Center text (default: width x height)\n- `start`: Start gradient hex (default: random)\n- `end`: End gradient hex (default: random)\n\n### 2. Random Color\n`GET /api/random`\nReturns JSON: `{\"hex\": \"#A1B2C3\", \"rgb\": \"rgb(161, 178, 195)\"}`\n\n### 3. Color Palette\n`GET /api/palette?theme={theme_name}`\n- `theme` options: `cyberpunk`, `vaporwave`, `retro`, `monochrome` (default: cyberpunk)\nReturns JSON array of hex codes.\n\n### 4. Color Converter\n`GET /api/convert?hex={hex_encoded}`\nReturns JSON: `{\"hex\": \"#FFFFFF\", \"rgb\": \"rgb(255, 255, 255)\", \"error\": null}`\n\n### 5. Color Names Directory\n`GET /api/all-names`\nReturns JSON mapping of standard CSS color names to their HEX values.\n";
  c.header('Content-Type', 'text/plain; charset=utf-8');
  return c.body(content);
});

// ----------------------------------------------------
// OpenAPI Spec
// ----------------------------------------------------
app.get('/openapi.json', (c) => {
  const spec = {
    "openapi": "3.0.0",
    "info": {
      "title": "colors-cc API",
      "version": "1.0.0",
      "description": "A stateless API for random colors, palettes, and SVG placeholder generation."
    },
    "servers": [{"url": "https://colors-cc.top"}],
    "paths": {
      "/api/random": {
        "get": {
          "summary": "Get a random HEX and RGB color",
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {"application/json": {"schema": {"type": "object", "properties": {"hex": {"type": "string"}, "rgb": {"type": "string"}, "hsl": {"type": "string"}, "cmyk": {"type": "string"}}}}}
            }
          }
        }
      },
      "/api/palette": {
        "get": {
          "summary": "Get a curated color palette",
          "parameters": [{"name": "theme", "in": "query", "schema": {"type": "string", "enum": ["cyberpunk", "vaporwave", "retro", "monochrome"]}}],
          "responses": {
            "200": { "description": "JSON array of HEX codes" }
          }
        }
      },
      "/api/placeholder": {
        "get": {
          "summary": "Generate SVG placeholder image",
          "parameters": [
            {"name": "w", "in": "query", "schema": {"type": "integer"}},
            {"name": "h", "in": "query", "schema": {"type": "integer"}},
            {"name": "text", "in": "query", "schema": {"type": "string"}},
            {"name": "start", "in": "query", "schema": {"type": "string"}},
            {"name": "end", "in": "query", "schema": {"type": "string"}}
          ],
          "responses": {
            "200": { "description": "SVG Image", "content": {"image/svg+xml": {}} }
          }
        }
      }
    }
  };
  return c.json(spec);
});

// ----------------------------------------------------
// Sitemap for SEO
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
    <loc>https://colors-cc.top/tools/converter</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url><loc>https://colors-cc.top/tools/hex-to-rgb</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hex-to-hsl</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hex-to-cmyk</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/rgb-to-hex</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/rgb-to-hsl</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hsl-to-hex</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hsl-to-rgb</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/cmyk-to-hex</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/cmyk-to-rgb</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
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


app.get('/tools/random-palette', (c) => {
  const content = `
    <div class="box">
        <h2>Random Palette Generator</h2>
        <div id="palette-display" style="display: flex; gap: 10px; margin: 20px 0; min-height: 100px;"></div>
        <button id="refresh-btn" class="btn" style="border:none; cursor:pointer;">&orarr; Generate New Palette</button>
        <div style="margin-top: 25px;">
            <h3>API Access</h3>
            <p class="desc">Endpoint: <code>GET /api/palette?theme=cyberpunk</code></p>
        </div>
    </div>
    <script>
        const demoBox = document.getElementById('demo-box');
        const themeSelect = document.getElementById('theme-select');
        const speedRange = document.getElementById('speed-range');
        const stopsInput = document.getElementById('stops-input');
        const urlOutput = document.getElementById('url-output');

        const themes = {
            aurora: "#00FF41, #00B8FF, #7000FF",
            cyberpunk: "#FCEE09, #FF003C, #00B8FF",
            ocean: "#01CDFE, #05FFA1, #B967FF",
            sunset: "#FF71CE, #FFFB96, #E24E1B"
        };

        function generateSVG() {
            const stops = stopsInput.value.split(',').map(s => s.trim().replace('#', '%23'));
            const speed = speedRange.value;
            
            let stopsHtml = '';
            for (let i = 0; i < stops.length; i++) {
                const hex = stops[i].replace('%23', '#');
                const valuesArr = [];
                for (let j = 0; j < stops.length; j++) {
                    valuesArr.push(stops[(i + j) % stops.length].replace('%23', '#'));
                }
                const values = valuesArr.join(';');
                const offset = (i / (stops.length - 1)) * 100;
                stopsHtml += '<stop offset="' + offset + '%" stop-color="' + hex + '">' +
                             '<animate attributeName="stop-color" values="' + values + ';' + hex + '" dur="' + speed + 's" repeatCount="indefinite" />' +
                             '</stop>';
            }

            const svgContent = '<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">' +
                '<defs>' +
                    '<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
                        stopsHtml +
                    '</linearGradient>' +
                '</defs>' +
                '<rect width="100%" height="100%" fill="url(#g)" />' +
            '</svg>';
            
            const blob = new Blob([svgContent], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            demoBox.style.backgroundImage = 'url(' + url + ')';
            demoBox.style.backgroundSize = 'cover';
            
            const apiURL = 'https://colors-cc.top/api/placeholder?w=800&h=400&fluid=true&speed=' + speed + '&stops=' + stops.join(',');
            urlOutput.innerText = apiURL;
        }

        themeSelect.onchange = () => {
            stopsInput.value = themes[themeSelect.value];
            generateSVG();
        };

        [speedRange, stopsInput].forEach(el => el.oninput = generateSVG);

        generateSVG();
</script>
  `;
  return c.html(<Layout title="Random Color Palette Generator" desc="Generate beautiful, random color palettes (Cyberpunk, Retro, Vaporwave) for UI/UX design and illustrations."><div dangerouslySetInnerHTML={{ __html: content }} /></Layout>);
});

app.get('/tools/color-names', (c) => {
  const content = `
    <div class="box">
        <h2>HTML Color Names Reference</h2>
        <p class="desc">Quickly find standard CSS/HTML color names and their HEX values.</p>
        
        <div style="margin: 20px 0;">
            <input type="text" id="colorSearch" placeholder="Search color names (e.g. Blue, Pink)..." style="padding: 12px; border-radius: 8px; border: 1px solid #ddd; width: 100%; font-size: 1em; box-sizing: border-box;">
        </div>

        <div id="colorGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 20px;">
            <!-- Colors will be injected here -->
        </div>

        <div style="margin-top: 35px; border-top: 1px solid #eee; padding-top: 20px;">
            <h3>API Access</h3>
            <p class="desc">Get all color names as JSON: <code>GET /api/all-names</code></p>
        </div>
    </div>

    <script>
        const colorGrid = document.getElementById('colorGrid');
        const colorSearch = document.getElementById('colorSearch');
        let allColors = {};

        async function loadColors() {
            const res = await fetch('/api/all-names');
            allColors = await res.json();
            renderColors(allColors);
        }

        function renderColors(colors) {
            colorGrid.innerHTML = '';
            Object.entries(colors).forEach(([name, hex]) => {
                const card = document.createElement('div');
                card.style.padding = '10px';
                card.style.background = '#fff';
                card.style.border = '1px solid #eee';
                card.style.borderRadius = '8px';
                card.style.textAlign = 'center';
                card.style.cursor = 'pointer';
                card.title = 'Click to copy HEX';
                
                const swatch = document.createElement('div');
                swatch.style.height = '60px';
                swatch.style.background = hex;
                swatch.style.borderRadius = '4px';
                swatch.style.marginBottom = '8px';
                swatch.style.border = '1px solid rgba(0,0,0,0.05)';
                
                const nameLabel = document.createElement('div');
                nameLabel.innerText = name;
                nameLabel.style.fontSize = '0.85em';
                nameLabel.style.fontWeight = 'bold';
                nameLabel.style.color = '#333';
                
                const hexLabel = document.createElement('div');
                hexLabel.innerText = hex;
                hexLabel.style.fontSize = '0.75em';
                hexLabel.style.color = '#999';
                hexLabel.style.fontFamily = 'monospace';

                card.onclick = () => {
                    navigator.clipboard.writeText(hex);
                    const originalHex = hexLabel.innerText;
                    hexLabel.innerText = 'COPIED!';
                    hexLabel.style.color = '#e83e8c';
                    setTimeout(() => {
                        hexLabel.innerText = originalHex;
                        hexLabel.style.color = '#999';
                    }, 800);
                };

                card.appendChild(swatch);
                card.appendChild(nameLabel);
                card.appendChild(hexLabel);
                colorGrid.appendChild(card);
            });
        }

        colorSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = Object.fromEntries(
                Object.entries(allColors).filter(([name]) => name.toLowerCase().includes(term))
            );
            renderColors(filtered);
        });

        loadColors();
    </script>
  `;
  return c.html(<Layout title="HTML Color Names & Hex Codes" desc="A comprehensive list of HTML color names, CSS variables, and their corresponding HEX codes for web design."><div dangerouslySetInnerHTML={{ __html: content }} /></Layout>);
});

app.get('/tools/fluid-demo', (c) => {
  const html = fluidDemoTemplate
  return c.html(html);
});

app.get('/tools/:conversion', (c) => {
  const conversion = c.req.param('conversion');
  const validFormats = ['hex', 'rgb', 'hsl', 'cmyk'];
  
  // Basic validation or fallback
  let from = 'Color';
  let to = 'Color';
  let title = 'Universal Color Converter';
  let desc = 'Free online tool and API to convert between HEX, RGB, HSL, and CMYK formats instantly.';
  
  if (conversion.includes('-to-')) {
    const parts = conversion.split('-to-');
    if (parts.length === 2 && validFormats.includes(parts[0]) && validFormats.includes(parts[1])) {
      from = parts[0].toUpperCase();
      to = parts[1].toUpperCase();
      title = `${from} to ${to} Converter`;
      desc = `Free online ${from} to ${to} color converter. Instantly translate ${from} codes to ${to} format for web design and frontend development.`;
    } else {
      return c.notFound();
    }
  } else if (conversion !== 'converter') {
    return c.notFound();
  }

  const linksHtml = validFormats.flatMap(f1 => 
    validFormats.filter(f2 => f1 !== f2).map(f2 => 
      `<a href="/tools/${f1}-to-${f2}" class="btn" style="background: #f8f9fa; color: #333; border: 1px solid #ddd; margin: 5px; font-size: 0.85em; padding: 6px 12px;">${f1.toUpperCase()} to ${f2.toUpperCase()}</a>`
    )
  ).join('');


  const content = `
    <div class="box">
        <h2>${title}</h2>
        <p class="desc">Enter a value in any format below. All others will update instantly.</p>
        <div style="margin: 20px 0; display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="width: 50px; font-weight: bold;">HEX</label>
                <input type="text" id="hexInput" placeholder="#FFFFFF" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; width: 120px; font-family: monospace; font-size: 1.1em;">
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="width: 50px; font-weight: bold;">RGB</label>
                <input type="text" id="rgbInput" placeholder="rgb(255, 255, 255)" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; width: 200px; font-family: monospace; font-size: 1.1em;">
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="width: 50px; font-weight: bold;">HSL</label>
                <input type="text" id="hslInput" placeholder="hsl(0, 0%, 100%)" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; width: 200px; font-family: monospace; font-size: 1.1em;">
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="width: 50px; font-weight: bold;">CMYK</label>
                <input type="text" id="cmykInput" placeholder="cmyk(0%, 0%, 0%, 0%)" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; width: 220px; font-family: monospace; font-size: 1.1em;">
            </div>
        </div>
        <div id="preview" style="width: 100%; height: 50px; border-radius: 8px; border: 1px solid #eee; background: #fff; margin-bottom: 20px;"></div>
        <p class="desc">API Endpoint: <code>GET /api/convert?hex=%23FF5733</code> or <code>?rgb=255,87,51</code> etc.</p>
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <h3 style="font-size: 1.1em; color: #555; margin-bottom: 15px;">More Conversions</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${linksHtml}
            </div>
        </div>
    </div>
    <script>
        const inputs = {
            hex: document.getElementById('hexInput'),
            rgb: document.getElementById('rgbInput'),
            hsl: document.getElementById('hslInput'),
            cmyk: document.getElementById('cmykInput')
        };
        const preview = document.getElementById('preview');

        // Helper conversion functions on client side
        function hexToRgb(hex) {
            const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
            return result ? \`rgb(\${parseInt(result[1], 16)}, \${parseInt(result[2], 16)}, \${parseInt(result[3], 16)})\` : null;
        }

        async function updateColors(source, value) {
            if (!value) return;
            let param = encodeURIComponent(value);
            if (source === 'hex' && !value.startsWith('#')) param = '%23' + value;
            
            try {
                const res = await fetch(\`/api/convert?\${source}=\${param}\`);
                const data = await res.json();
                if (data.hex) {
                    if (source !== 'hex') inputs.hex.value = data.hex;
                    if (source !== 'rgb') inputs.rgb.value = data.rgb;
                    if (source !== 'hsl') inputs.hsl.value = data.hsl;
                    if (source !== 'cmyk') inputs.cmyk.value = data.cmyk;
                    preview.style.backgroundColor = data.hex;
                }
            } catch(e) { console.error(e); }
        }

        let timeout;
        Object.keys(inputs).forEach(key => {
            inputs[key].addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    updateColors(key, e.target.value);
                }, 300); // debounce API call
            });
        });
    </script>
  `;
  return c.html(<Layout title={title} desc={desc}><div dangerouslySetInnerHTML={{ __html: content }} /></Layout>);
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
  const content = "# SKILL: ColorsCC\n\n## Description\nA native UI asset and color toolset for OpenClaw and other AI Agents. Use this when you need to mock up frontends, select palettes, or convert colors without hallucinating data.\n\n## Rules\n- When writing HTML/Markdown for the user, use `<img src=\"https://colors-cc.top/api/placeholder?w=...&start=%23...&end=%23...\">` directly.\n- Always encode `#` as `%23` in URLs.\n- Do NOT use tools to download the SVG image, just render the URL directly.\n\n## Capabilities\n\n### 1. SVG Gradient Placeholders (Direct embed)\n**Example URL**: `https://colors-cc.top/api/placeholder?w=1200&h=630&text=Hero+Banner&start=%23FF003C&end=%2300B8FF`\n\n### 2. Random Colors\n**Fetch via**: `curl https://colors-cc.top/api/random`\n\n### 3. Theme Palettes\n**Fetch via**: `curl \"https://colors-cc.top/api/palette?theme=cyberpunk\"`\nThemes: `cyberpunk`, `vaporwave`, `retro`, `monochrome`\n\n### 4. Hex to RGB Conversion\n**Fetch via**: `curl \"https://colors-cc.top/api/convert?hex=%23FF003C\"`\n";
  c.header('Content-Type', 'text/markdown; charset=utf-8');
  return c.body(content);
});

export default app