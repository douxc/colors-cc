import { Hono } from 'hono'
import { Layout } from '../../templates/Layout'
import fluidDemoTemplate from '../../templates/fluid-demo.html'

const app = new Hono()

// Random Palette Generator
app.get('/random-palette', (c) => {
  const content = `
    <div class="box">
        <h2>Random Palette Generator</h2>
        <p class="desc" style="color: #666; margin-bottom: 20px;">Generate curated color palettes for UI/UX design. Choose a theme or get random palettes instantly.</p>
        
        <div style="margin: 20px 0;">
            <label style="font-weight: bold; display: block; margin-bottom: 10px;">Theme:</label>
            <select id="theme-select" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd; width: 200px; font-size: 1em;">
                <option value="cyberpunk">Cyberpunk</option>
                <option value="vaporwave">Vaporwave</option>
                <option value="retro">Retro</option>
                <option value="monochrome">Monochrome</option>
            </select>
        </div>
        
        <div id="palette-display" style="display: flex; gap: 10px; margin: 20px 0; min-height: 120px; flex-wrap: wrap;"></div>
        <button id="refresh-btn" class="btn" style="border:none; cursor:pointer; background: #111; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 500;">&orarr; Generate New Palette</button>
        
        <div style="margin-top: 35px; border-top: 1px solid #eee; padding-top: 20px;">
            <h3>API Access</h3>
            <p class="desc">Endpoint: <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; color: #e83e8c;">GET /api/palette?theme=cyberpunk</code></p>
            <p class="desc" style="margin-top: 10px;">Available themes: <code>cyberpunk</code>, <code>vaporwave</code>, <code>retro</code>, <code>monochrome</code></p>
        </div>
    </div>
    <script>
        const paletteDisplay = document.getElementById('palette-display');
        const refreshBtn = document.getElementById('refresh-btn');
        const themeSelect = document.getElementById('theme-select');

        async function loadPalette() {
            const theme = themeSelect.value;
            try {
                const res = await fetch('/api/palette?theme=' + theme);
                const data = await res.json();
                renderPalette(data.colors);
            } catch(e) {
                console.error('Failed to load palette:', e);
            }
        }

        function renderPalette(colors) {
            paletteDisplay.innerHTML = '';
            colors.forEach(hex => {
                const card = document.createElement('div');
                card.style.cssText = 'flex: 1; min-width: 80px; height: 120px; background: ' + hex + '; border-radius: 8px; display: flex; align-items: flex-end; justify-content: center; padding: 10px; cursor: pointer; transition: transform 0.2s; border: 1px solid rgba(0,0,0,0.1);';
                card.title = 'Click to copy ' + hex;
                
                const label = document.createElement('div');
                label.innerText = hex;
                label.style.cssText = 'background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-family: monospace; font-weight: bold;';
                
                card.appendChild(label);
                card.onclick = () => {
                    navigator.clipboard.writeText(hex);
                    const originalText = label.innerText;
                    label.innerText = 'COPIED!';
                    label.style.background = 'rgba(232, 62, 140, 0.9)';
                    setTimeout(() => {
                        label.innerText = originalText;
                        label.style.background = 'rgba(0,0,0,0.7)';
                    }, 800);
                };
                card.onmouseover = () => card.style.transform = 'scale(1.05)';
                card.onmouseout = () => card.style.transform = 'scale(1)';
                
                paletteDisplay.appendChild(card);
            });
        }

        themeSelect.onchange = loadPalette;
        refreshBtn.onclick = loadPalette;

        loadPalette();
    </script>
  `
  return c.html(<Layout title="Random Color Palette Generator" desc="Generate beautiful, random color palettes (Cyberpunk, Retro, Vaporwave) for UI/UX design and illustrations." path="/tools/random-palette"><div dangerouslySetInnerHTML={{ __html: content }} /></Layout>)
})

// Color Names Reference
app.get('/color-names', (c) => {
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
  `
  return c.html(<Layout title="HTML Color Names & Hex Codes" desc="A comprehensive list of HTML color names, CSS variables, and their corresponding HEX codes for web design." path="/tools/color-names"><div dangerouslySetInnerHTML={{ __html: content }} /></Layout>)
})

// Fluid Demo
app.get('/fluid-demo', (c) => {
  return c.html(fluidDemoTemplate)
})

// Universal Converter and conversion pages
app.get('/:conversion', (c) => {
  const conversion = c.req.param('conversion')
  const validFormats = ['hex', 'rgb', 'hsl', 'cmyk']
  
  let from = 'Color'
  let to = 'Color'
  let title = 'Universal Color Converter'
  let desc = 'Free online tool and API to convert between HEX, RGB, HSL, and CMYK formats instantly.'
  
  if (conversion.includes('-to-')) {
    const parts = conversion.split('-to-')
    if (parts.length === 2 && validFormats.includes(parts[0]) && validFormats.includes(parts[1])) {
      from = parts[0].toUpperCase()
      to = parts[1].toUpperCase()
      title = `${from} to ${to} Converter`
      desc = `Free online ${from} to ${to} color converter. Instantly translate ${from} codes to ${to} format for web design and frontend development.`
    } else {
      return c.notFound()
    }
  } else if (conversion !== 'converter') {
    return c.notFound()
  }

  const linksHtml = validFormats.flatMap(f1 => 
    validFormats.filter(f2 => f1 !== f2).map(f2 => 
      `<a href="/tools/${f1}-to-${f2}" class="btn" style="background: #f8f9fa; color: #333; border: 1px solid #ddd; margin: 5px; font-size: 0.85em; padding: 6px 12px;">${f1.toUpperCase()} to ${f2.toUpperCase()}</a>`
    )
  ).join('')

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
                }, 300);
            });
        });
    </script>
  `
  return c.html(<Layout title={title} desc={desc} path={`/tools/${conversion}`}><div dangerouslySetInnerHTML={{ __html: content }} /></Layout>)
})

export default app
