import { Hono } from 'hono'
import { ssgParams } from 'hono/ssg'
import { COLOR_FORMATS, type ColorFormat } from '../../contracts/colors-api'
import { escapeHtml, formatMessage, scriptJson, statusMessages, toolMessages } from '../../i18n/messages'
import { localePrefix, type Locale, type SiteConfig } from '../../site'
import { Layout } from '../../templates/Layout'

const EXAMPLES = {
  hex: '#7C3AED', rgb: 'rgb(124, 58, 237)', hsl: 'hsl(262, 83%, 58%)', cmyk: 'cmyk(48%, 76%, 0%, 7%)'
} satisfies Record<ColorFormat, string>

export const createConverterRoute = (config: SiteConfig, locale: Locale): Hono => {
  const app = new Hono()
  const m = toolMessages[locale]
  const prefix = localePrefix(locale)
  app.get('/:conversion', ssgParams(() => [
    { conversion: 'converter' },
    ...COLOR_FORMATS.flatMap(from => COLOR_FORMATS.filter(to => to !== from)
      .map(to => ({ conversion: `${from}-to-${to}` })))
  ]), c => {
    const conversion = c.req.param('conversion')
    let source: ColorFormat = 'hex'
    let target: ColorFormat | undefined
    let title = m.converterTitle
    let description = m.converterDescription
    if (conversion !== 'converter') {
      const parts = conversion.split('-to-')
      if (parts.length !== 2 || parts[0] === parts[1] || !COLOR_FORMATS.includes(parts[0] as ColorFormat)
        || !COLOR_FORMATS.includes(parts[1] as ColorFormat)) return c.notFound()
      source = parts[0] as ColorFormat
      target = parts[1] as ColorFormat
      const values = { from: source.toUpperCase(), to: target.toUpperCase() }
      title = formatMessage(m.conversionTitle, values)
      description = formatMessage(m.conversionDescription, values)
    }
    const order = [source, ...(target ? [target] : []), ...COLOR_FORMATS.filter(format => format !== source && format !== target)]
    const fields = order.map(format => `
      <div class="field result-field" data-format-field="${format}">
        <label for="${format}-input">${format.toUpperCase()}${format === target ? ` · ${m.target}` : ''}</label>
        <input class="input input-mono" id="${format}-input" placeholder="${EXAMPLES[format]}" autocomplete="off" spellcheck="false">
        <div class="field-actions">
          <button class="button button-small" type="button" data-example="${format}">${m.example}</button>
          <button class="button button-small panel-copy-feedback" type="button" data-copy="${format}-input" disabled>${statusMessages[locale].copy}</button>
        </div>
      </div>`).join('')
    const links = COLOR_FORMATS.flatMap(from => COLOR_FORMATS.filter(to => from !== to).map(to =>
      `<a class="tool-link" href="${prefix}/tools/${from}-to-${to}">${from.toUpperCase()} → ${to.toUpperCase()}</a>`)).join('')
    const content = `
      <div class="tool-layout converter-layout">
        <section class="panel" aria-labelledby="converter-inputs-title">
          <header class="panel-header"><div><h2 id="converter-inputs-title">${m.values}</h2><p>${m.valuesHint}</p></div></header>
          <div class="panel-body">
            <p class="field-hint" id="converter-source" role="status">${formatMessage(m.source, { format: source.toUpperCase() })}</p>
            <div class="result-grid">${fields}</div>
            <details class="inspector-section"><summary>${m.moreConversions}</summary>
              <nav class="tool-links" aria-label="${m.conversionLinks}">${links}</nav>
            </details>
          </div>
        </section>
        <section class="panel tool-sticky" aria-labelledby="converter-preview-title">
          <header class="panel-header"><div><h2 id="converter-preview-title">${m.visual}</h2><p>${m.visualHint}</p></div></header>
          <div class="panel-body">
            <div class="preview-frame" id="converter-preview" style="min-height:310px;background:#7C3AED">
              <span class="signal-pill" id="preview-hex">#7C3AED</span>
            </div>
            <div class="status" id="converter-status" role="status" aria-live="polite"></div>
            <button class="button" id="converter-retry" type="button" hidden></button>
            <details class="inspector-section"><summary>${m.developer}</summary>
              <span class="section-label">${m.apiHint}</span><pre class="code-surface">GET ${escapeHtml(config.apiBaseUrl)}/convert?hex=%237C3AED</pre>
            </details>
          </div>
        </section>
      </div>
      <script>
      ;(() => {
        const labels = ${scriptJson(m)}, examples = ${scriptJson(EXAMPLES)}
        const formats = ${scriptJson(COLOR_FORMATS)}, api = ${scriptJson(config.apiBaseUrl)}
        const get = id => document.getElementById(id)
        const inputs = Object.fromEntries(formats.map(format => [format, get(format + '-input')]))
        const status = get('converter-status'), preview = get('converter-preview'), hex = get('preview-hex')
        const retry = get('converter-retry'), copies = Array.from(document.querySelectorAll('[data-copy]'))
        const requests = Tools.intent()
        const state = Tools.read({ format: ${scriptJson(source)}, value: examples[${scriptJson(source)}] })
        let timer = null, result = null, hasResult = false
        const supported = formats.includes(state.format)
        let source = supported ? state.format : ${scriptJson(source)}
        inputs[source].value = state.value
        const draft = () => ({ format: state.format, value: inputs[source].value })
        Tools.track(draft)
        retry.textContent = UI.retry
        function inputValid(format, value) {
          if (format === 'hex') return /^#?[0-9a-f]{6}$/i.test(value.trim())
          const clean = value.trim().replace(new RegExp('^' + format + '\\\\(', 'i'), '').replace(/\\)$/, '')
          const parts = clean.split(',').map(part => part.trim())
          if (parts.length !== (format === 'cmyk' ? 4 : 3) || parts.some(part => !/^\\d+(?:\\.\\d+)?%?$/.test(part))) return false
          const numbers = parts.map(part => Number(part.replace('%', '')))
          const limits = format === 'rgb' ? [255,255,255] : format === 'hsl' ? [360,100,100] : [100,100,100,100]
          return numbers.every((value, index) => value >= 0 && value <= limits[index])
        }
        async function convert(token, value) {
          const format = source
          try {
            const response = await fetch(api + '/convert?' + format + '=' + encodeURIComponent(value.trim()), { signal: token.signal })
            if (!requests.current(token.id)) return
            if (response.status === 400) {
              Tools.fieldError(inputs[format], Tools.format(UI.formatInvalid, { format: format.toUpperCase() }))
              Tools.status(status, UI.invalidDraft, 'error', hasResult); return
            }
            if (!response.ok) throw new Error('HTTP ' + response.status)
            const data = await response.json()
            if (!requests.current(token.id)) return
            if (!Tools.hex(data?.hex) || !formats.every(key => typeof data[key] === 'string' && inputValid(key, data[key]))) throw new Error('Invalid response')
            result = data
            formats.forEach(key => { if (key !== format) inputs[key].value = data[key] })
            preview.style.background = data.hex; hex.textContent = data.hex
            hasResult = true; copies.forEach(button => { button.disabled = false })
            Tools.status(status, UI.converted, 'success'); retry.hidden = true
          } catch {
            if (!requests.current(token.id)) return
            Tools.status(status, UI.networkFailed, 'error', hasResult); retry.hidden = false
          } finally { if (requests.current(token.id)) preview.setAttribute('aria-busy', 'false') }
        }
        function schedule(delay = 280) {
          clearTimeout(timer)
          const token = requests.begin()
          result = null; copies.forEach(button => { button.disabled = true })
          preview.setAttribute('aria-busy', 'false')
          Tools.save(draft())
          get('converter-source').textContent = Tools.format(labels.source, { format: source.toUpperCase() })
          formats.forEach(key => inputs[key].closest('.result-field').classList.toggle('is-source', key === source))
          formats.forEach(key => Tools.fieldError(inputs[key], ''))
          const valid = inputValid(source, inputs[source].value)
          Tools.fieldError(inputs[source], valid ? '' : Tools.format(UI.formatInvalid, { format: source.toUpperCase() }))
          if (!formats.includes(state.format)) {
            Tools.status(status, UI.choiceInvalid, 'error', hasResult); retry.hidden = false; return
          }
          if (!valid) { Tools.status(status, UI.invalidDraft, 'error', hasResult); retry.hidden = true; return }
          Tools.status(status, Tools.format(UI.converting, { format: source.toUpperCase() }), '', hasResult)
          preview.setAttribute('aria-busy', 'true'); retry.hidden = true
          timer = setTimeout(() => convert(token, inputs[source].value), delay)
        }
        formats.forEach(format => {
          inputs[format].addEventListener('input', () => { source = state.format = format; schedule() })
          document.querySelector('[data-example="' + format + '"]').addEventListener('click', () => {
            source = state.format = format; inputs[format].value = examples[format]; schedule(0)
          })
        })
        copies.forEach(button => button.addEventListener('click', () => {
          const format = button.dataset.copy.replace('-input', '')
          if (result) Tools.copy(result[format], button)
        }))
        retry.addEventListener('click', () => { state.format = source; schedule(0) })
        schedule(0)
      })()
      </script>`
    return c.html(<Layout config={config} locale={locale} title={title} desc={description}
      path={`/tools/${conversion}`} eyebrow={m.converterEyebrow}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>)
  })
  return app
}
