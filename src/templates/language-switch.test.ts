import { afterEach, describe, expect, it } from 'vitest'
import type { JSDOM } from 'jsdom'
import { toolBrowser } from '../client/browser-test-utils'
import { languageControlBlock } from './language-control-html'

const browsers: JSDOM[] = []
afterEach(() => browsers.splice(0).forEach(dom => dom.window.close()))

// The language control must stay a plain set of links: it is the only place where
// visitor-facing navigation used to depend on a scripted disclosure state.
const watchLanguageControl = async (path: string) => {
  const browser = await toolBrowser(path)
  browsers.push(browser.dom)
  expect(browser.errors, path).toEqual([])
  return browser
}

describe('flattened language switching', () => {
  it.each(['/en', '/zh'])('registers no disclosure behavior on the language control at %s', async (path) => {
    const browser = await watchLanguageControl(path)

    expect(browser.listenerTypes('.language-control')).toEqual([])
    // The only listener the links carry is the state-preserving click handler from
    // the page runtime; it rewrites hrefs and must never gate navigation.
    expect(browser.listenerTypes('.language-option')).toEqual(['click'])
    for (const type of ['focusout', 'keydown', 'toggle']) {
      expect(browser.listenerCount('.language-control', type), `${path} ${type}`).toBe(0)
      expect(browser.listenerCount('.language-option', type), `${path} ${type}`).toBe(0)
    }
  })

  it('keeps navigation menu behavior on the menu itself, not on the language control', async () => {
    const browser = await watchLanguageControl('/en')

    expect(browser.listenerCount('.nav-menu', 'toggle')).toBeGreaterThan(0)
    expect(browser.listenerCount('.nav-menu', 'keydown')).toBeGreaterThan(0)
    expect(browser.listenerCount('.language-control', 'toggle')).toBe(0)
  })

  it.each(['/en', '/zh', '/ja'])('renders language entries as plain links on %s', async (path) => {
    const browser = await watchLanguageControl(path)
    const control = browser.document.querySelector('.language-control')

    expect(control, path).not.toBeNull()
    expect(control!.tagName).toBe('DIV')
    expect(control!.querySelector('summary')).toBeNull()
    expect(browser.document.querySelector('details.language-control')).toBeNull()
    expect(browser.document.querySelector('.language-toggle')).toBeNull()

    const group = control!.querySelector('.nav-segmented')!
    const links = [...group.children]
    expect(links.map(link => link.getAttribute('data-locale'))).toEqual(['en', 'zh', 'ja'])
    for (const link of links) {
      expect(link.tagName).toBe('A')
      // href is read through the URL parser because the page runtime rewrites it to
      // carry the current query and fragment; the path is what identifies the locale.
      expect(new URL((link as HTMLAnchorElement).href).pathname).toBe(`/${link.getAttribute('data-locale')}`)
      expect(link.getAttribute('lang')).toBeTruthy()
      expect(link.getAttribute('aria-label')).toBe(link.textContent)
    }
    expect(links.filter(link => link.getAttribute('aria-current') === 'page')).toHaveLength(1)
  })

  it('does not expose expandable detail markup in the rendered HTML', async () => {
    const { html } = await watchLanguageControl('/en')

    expect(html).not.toMatch(/<details[^>]*class="[^"]*language-control/)
    expect(html).not.toContain('class="language-toggle"')
  })
})
