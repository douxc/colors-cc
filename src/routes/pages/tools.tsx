import { Hono } from 'hono'
import { ssgParams } from 'hono/ssg'
import {
  COLOR_FORMATS,
  PALETTE_THEMES,
  PLACEHOLDER_LIMITS,
  PLACEHOLDER_PRESETS
} from '../../contracts/colors-api'
import { localizeToolHtml } from '../../i18n'
import { localePrefix, type Locale, type SiteConfig } from '../../site'
import { Layout } from '../../templates/Layout'

const copyHelper = `
  async function copyValue(value, button, message) {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const area = document.createElement('textarea')
      area.value = value
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    const original = button.textContent
    button.textContent = message || 'Copied ✓'
    setTimeout(() => { button.textContent = original }, 1400)
  }
`

export const createToolsRoute = (config: SiteConfig, locale: Locale): Hono => {
const app = new Hono()
const apiBaseUrl = config.apiBaseUrl
const prefix = localePrefix(locale)

app.get('/random-palette', (c) => {
  const themeOptions = PALETTE_THEMES
    .map(theme => `<option value="${theme}">${theme[0].toUpperCase()}${theme.slice(1)}</option>`)
    .join('')

  const content = localizeToolHtml(`
    <div class="tool-layout">
      <section class="panel tool-sticky" aria-labelledby="palette-controls-title">
        <header class="panel-header">
          <div>
            <h2 id="palette-controls-title">Palette controls</h2>
            <p>Choose a visual direction, then regenerate variations.</p>
          </div>
        </header>
        <div class="panel-body">
          <div class="field">
            <label for="theme-select">Theme</label>
            <select class="select" id="theme-select">${themeOptions}</select>
          </div>
          <button class="button button-primary button-block" id="refresh-btn" type="button" style="margin-top:18px">Generate palette</button>
          <div class="status" id="palette-status" role="status" aria-live="polite">Preparing palette…</div>
          <div class="inspector-section">
            <span class="section-label">API request</span>
            <pre class="code-surface" id="palette-endpoint"></pre>
            <button class="button button-small button-block" id="copy-endpoint" type="button" style="margin-top:9px">Copy request URL</button>
          </div>
        </div>
      </section>

      <section class="panel" aria-labelledby="palette-result-title">
        <header class="panel-header">
          <div>
            <h2 id="palette-result-title">Generated system</h2>
            <p>Click any swatch to copy its HEX value.</p>
          </div>
          <span class="signal-pill" id="palette-count">0 COLORS</span>
        </header>
        <div class="panel-body">
          <div class="palette-grid" id="palette-display" aria-label="Generated colors"></div>
        </div>
      </section>
    </div>

    <script>
      ${copyHelper}
      const paletteDisplay = document.getElementById('palette-display')
      const refreshButton = document.getElementById('refresh-btn')
      const themeSelect = document.getElementById('theme-select')
      const paletteStatus = document.getElementById('palette-status')
      const paletteCount = document.getElementById('palette-count')
      const paletteEndpoint = document.getElementById('palette-endpoint')
      const copyEndpoint = document.getElementById('copy-endpoint')

      function requestUrl() {
        return '${apiBaseUrl}/palette?theme=' + encodeURIComponent(themeSelect.value)
      }

      function renderPalette(colors) {
        paletteDisplay.replaceChildren()
        colors.forEach((hex, index) => {
          const swatch = document.createElement('button')
          swatch.type = 'button'
          swatch.className = 'palette-swatch'
          swatch.style.background = hex
          swatch.setAttribute('aria-label', 'Copy ' + hex + ', color ' + (index + 1))
          const code = document.createElement('span')
          code.className = 'swatch-code'
          code.textContent = hex
          swatch.appendChild(code)
          swatch.addEventListener('click', () => copyValue(hex, code, 'COPIED'))
          paletteDisplay.appendChild(swatch)
        })
        paletteCount.textContent = colors.length + ' COLORS'
      }

      async function loadPalette() {
        const url = requestUrl()
        paletteEndpoint.textContent = url
        refreshButton.disabled = true
        paletteStatus.textContent = 'Generating ' + themeSelect.value + ' palette…'
        paletteStatus.dataset.tone = ''
        try {
          const response = await fetch(url)
          if (!response.ok) throw new Error('HTTP ' + response.status)
          const data = await response.json()
          if (!Array.isArray(data.colors)) throw new Error('Invalid response')
          renderPalette(data.colors)
          paletteStatus.textContent = 'Ready · ' + data.colors.length + ' colors from the edge'
          paletteStatus.dataset.tone = 'success'
        } catch (error) {
          paletteDisplay.replaceChildren()
          paletteCount.textContent = '0 COLORS'
          paletteStatus.textContent = 'Palette could not load. Check your connection and try again.'
          paletteStatus.dataset.tone = 'error'
        } finally {
          refreshButton.disabled = false
        }
      }

      themeSelect.addEventListener('change', loadPalette)
      refreshButton.addEventListener('click', loadPalette)
      copyEndpoint.addEventListener('click', () => copyValue(requestUrl(), copyEndpoint, 'Request copied ✓'))
      loadPalette()
    </script>
  `, locale)

  return c.html(
    <Layout
      config={config}
      locale={locale}
      title={localizeToolHtml('Curated palette generator', locale)}
      desc={localizeToolHtml('Generate theme-driven color systems, inspect them visually, and copy the exact API request or individual HEX values.', locale)}
      path="/tools/random-palette"
      eyebrow={localizeToolHtml('Explore · Palette', locale)}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>
  )
})

app.get('/color-names', (c) => {
  const content = localizeToolHtml(`
    <section class="panel" aria-labelledby="color-atlas-title" style="margin-bottom:72px">
      <header class="panel-header">
        <div>
          <h2 id="color-atlas-title">CSS color atlas</h2>
          <p>Search by name and copy a standards-based HEX value.</p>
        </div>
        <span class="signal-pill" id="color-count">LOADING</span>
      </header>
      <div class="panel-body">
        <div class="field">
          <label for="color-search">Search color names</label>
          <input class="input" type="search" id="color-search" placeholder="Try Tomato, Slate, or Blue…" autocomplete="off">
        </div>
        <div class="status" id="color-status" role="status" aria-live="polite">Loading CSS color names…</div>
        <div class="color-grid" id="color-grid" aria-label="CSS color search results" style="margin-top:18px"></div>
      </div>
    </section>

    <script>
      ${copyHelper}
      const colorGrid = document.getElementById('color-grid')
      const colorSearch = document.getElementById('color-search')
      const colorStatus = document.getElementById('color-status')
      const colorCount = document.getElementById('color-count')
      let allColors = []

      function renderColors(colors) {
        colorGrid.replaceChildren()
        colors.forEach(([name, hex]) => {
          const card = document.createElement('button')
          card.type = 'button'
          card.className = 'color-card'
          card.setAttribute('aria-label', 'Copy ' + name + ' ' + hex)
          card.innerHTML = '<span class="color-card-swatch" style="display:block;background:' + hex + '"></span><span class="color-card-meta"><span class="color-card-name">' + name + '</span><span class="color-card-code">' + hex + '</span></span>'
          card.addEventListener('click', () => {
            copyValue(hex, card.querySelector('.color-card-code'), 'COPIED')
            colorStatus.textContent = name + ' · ' + hex + ' copied'
            colorStatus.dataset.tone = 'success'
          })
          colorGrid.appendChild(card)
        })
        colorCount.textContent = colors.length + ' COLORS'
        colorStatus.textContent = colors.length ? 'Showing ' + colors.length + ' named colors' : 'No named colors match your search.'
        colorStatus.dataset.tone = colors.length ? '' : 'error'
      }

      async function loadColors() {
        try {
          const response = await fetch('${apiBaseUrl}/all-names')
          if (!response.ok) throw new Error('HTTP ' + response.status)
          const data = await response.json()
          allColors = Object.entries(data)
          renderColors(allColors)
        } catch (error) {
          colorCount.textContent = 'UNAVAILABLE'
          colorStatus.textContent = 'Color names could not load. Refresh the page to retry.'
          colorStatus.dataset.tone = 'error'
        }
      }

      colorSearch.addEventListener('input', () => {
        const term = colorSearch.value.trim().toLowerCase()
        renderColors(allColors.filter(([name]) => name.toLowerCase().includes(term)))
      })
      loadColors()
    </script>
  `, locale)

  return c.html(
    <Layout
      config={config}
      locale={locale}
      title={localizeToolHtml('CSS color atlas', locale)}
      desc={localizeToolHtml('Search the complete CSS named-color directory and copy precise, machine-readable HEX values.', locale)}
      path="/tools/color-names"
      eyebrow={localizeToolHtml('Reference · Color names', locale)}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>
  )
})

app.get('/fluid-placeholder', (c) => {
  const presetButtons = PLACEHOLDER_PRESETS.map((preset, index) => {
    const colors = preset.colors.join(',')
    return `<button class="preset" type="button" data-palette="${colors}" aria-pressed="${index === 0}" aria-label="Use ${preset.name} palette"><span class="preset-color" style="display:block;background:linear-gradient(135deg,${colors})"></span><span class="preset-name">${preset.name}</span></button>`
  }).join('')

  const content = localizeToolHtml(`
    <div class="tool-layout">
      <section class="panel tool-sticky" aria-labelledby="fluid-controls-title">
        <header class="panel-header">
          <div>
            <h2 id="fluid-controls-title">Animation controls</h2>
            <p>Compose a fluid SVG with a deterministic URL.</p>
          </div>
        </header>
        <div class="panel-body">
          <div class="field">
            <span class="field-label">Palette preset</span>
            <div class="preset-grid" id="fluid-presets">${presetButtons}</div>
          </div>
          <div class="field">
            <label for="fluid-palette">Custom HEX colors</label>
            <input class="input input-mono" id="fluid-palette" value="${PLACEHOLDER_PRESETS[0].colors.join(', ')}" autocomplete="off" spellcheck="false">
          </div>
          <div class="field">
            <div class="range-head"><label for="fluid-speed">Animation duration</label><output id="fluid-speed-value">${PLACEHOLDER_LIMITS.speed.default}s</output></div>
            <input id="fluid-speed" type="range" min="${PLACEHOLDER_LIMITS.speed.min}" max="${PLACEHOLDER_LIMITS.speed.max}" value="${PLACEHOLDER_LIMITS.speed.default}">
          </div>
          <div class="field">
            <label for="fluid-text">Center label <span class="field-hint">optional</span></label>
            <input class="input" id="fluid-text" maxlength="${PLACEHOLDER_LIMITS.textMaxLength}" placeholder="Flow state" autocomplete="off">
          </div>
          <div class="status" id="fluid-status" role="status" aria-live="polite">Rendering preview…</div>
        </div>
      </section>

      <section class="panel" aria-labelledby="fluid-preview-title">
        <header class="panel-header">
          <div>
            <h2 id="fluid-preview-title">Live animated SVG</h2>
            <p>Lightweight, infinitely looping, and ready to embed.</p>
          </div>
          <span class="signal-pill">SVG / EDGE</span>
        </header>
        <div class="panel-body">
          <div class="preview-frame" id="fluid-preview-frame">
            <img id="fluid-preview" src="" alt="Animated fluid gradient placeholder preview">
          </div>
          <div class="inspector-section">
            <span class="section-label">API URL</span>
            <pre class="code-surface" id="fluid-url"></pre>
            <button class="button button-primary" id="copy-fluid-url" type="button" style="margin-top:10px">Copy API URL</button>
          </div>
        </div>
      </section>
    </div>

    <script>
      ${copyHelper}
      const paletteInput = document.getElementById('fluid-palette')
      const speedInput = document.getElementById('fluid-speed')
      const speedOutput = document.getElementById('fluid-speed-value')
      const textInput = document.getElementById('fluid-text')
      const preview = document.getElementById('fluid-preview')
      const previewFrame = document.getElementById('fluid-preview-frame')
      const urlOutput = document.getElementById('fluid-url')
      const status = document.getElementById('fluid-status')
      const copyButton = document.getElementById('copy-fluid-url')
      const presetButtons = Array.from(document.querySelectorAll('#fluid-presets .preset'))
      let timer = null

      function parseColors(value) {
        return value.split(',').map(value => value.trim()).filter(value => /^#[0-9a-f]{6}$/i.test(value))
      }

      function buildFluidUrl() {
        const palette = parseColors(paletteInput.value).map(color => encodeURIComponent(color)).join(',')
        const text = textInput.value.trim()
        return '${apiBaseUrl}/fluid-placeholder?w=1200&h=600&palette=' + palette + '&speed=' + speedInput.value + (text ? '&text=' + encodeURIComponent(text) : '')
      }

      function render() {
        const colors = parseColors(paletteInput.value)
        speedOutput.textContent = speedInput.value + 's'
        if (colors.length < ${PLACEHOLDER_LIMITS.palette.min} || colors.length > ${PLACEHOLDER_LIMITS.palette.max}) {
          status.textContent = 'Enter between 2 and 10 valid six-digit HEX colors.'
          status.dataset.tone = 'error'
          return
        }
        const url = buildFluidUrl()
        urlOutput.textContent = url
        previewFrame.style.background = 'radial-gradient(circle, ' + colors.join(', ') + ', #080a10 72%)'
        status.textContent = 'Rendering preview…'
        status.dataset.tone = ''
        const image = new Image()
        image.onload = () => {
          preview.src = url
          status.textContent = 'Ready · animated SVG loaded'
          status.dataset.tone = 'success'
        }
        image.onerror = () => {
          status.textContent = 'Preview could not load. The API URL remains available below.'
          status.dataset.tone = 'error'
        }
        image.src = url
      }

      function schedule() { clearTimeout(timer); timer = setTimeout(render, 180) }
      presetButtons.forEach(button => button.addEventListener('click', () => {
        presetButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)))
        paletteInput.value = button.dataset.palette.replaceAll(',', ', ')
        render()
      }))
      paletteInput.addEventListener('change', render)
      speedInput.addEventListener('input', schedule)
      textInput.addEventListener('input', schedule)
      copyButton.addEventListener('click', () => copyValue(buildFluidUrl(), copyButton, 'API URL copied ✓'))
      render()
    </script>
  `, locale)

  return c.html(
    <Layout
      config={config}
      locale={locale}
      title={localizeToolHtml('Fluid SVG studio', locale)}
      desc={localizeToolHtml('Create smooth, animated gradient placeholders with exact palette, timing, text, and an embeddable API URL.', locale)}
      path="/tools/fluid-placeholder"
      eyebrow={localizeToolHtml('Create · Motion', locale)}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>
  )
})

app.get(
  '/:conversion',
  ssgParams(() => [
    { conversion: 'converter' },
    ...COLOR_FORMATS.flatMap(from =>
      COLOR_FORMATS.filter(to => to !== from).map(to => ({ conversion: `${from}-to-${to}` }))
    )
  ]),
  (c) => {
  const conversion = c.req.param('conversion')
  let title = localizeToolHtml('Universal color converter', locale)
  let desc = localizeToolHtml('Convert between HEX, RGB, HSL, and CMYK while keeping every representation synchronized.', locale)

  if (conversion.includes('-to-')) {
    const parts = conversion.split('-to-')
    if (
      parts.length !== 2 ||
      !COLOR_FORMATS.includes(parts[0] as typeof COLOR_FORMATS[number]) ||
      !COLOR_FORMATS.includes(parts[1] as typeof COLOR_FORMATS[number]) ||
      parts[0] === parts[1]
    ) {
      return c.notFound()
    }
    const from = parts[0].toUpperCase()
    const to = parts[1].toUpperCase()
    title = locale === 'zh' ? `${from} 转 ${to} 转换器` : `${from} to ${to} converter`
    desc = locale === 'zh'
      ? `即时将 ${from} 转换为 ${to}，并保持其他颜色表示同步。`
      : `Translate ${from} into ${to} instantly, with every other color representation kept in sync.`
  } else if (conversion !== 'converter') {
    return c.notFound()
  }

  const conversionLinks = COLOR_FORMATS.flatMap(from =>
    COLOR_FORMATS.filter(to => to !== from).map(to =>
      `<a href="${prefix}/tools/${from}-to-${to}" class="tool-link">${from.toUpperCase()} → ${to.toUpperCase()}</a>`
    )
  ).join('')

  const content = localizeToolHtml(`
    <div class="tool-layout">
      <section class="panel tool-sticky" aria-labelledby="converter-preview-title">
        <header class="panel-header">
          <div>
            <h2 id="converter-preview-title">Visual result</h2>
            <p>The swatch updates from any valid input format.</p>
          </div>
        </header>
        <div class="panel-body">
          <div class="preview-frame" id="converter-preview" style="min-height:310px;background:#7C3AED">
            <span class="signal-pill" id="preview-hex" style="background:rgba(0,0,0,.52);color:#fff">#7C3AED</span>
          </div>
          <div class="status" id="converter-status" role="status" aria-live="polite">Ready · enter a color in any field</div>
          <div class="inspector-section">
            <span class="section-label">API pattern</span>
            <pre class="code-surface">GET ${apiBaseUrl}/convert?hex=%237C3AED</pre>
          </div>
        </div>
      </section>

      <section class="panel" aria-labelledby="converter-inputs-title">
        <header class="panel-header">
          <div>
            <h2 id="converter-inputs-title">Synchronized values</h2>
            <p>Edit any field. Copy the representation you need.</p>
          </div>
          <span class="signal-pill">4 FORMATS</span>
        </header>
        <div class="panel-body">
          <div class="result-grid">
            <div class="field result-field">
              <label for="hex-input">HEX</label>
              <input class="input input-mono" id="hex-input" value="#7C3AED" placeholder="#FFFFFF" autocomplete="off">
              <button class="button button-small" type="button" data-copy="hex-input">Copy</button>
            </div>
            <div class="field result-field">
              <label for="rgb-input">RGB</label>
              <input class="input input-mono" id="rgb-input" placeholder="rgb(255, 255, 255)" autocomplete="off">
              <button class="button button-small" type="button" data-copy="rgb-input">Copy</button>
            </div>
            <div class="field result-field">
              <label for="hsl-input">HSL</label>
              <input class="input input-mono" id="hsl-input" placeholder="hsl(0, 0%, 100%)" autocomplete="off">
              <button class="button button-small" type="button" data-copy="hsl-input">Copy</button>
            </div>
            <div class="field result-field">
              <label for="cmyk-input">CMYK</label>
              <input class="input input-mono" id="cmyk-input" placeholder="cmyk(0%, 0%, 0%, 0%)" autocomplete="off">
              <button class="button button-small" type="button" data-copy="cmyk-input">Copy</button>
            </div>
          </div>
          <div class="inspector-section">
            <span class="section-label">More conversions</span>
            <nav class="tool-links" aria-label="Color conversion pages">${conversionLinks}</nav>
          </div>
        </div>
      </section>
    </div>

    <script>
      ${copyHelper}
      const inputs = {
        hex: document.getElementById('hex-input'),
        rgb: document.getElementById('rgb-input'),
        hsl: document.getElementById('hsl-input'),
        cmyk: document.getElementById('cmyk-input')
      }
      const preview = document.getElementById('converter-preview')
      const previewHex = document.getElementById('preview-hex')
      const status = document.getElementById('converter-status')
      let timer = null
      let requestId = 0

      async function updateColors(source, value) {
        if (!value.trim()) return
        const currentRequest = ++requestId
        status.textContent = 'Converting ' + source.toUpperCase() + '…'
        status.dataset.tone = ''
        try {
          const response = await fetch('${apiBaseUrl}/convert?' + source + '=' + encodeURIComponent(value.trim()))
          const data = await response.json()
          if (!response.ok || !data.hex) throw new Error(data.error || 'Invalid color')
          if (currentRequest !== requestId) return
          Object.keys(inputs).forEach(key => { if (key !== source) inputs[key].value = data[key] })
          preview.style.background = data.hex
          previewHex.textContent = data.hex
          status.textContent = 'Ready · all formats synchronized'
          status.dataset.tone = 'success'
        } catch (error) {
          if (currentRequest !== requestId) return
          status.textContent = 'That value is not a valid ' + source.toUpperCase() + ' color.'
          status.dataset.tone = 'error'
        }
      }

      Object.entries(inputs).forEach(([key, input]) => input.addEventListener('input', () => {
        clearTimeout(timer)
        timer = setTimeout(() => updateColors(key, input.value), 280)
      }))
      document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.copy)
        if (input.value) copyValue(input.value, button, 'Copied ✓')
      }))
      updateColors('hex', inputs.hex.value)
    </script>
  `, locale)

  return c.html(
    <Layout
      config={config}
      locale={locale}
      title={title}
      desc={desc}
      path={`/tools/${conversion}`}
      eyebrow={localizeToolHtml('Translate · Color', locale)}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>
  )
  }
)

return app
}
