import { Hono } from 'hono'
import { scriptJson, statusMessages, toolMessages } from '../../i18n/messages'
import type { Locale, SiteConfig } from '../../site'
import { Layout } from '../../templates/Layout'

export const createColorNamesRoute = (config: SiteConfig, locale: Locale): Hono => {
  const app = new Hono(), m = toolMessages[locale], ui = statusMessages[locale]
  app.get('/color-names', c => {
    const content = `
      <section class="panel" aria-labelledby="color-atlas-title" style="margin-bottom:72px">
        <header class="panel-header"><div><h2 id="color-atlas-title">${m.namesTitle}</h2><p>${m.namesHint}</p></div>
          <span class="signal-pill" id="color-count">0</span></header>
        <div class="panel-body">
          <div class="field"><label for="color-search">${m.searchLabel}</label>
            <div class="field-actions"><input class="input" type="search" id="color-search" placeholder="${m.searchPlaceholder}" autocomplete="off" aria-describedby="color-search-hint">
              <button class="button" type="button" id="clear-search">${m.clear}</button></div>
            <span class="field-hint" id="color-search-hint">${m.namesHint}</span>
          </div>
          <div class="status" id="color-status" role="status" aria-live="polite">${ui.loading}</div>
          <button class="button" type="button" id="color-retry" hidden>${ui.retry}</button>
          <div class="color-grid" id="color-grid" aria-label="${m.searchResults}" style="margin-top:18px"></div>
        </div>
      </section>
      <script>
      ;(() => {
        const get = id => document.getElementById(id)
        const search = get('color-search'), grid = get('color-grid'), status = get('color-status'), retry = get('color-retry')
        const state = Tools.read({ q: '' }); search.value = state.q
        Tools.track(() => ({ q: search.value }))
        const requests = Tools.intent()
        let allColors = [], loaded = false
        function filter() {
          Tools.save({ q: search.value })
          if (!loaded) return
          const term = search.value.trim().toLowerCase()
          const colors = allColors.filter(([name, hex]) => name.toLowerCase().includes(term) || hex.toLowerCase().includes(term))
          grid.replaceChildren()
          colors.forEach(([name, hex]) => {
            const card = document.createElement('button'), swatch = document.createElement('span'), meta = document.createElement('span')
            const title = document.createElement('span'), code = document.createElement('span')
            card.type = 'button'; card.className = 'color-card panel-copy-feedback'
            card.setAttribute('aria-label', Tools.format(UI.copyFormat, { format: name + ' ' + hex }))
            swatch.className = 'color-card-swatch'; swatch.style.display = 'block'; swatch.style.background = hex
            meta.className = 'color-card-meta'; title.className = 'color-card-name'; title.textContent = name
            code.className = 'color-card-code'; code.textContent = hex
            meta.append(title, code); card.append(swatch, meta)
            card.addEventListener('click', () => Tools.copy(hex, card, code))
            grid.appendChild(card)
          })
          get('color-count').textContent = String(colors.length)
          Tools.status(status, colors.length ? Tools.format(UI.namesCount, { count: colors.length }) : UI.noResults)
        }
        async function load() {
          const token = requests.begin()
          Tools.status(status, UI.loading, '', loaded); grid.setAttribute('aria-busy', 'true'); retry.hidden = true
          try {
            const data = await Tools.json(${scriptJson(config.apiBaseUrl + '/all-names')}, token.signal,
              data => data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0
                && Object.entries(data).every(([name, hex]) => /^[a-z]+$/i.test(name) && Tools.hex(hex)))
            if (!requests.current(token.id)) return
            allColors = Object.entries(data); loaded = true; filter()
          } catch {
            if (!requests.current(token.id)) return
            Tools.status(status, UI.networkFailed, 'error', loaded); retry.hidden = false
          } finally { if (requests.current(token.id)) grid.setAttribute('aria-busy', 'false') }
        }
        search.addEventListener('input', filter)
        get('clear-search').addEventListener('click', () => { search.value = ''; filter(); search.focus() })
        retry.addEventListener('click', load)
        load()
      })()
      </script>`
    return c.html(<Layout config={config} locale={locale} title={m.namesTitle} desc={m.namesDescription}
      path="/tools/color-names" eyebrow={m.namesEyebrow}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>)
  })
  return app
}
