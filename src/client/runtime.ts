import type { Locale } from '../site'
import { scriptJson, statusMessages } from '../i18n/messages'

// Shared browser behavior is emitted with the server-rendered page; no Node runtime is required.
export const toolRuntimeScript = (locale: Locale): string => `
const UI = ${scriptJson(statusMessages[locale])}
const Tools = (() => {
  const format = (text, values = {}) => text.replace(/\\{(\\w+)\\}/g, (match, key) => String(values[key] ?? match))
  let savedSearch = location.search
  let stateReader = null
  const copies = new WeakMap()
  const read = (defaults) => {
    const params = new URLSearchParams(location.search)
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
      [key, params.has(key) ? params.get(key).slice(0, 2048) : String(value)]))
  }
  function save(values) {
    const params = new URLSearchParams(savedSearch)
    Object.entries(values).forEach(([key, value]) => params.set(key, String(value).slice(0, 2048)))
    savedSearch = '?' + params.toString()
    try { history.replaceState(null, '', location.pathname + savedSearch + location.hash) } catch {}
    languageLinks()
  }
  function languageLinks() {
    document.querySelectorAll('a[data-locale]').forEach(link => {
      const url = new URL(link.href, location.href)
      url.search = savedSearch
      url.hash = location.hash
      link.href = url.href
    })
  }
  document.querySelectorAll('a[data-locale]').forEach(link => {
    link.addEventListener('click', () => { if (stateReader) save(stateReader()); languageLinks() })
  })
  languageLinks()
  window.addEventListener('hashchange', languageLinks)
  const track = (reader) => { stateReader = reader; save(reader()) }
  function palette(value, allowMissingHash = false) {
    const entries = value.split(',').map(color => color.trim())
    const colors = entries.map(color => allowMissingHash && !color.startsWith('#') ? '#' + color : color)
    const invalid = colors.findIndex(color => !/^#[0-9a-f]{6}$/i.test(color))
    if (invalid >= 0) return { colors: [], error: format(UI.entryInvalid, { position: invalid + 1 }) + ' ' + UI.paletteInvalid }
    if (colors.length < 2 || colors.length > 10) return { colors: [], error: UI.paletteInvalid }
    return { colors: colors.map(color => color.toUpperCase()), error: '' }
  }
  const numberError = (value, min, max) =>
    !value.trim() || !Number.isInteger(Number(value)) || Number(value) < min || Number(value) > max
      ? format(UI.numberInvalid, { min, max }) : ''
  function fieldError(input, message) {
    let error = document.getElementById(input.id + '-error')
    if (!error) {
      error = document.createElement('span')
      error.id = input.id + '-error'
      error.className = 'field-error'
      error.setAttribute('aria-live', 'polite')
      input.insertAdjacentElement('afterend', error)
      input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '))
    }
    error.textContent = message
    error.hidden = !message
    input.setAttribute('aria-invalid', String(Boolean(message)))
    if (message) { const details = input.closest('details'); if (details) details.open = true }
    return !message
  }
  function status(element, message, tone = '', previous = false) {
    element.textContent = message + (previous ? ' · ' + UI.previous : '')
    element.dataset.tone = tone
    element.setAttribute('role', 'status')
    element.setAttribute('aria-live', 'polite')
  }
  function intent() {
    let sequence = 0
    let controller = null
    return {
      invalidate() { sequence++; controller?.abort(); controller = null },
      begin() { this.invalidate(); controller = new AbortController(); return { id: sequence, signal: controller.signal } },
      current(id) { return sequence === id }
    }
  }
  async function json(url, signal, valid) {
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error('HTTP ' + response.status)
    const data = await response.json()
    if (!valid(data)) throw new Error('Invalid response')
    return data
  }
  function announce(message) {
    let live = document.getElementById('copy-status')
    if (!live) {
      live = document.createElement('div')
      live.id = 'copy-status'
      live.className = 'sr-only'
      live.setAttribute('role', 'status')
      live.setAttribute('aria-live', 'polite')
      document.body.appendChild(live)
    }
    live.textContent = ''
    queueMicrotask(() => { live.textContent = message })
  }
  function manualCopy(value, button) {
    const previous = document.getElementById('manual-copy')
    previous?.remove()
    const panel = document.createElement('section')
    panel.id = 'manual-copy'
    panel.className = 'manual-copy panel'
    panel.setAttribute('role', 'region')
    panel.setAttribute('aria-label', UI.copyFailed)
    const label = document.createElement('label')
    label.htmlFor = 'manual-copy-text'
    label.textContent = UI.copyFailed
    const area = document.createElement('textarea')
    area.id = 'manual-copy-text'
    area.className = 'input input-mono'
    area.readOnly = true
    area.value = value
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'button'
    close.textContent = UI.close
    const dismiss = () => { panel.remove(); button.focus() }
    close.addEventListener('click', dismiss)
    panel.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss() })
    panel.append(label, area, close)
    button.closest('.panel, .workbench')?.appendChild(panel) || document.body.appendChild(panel)
    area.focus()
    area.select()
  }
  async function copy(value, button, feedback = button) {
    if (!value || button.disabled) return false
    const old = copies.get(button)
    if (old) clearTimeout(old.timer)
    const state = { original: old?.original ?? feedback.textContent, timer: null }
    copies.set(button, state)
    let success = false
    try { await navigator.clipboard.writeText(value); success = true } catch {
      const focused = document.activeElement
      const area = document.createElement('textarea')
      area.value = value
      area.className = 'copy-fallback'
      document.body.appendChild(area)
      try { area.select(); success = document.execCommand('copy') === true } catch {}
      area.remove()
      focused?.focus()
    }
    if (copies.get(button) !== state) return success
    if (success) {
      feedback.textContent = UI.copied
      announce(UI.copied)
      state.timer = setTimeout(() => {
        if (copies.get(button) === state) { feedback.textContent = state.original; copies.delete(button) }
      }, 1600)
    } else {
      feedback.textContent = state.original
      copies.delete(button)
      announce(UI.copyFailed)
      manualCopy(value, button)
    }
    return success
  }
  const hex = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
  return { read, save, track, palette, numberError, fieldError, status, intent, json, copy, format, hex }
})()
`
