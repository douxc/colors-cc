import { Hono } from 'hono'
import { PALETTE_THEMES } from '../../contracts/colors-api'
import { paletteThemeMessages, scriptJson, statusMessages, toolMessages } from '../../i18n/messages'
import type { Locale, SiteConfig } from '../../site'
import { Layout } from '../../templates/Layout'

export const createPaletteRoute = (config: SiteConfig, locale: Locale): Hono => {
  const app = new Hono(), m = toolMessages[locale], ui = statusMessages[locale]
  app.get('/random-palette', c => {
    const options = PALETTE_THEMES.map(theme => `<option value="${theme}">${paletteThemeMessages[locale][theme]}</option>`).join('')
    const content = `
      <div class="tool-layout">
        <section class="panel tool-sticky" aria-labelledby="palette-controls-title">
          <header class="panel-header"><div><h2 id="palette-controls-title">${m.paletteControls}</h2><p>${m.paletteHint}</p></div></header>
          <div class="panel-body">
            <div class="field"><label for="theme-select">${m.theme}</label><select class="select" id="theme-select">${options}</select></div>
            <div class="field-actions"><button class="button button-primary" id="refresh-btn" type="button">${m.refresh}</button>
              <button class="button" id="copy-palette" type="button" disabled>${m.copyPalette}</button></div>
            <div class="status" id="palette-status" role="status" aria-live="polite">${ui.loading}</div>
            <button class="button" id="palette-retry" type="button" hidden>${ui.retry}</button>
            <button class="button" id="palette-reset" type="button" hidden>${ui.reset}</button>
            <details class="inspector-section"><summary>${m.developer}</summary>
              <span class="section-label">${m.api}</span><pre class="code-surface" id="palette-endpoint"></pre>
              <button class="button button-small" id="copy-endpoint" type="button">${m.copyRequest}</button>
            </details>
          </div>
        </section>
        <section class="panel" aria-labelledby="palette-result-title">
          <header class="panel-header"><div><h2 id="palette-result-title">${m.generated}</h2><p>${m.swatchHint}</p></div>
            <span class="signal-pill" id="palette-count">0</span></header>
          <div class="panel-body"><div class="palette-grid" id="palette-display" aria-label="${m.generatedColors}"></div></div>
        </section>
      </div>
      <script>
      ;(() => {
        const themes = ${scriptJson(PALETTE_THEMES)}, api = ${scriptJson(config.apiBaseUrl)}
        const get = id => document.getElementById(id)
        const select = get('theme-select'), display = get('palette-display'), status = get('palette-status')
        const copyAll = get('copy-palette'), endpoint = get('palette-endpoint'), copyEndpoint = get('copy-endpoint')
        const retry = get('palette-retry'), reset = get('palette-reset'), refresh = get('refresh-btn')
        const state = Tools.read({ theme: themes[0] })
        if (!themes.includes(state.theme)) {
          const option = document.createElement('option'); option.value = state.theme; option.textContent = UI.choiceInvalid
          select.appendChild(option)
        }
        select.value = state.theme
        Tools.track(() => ({ theme: select.value }))
        const requests = Tools.intent()
        let colors = null, hasResult = false, url = ''
        function renderColors(next) {
          display.replaceChildren()
          next.forEach(hex => {
            const button = document.createElement('button'), code = document.createElement('span')
            button.type = 'button'; button.className = 'palette-swatch'; button.style.background = hex
            button.setAttribute('aria-label', Tools.format(UI.copyFormat, { format: hex }))
            code.className = 'swatch-code'; code.textContent = hex; button.appendChild(code)
            button.addEventListener('click', () => colors && Tools.copy(hex, button, code))
            display.appendChild(button)
          })
          get('palette-count').textContent = String(next.length)
        }
        async function load() {
          const token = requests.begin()
          Tools.save({ theme: select.value }); colors = null; copyAll.disabled = true
          display.querySelectorAll('button').forEach(button => { button.disabled = true })
          retry.hidden = reset.hidden = true
          const valid = themes.includes(select.value)
          copyEndpoint.disabled = !valid
          Tools.fieldError(select, valid ? '' : UI.choiceInvalid)
          if (!valid) { url = ''; endpoint.textContent = ''; Tools.status(status, UI.choiceInvalid, 'error', hasResult); reset.hidden = false; return }
          url = api + '/palette?theme=' + encodeURIComponent(select.value); endpoint.textContent = url
          Tools.status(status, UI.loading, '', hasResult); refresh.disabled = true; display.setAttribute('aria-busy', 'true')
          try {
            const data = await Tools.json(url, token.signal, data => Array.isArray(data?.colors)
              && data.colors.length >= 2 && data.colors.length <= 10 && data.colors.every(Tools.hex))
            if (!requests.current(token.id)) return
            colors = data.colors; renderColors(colors); hasResult = true; copyAll.disabled = false
            Tools.status(status, Tools.format(UI.paletteReady, { count: colors.length }), 'success')
          } catch {
            if (!requests.current(token.id)) return
            Tools.status(status, UI.networkFailed, 'error', hasResult); retry.hidden = false
          } finally {
            if (requests.current(token.id)) { refresh.disabled = false; display.setAttribute('aria-busy', 'false') }
          }
        }
        select.addEventListener('change', load); refresh.addEventListener('click', load); retry.addEventListener('click', load)
        reset.addEventListener('click', () => { select.value = themes[0]; load() })
        copyAll.addEventListener('click', () => colors && Tools.copy(colors.join(','), copyAll))
        copyEndpoint.addEventListener('click', () => url && Tools.copy(url, copyEndpoint))
        load()
      })()
      </script>`
    return c.html(<Layout config={config} locale={locale} title={m.paletteTitle} desc={m.paletteDescription}
      path="/tools/random-palette" eyebrow={m.paletteEyebrow}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>)
  })
  return app
}
