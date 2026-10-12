import { PUBLIC_COLOR_API_CONTRACT } from '../contracts/colors-api'
import { effectMessages, homeMessages, presetMessages, scriptJson } from '../i18n/messages'
import type { Locale } from '../site'

export const placeholderScript = (locale: Locale, apiBaseUrl: string): string => `
;(() => {
  const contract = ${scriptJson({ ...PUBLIC_COLOR_API_CONTRACT, baseUrl: apiBaseUrl })}
  const labels = ${scriptJson(homeMessages[locale])}
  const effectLabels = ${scriptJson(effectMessages[locale])}
  const presetLabels = ${scriptJson(presetMessages[locale])}
  const animated = new Set(['fluid', 'breathe', 'holographic', 'mesh'])
  const defaults = contract.placeholder.defaults
  const state = Tools.read({ effect: defaults.effect, palette: defaults.palette.join(','),
    w: defaults.width, h: defaults.height, speed: defaults.speed, text: '', attribution: 'true' })
  const get = id => document.getElementById(id)
  const image = get('previewImage'), stage = get('previewStage'), status = get('previewStatus')
  const palette = get('customPalette'), width = get('widthNumber'), height = get('heightNumber')
  const speed = get('speedNumber'), text = get('labelInput'), attribution = get('attributionInput')
  const effects = get('effectControls'), presets = get('presetControls')
  const copy = get('copyOutput'), quickCopy = get('quickCopy'), open = get('openImage')
  const code = get('outputCode'), retry = get('previewRetry'), meta = get('canvasMeta')
  const requests = Tools.intent()
  let timer = null, activeFormat = 'url', outputs = null, hasPreview = false
  width.value = state.w; height.value = state.h; palette.value = state.palette
  speed.value = state.speed; text.value = state.text; attribution.checked = !['false', '0'].includes(state.attribution)
  const draft = () => ({ effect: state.effect, palette: palette.value, w: width.value, h: height.value,
    speed: speed.value, text: text.value, attribution: String(attribution.checked) })
  Tools.track(draft)
  const htmlEscape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;')
  function updateOutput() {
    code.textContent = outputs ? outputs[activeFormat] : ''
    copy.textContent = activeFormat === 'url' ? labels.copyApiUrl : Tools.format(UI.copyFormat, {
      format: activeFormat === 'agent' ? labels.agentPrompt : activeFormat.toUpperCase()
    })
  }
  function validate() {
    const parsed = Tools.palette(palette.value, true)
    const checks = [
      Tools.fieldError(palette, parsed.error),
      Tools.fieldError(width, Tools.numberError(width.value, 50, 4000)),
      Tools.fieldError(height, Tools.numberError(height.value, 50, 4000)),
      Tools.fieldError(speed, Tools.numberError(speed.value, 1, 30)),
      Tools.fieldError(text, text.value.length > 100 ? Tools.format(UI.textInvalid, { max: 100 }) : ''),
      Tools.fieldError(effects, contract.placeholder.effects.includes(state.effect) ? '' : UI.choiceInvalid)
    ]
    return checks.every(Boolean) ? parsed.colors : null
  }
  function render(delay = 180) {
    clearTimeout(timer)
    const token = requests.begin()
    Tools.save(draft())
    effects.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.effect === state.effect)))
    presets.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.colors === palette.value.split(',').map(value => value.trim().toUpperCase()).join(','))))
    get('widthRange').value = width.value; get('heightRange').value = height.value
    get('speedRange').value = speed.value; get('speedValue').textContent = speed.value + 's'
    get('speedField').hidden = !animated.has(state.effect)
    const colors = validate()
    copy.disabled = quickCopy.disabled = !colors
    open.setAttribute('aria-disabled', String(!colors))
    if (!colors) {
      outputs = null; updateOutput(); open.removeAttribute('href')
      stage.classList.remove('is-loading'); stage.setAttribute('aria-busy', 'false')
      Tools.status(status, UI.invalidDraft, 'error', hasPreview)
      retry.hidden = true
      return
    }
    const params = new URLSearchParams({ w: width.value, h: height.value, effect: state.effect,
      palette: colors.join(',') })
    if (animated.has(state.effect)) params.set('speed', speed.value)
    if (text.value) params.set('text', text.value)
    if (!attribution.checked) params.set('attribution', 'false')
    const url = contract.baseUrl + '/placeholder?' + params.toString()
    const alt = text.value || UI.outputAlt
    outputs = {
      url, html: '<img src="' + htmlEscape(url) + '" alt="' + htmlEscape(alt) + '">',
      css: '.visual {\\n  background-image: url("' + url + '");\\n  background-size: cover;\\n  background-position: center;\\n}',
      markdown: '![' + alt.replace(/([\\\\\\[\\]])/g, '\\\\$1') + '](' + url.replaceAll('(', '%28').replaceAll(')', '%29') + ')',
      agent: Tools.format(UI.agent, { width: width.value, height: height.value, effect: effectLabels[state.effect], url })
    }
    updateOutput(); open.href = url
    stage.classList.add('is-loading'); stage.setAttribute('aria-busy', 'true')
    meta.textContent = width.value + ' × ' + height.value + ' · ' + effectLabels[state.effect]
    Tools.status(status, UI.rendering, '', hasPreview); retry.hidden = true
    timer = setTimeout(() => {
      const next = new Image()
      next.onload = () => {
        if (!requests.current(token.id)) return
        image.src = url; image.alt = Tools.format(UI.previewAlt, { effect: effectLabels[state.effect] }) + (text.value ? ' · ' + text.value : '')
        stage.style.setProperty('--preview-ratio', width.value + ' / ' + height.value)
        stage.classList.remove('is-loading'); stage.setAttribute('aria-busy', 'false')
        hasPreview = true; Tools.status(status, UI.previewReady, 'success'); retry.hidden = true
      }
      next.onerror = () => {
        if (!requests.current(token.id)) return
        stage.classList.remove('is-loading'); stage.setAttribute('aria-busy', 'false')
        Tools.status(status, UI.previewFailed, 'error', hasPreview); retry.hidden = false
      }
      next.src = url
    }, delay)
  }
  contract.placeholder.effects.forEach(effect => {
    const button = document.createElement('button')
    button.type = 'button'; button.className = 'segment'; button.dataset.effect = effect
    button.textContent = effectLabels[effect]
    button.addEventListener('click', () => { state.effect = effect; render(0) })
    effects.appendChild(button)
  })
  contract.placeholder.presets.forEach(preset => {
    const button = document.createElement('button'), swatch = document.createElement('span'), name = document.createElement('span')
    button.type = 'button'; button.className = 'preset'; button.dataset.colors = preset.colors.join(',')
    button.setAttribute('aria-label', Tools.format(UI.usePalette, { name: presetLabels[preset.id] }))
    swatch.className = 'preset-color'; swatch.style.display = 'block'
    swatch.style.background = 'linear-gradient(135deg,' + preset.colors.join(',') + ')'
    name.className = 'preset-name'; name.textContent = presetLabels[preset.id]
    button.append(swatch, name)
    button.addEventListener('click', () => { palette.value = preset.colors.join(', '); render(0) })
    presets.appendChild(button)
  })
  for (const [range, input] of [[get('widthRange'), width], [get('heightRange'), height], [get('speedRange'), speed]]) {
    range.addEventListener('input', () => { input.value = range.value; render() })
    input.addEventListener('input', () => render())
  }
  for (const input of [palette, text]) input.addEventListener('input', () => render())
  attribution.addEventListener('change', () => render(0))
  document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
    const size = button.dataset.size.split('x'); width.value = size[0]; height.value = size[1]; render(0)
  }))
  const tabs = Array.from(document.querySelectorAll('.output-tab'))
  function chooseTab(tab) {
    activeFormat = tab.dataset.format
    tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1 })
    get('output-panel').setAttribute('aria-labelledby', tab.id); updateOutput()
  }
  tabs.forEach((tab, index) => {
    tab.id = 'output-tab-' + tab.dataset.format; tab.setAttribute('aria-controls', 'output-panel')
    tab.tabIndex = index === 0 ? 0 : -1
    tab.addEventListener('click', () => chooseTab(tab))
    tab.addEventListener('keydown', event => {
      let next = index
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = tabs.length - 1
      else return
      event.preventDefault(); chooseTab(tabs[next]); tabs[next].focus()
    })
  })
  chooseTab(tabs[0])
  copy.addEventListener('click', () => outputs && Tools.copy(outputs[activeFormat], copy))
  quickCopy.addEventListener('click', () => outputs && Tools.copy(outputs.url, quickCopy))
  const rule = get('copyAgentRule')
  rule.addEventListener('click', () => Tools.copy(get('agentRule').textContent, rule))
  retry.addEventListener('click', () => render(0))
  get('resetPlaceholder').addEventListener('click', () => {
    width.value = defaults.width; height.value = defaults.height; palette.value = defaults.palette.join(', ')
    speed.value = defaults.speed; text.value = ''; attribution.checked = true; state.effect = defaults.effect; render(0)
  })
  render(0)
})()
`
