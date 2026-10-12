import { Hono } from 'hono'
import { PLACEHOLDER_PRESETS } from '../../contracts/colors-api'
import { escapeHtml, formatMessage, homeMessages, presetMessages, scriptJson, statusMessages, toolMessages } from '../../i18n/messages'
import type { Locale, SiteConfig } from '../../site'
import { Layout } from '../../templates/Layout'

export const createFluidRoute = (config: SiteConfig, locale: Locale): Hono => {
  const app = new Hono(), m = toolMessages[locale], h = homeMessages[locale], ui = statusMessages[locale]
  app.get('/fluid-placeholder', c => {
    const presets = PLACEHOLDER_PRESETS.map(preset => {
      const colors = preset.colors.join(','), name = presetMessages[locale][preset.id]
      return `<button class="preset" type="button" data-palette="${colors}" aria-pressed="false" aria-label="${escapeHtml(formatMessage(ui.usePalette, { name }))}">
        <span class="preset-color" style="display:block;background:linear-gradient(135deg,${colors})"></span><span class="preset-name">${name}</span></button>`
    }).join('')
    const content = `
      <div class="tool-layout">
        <section class="panel tool-sticky" aria-labelledby="fluid-controls-title">
          <header class="panel-header"><div><h2 id="fluid-controls-title">${m.animationControls}</h2><p>${m.fluidHint}</p></div></header>
          <div class="panel-body">
            <div class="field"><span class="field-label">${m.preset}</span><div class="preset-grid" id="fluid-presets">${presets}</div></div>
            <div class="field"><label for="fluid-palette">${h.customColors}</label><input class="input input-mono" id="fluid-palette" autocomplete="off" spellcheck="false" aria-describedby="fluid-palette-hint">
              <span class="field-hint" id="fluid-palette-hint">${h.colorsHint}</span></div>
            <details class="inspector-section"><summary>${h.advanced}</summary>
              <div class="field"><label for="fluid-speed-number">${h.duration}</label>
                <input class="input input-mono" id="fluid-speed-number" type="text" inputmode="numeric">
                <input id="fluid-speed" type="range" min="1" max="30" value="10" aria-label="${h.duration}">
              </div>
              <div class="field"><label for="fluid-text">${h.label} <span class="field-hint">${h.optional}</span></label>
                <input class="input" id="fluid-text" maxlength="100" placeholder="${h.labelExample}" autocomplete="off"></div>
            </details>
          </div>
        </section>
        <section class="panel" aria-labelledby="fluid-preview-title">
          <header class="panel-header"><div><h2 id="fluid-preview-title">${m.liveAnimated}</h2><p>${m.animatedHint}</p></div></header>
          <div class="panel-body">
            <div class="preview-frame" id="fluid-preview-frame"><img id="fluid-preview" src="" alt="${h.previewAlt}"></div>
            <div class="status" id="fluid-status" role="status" aria-live="polite">${ui.rendering}</div>
            <div class="field-actions"><button class="button button-primary" id="copy-fluid-url" type="button">${h.copyUrl}</button>
              <button class="button" id="fluid-retry" type="button" hidden>${ui.retry}</button></div>
            <details class="inspector-section"><summary>${m.developer}</summary>
              <pre class="code-surface" id="fluid-url" tabindex="0"></pre>
            </details>
          </div>
        </section>
      </div>
      <script>
      ;(() => {
        const get = id => document.getElementById(id), api = ${scriptJson(config.apiBaseUrl)}
        const palette = get('fluid-palette'), speed = get('fluid-speed-number'), range = get('fluid-speed'), text = get('fluid-text')
        const preview = get('fluid-preview'), frame = get('fluid-preview-frame'), status = get('fluid-status')
        const output = get('fluid-url'), copy = get('copy-fluid-url'), retry = get('fluid-retry')
        const state = Tools.read({ palette: ${scriptJson(PLACEHOLDER_PRESETS[0].colors.join(','))}, speed: '10', text: '' })
        palette.value = state.palette; speed.value = state.speed; range.value = state.speed; text.value = state.text
        const draft = () => ({ palette: palette.value, speed: speed.value, text: text.value })
        Tools.track(draft)
        const requests = Tools.intent()
        let timer = null, url = '', hasPreview = false
        function render(delay = 180) {
          clearTimeout(timer)
          const token = requests.begin()
          Tools.save(draft()); range.value = speed.value
          const parsed = Tools.palette(palette.value)
          const valid = [Tools.fieldError(palette, parsed.error), Tools.fieldError(speed, Tools.numberError(speed.value, 1, 30)),
            Tools.fieldError(text, text.value.length > 100 ? Tools.format(UI.textInvalid, { max: 100 }) : '')].every(Boolean)
          document.querySelectorAll('[data-palette]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.palette === parsed.colors.join(','))))
          copy.disabled = !valid; retry.hidden = true
          if (!valid) {
            url = ''; output.textContent = ''; frame.setAttribute('aria-busy', 'false')
            Tools.status(status, UI.invalidDraft, 'error', hasPreview); return
          }
          const params = new URLSearchParams({ w: '1200', h: '600', palette: parsed.colors.join(','), speed: speed.value })
          if (text.value) params.set('text', text.value)
          url = api + '/fluid-placeholder?' + params.toString(); output.textContent = url
          const pendingUrl = url
          frame.setAttribute('aria-busy', 'true'); Tools.status(status, UI.rendering, '', hasPreview)
          timer = setTimeout(() => {
            const image = new Image()
            image.onload = () => {
              if (!requests.current(token.id)) return
              preview.src = pendingUrl; hasPreview = true; frame.setAttribute('aria-busy', 'false')
              Tools.status(status, UI.previewReady, 'success'); retry.hidden = true
            }
            image.onerror = () => {
              if (!requests.current(token.id)) return
              frame.setAttribute('aria-busy', 'false'); Tools.status(status, UI.previewFailed, 'error', hasPreview); retry.hidden = false
            }
            image.src = pendingUrl
          }, delay)
        }
        document.querySelectorAll('[data-palette]').forEach(button => button.addEventListener('click', () => {
          palette.value = button.dataset.palette.replaceAll(',', ', '); render(0)
        }))
        range.addEventListener('input', () => { speed.value = range.value; render() })
        for (const input of [palette, speed, text]) input.addEventListener('input', () => render())
        copy.addEventListener('click', () => url && Tools.copy(url, copy))
        retry.addEventListener('click', () => render(0))
        render(0)
      })()
      </script>`
    return c.html(<Layout config={config} locale={locale} title={m.fluidTitle} desc={m.fluidDescription}
      path="/tools/fluid-placeholder" eyebrow={m.fluidEyebrow}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>)
  })
  return app
}
