import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JSDOM } from 'jsdom'
import { toolBrowser } from './browser-test-utils'

const browsers: JSDOM[] = []
afterEach(() => { browsers.splice(0).forEach(dom => dom.window.close()); vi.useRealTimers() })
async function home(query = '') {
  vi.useFakeTimers()
  const browser = await toolBrowser('/ja' + query)
  browsers.push(browser.dom)
  expect(browser.errors).toEqual([])
  await vi.advanceTimersByTimeAsync(0)
  return browser
}

describe('placeholder visitor workflow', () => {
  it('localizes static and dynamic content and puts the tool before the showcase', async () => {
    const { document, html, images } = await home()
    expect(document.documentElement.lang).toBe('ja')
    expect(html).not.toContain('{{home.')
    expect(document.getElementById('workbench-title')!.textContent).toBe('プレースホルダー作成')
    expect(document.querySelector('[data-effect="fluid"]')!.textContent).toBe('流動')
    expect(html.indexOf('id="create"')).toBeLessThan(html.indexOf('data-home-role="workflow-showcase"'))
    expect(document.querySelector('main > .workbench')).not.toBeNull()
    expect(document.querySelectorAll('[data-workflow]')).toHaveLength(2)
    images[0].onload!()
    expect(document.getElementById('previewStatus')!.textContent).toContain('プレビューを表示')
  })

  it('restores custom state, preserves it on language links and changes size presets', async () => {
    const { document, click, dom, images } = await home('?palette=%23112233,%23445566&w=640&h=320&attribution=0&text=日本語#agent-output')
    expect((document.getElementById('customPalette') as HTMLInputElement).value).toBe('#112233,#445566')
    expect((document.getElementById('widthRange') as HTMLInputElement).value).toBe('640')
    expect((document.getElementById('attributionInput') as HTMLInputElement).checked).toBe(false)
    const initial = new URL(images[0].src)
    expect(initial.searchParams.get('attribution')).toBe('false')
    expect(initial.searchParams.get('text')).toBe('日本語')
    click('[data-size="800x800"]')
    await vi.advanceTimersByTimeAsync(0)
    expect(new URL(images[1].src).searchParams.get('h')).toBe('800')
    const language = document.querySelector<HTMLAnchorElement>('[data-locale="en"]')!
    expect(new URL(language.href).searchParams.get('palette')).toBe('#112233,#445566')
    expect(new URL(language.href).hash).toBe('#agent-output')
    expect(dom.window.location.search).toContain('w=800')
  })

  it('preserves invalid drafts without filtering invalid colors or copying a new result', async () => {
    const { document, images, input, dom } = await home()
    images[0].onload!()
    input('customPalette', '#112233,bad,#445566')
    expect((document.getElementById('quickCopy') as HTMLButtonElement).disabled).toBe(true)
    expect(document.getElementById('customPalette-error')!.textContent).toContain('2番目')
    expect(document.getElementById('previewStatus')!.textContent).toContain('前回の結果')
    expect(new URL(dom.window.location.href).searchParams.get('palette')).toBe('#112233,bad,#445566')
    const invalid = await home('?w=&h=9999&palette=%23112233,%23445566')
    expect((invalid.document.getElementById('widthNumber') as HTMLInputElement).value).toBe('')
    expect(invalid.document.getElementById('heightNumber')!.getAttribute('aria-invalid')).toBe('true')
    expect(invalid.images).toHaveLength(0)
  })

  it('ignores old image completions and leaves valid URLs usable after preview failure', async () => {
    const { document, images, input, click, writeText } = await home()
    input('widthNumber', '900')
    images[0].onload!()
    expect((document.getElementById('previewImage') as HTMLImageElement).getAttribute('src')).toBe('')
    await vi.advanceTimersByTimeAsync(180)
    images[1].onerror!()
    expect((document.getElementById('quickCopy') as HTMLButtonElement).disabled).toBe(false)
    expect(document.getElementById('previewRetry')!.hidden).toBe(false)
    click('#quickCopy')
    await vi.advanceTimersByTimeAsync(0)
    expect(new URL(writeText.mock.calls[0][0]).searchParams.get('w')).toBe('900')
    click('#previewRetry')
    await vi.advanceTimersByTimeAsync(0)
    expect(images).toHaveLength(3)
  })

  it('encodes copied markup and supports keyboard output selection', async () => {
    const { document, dom, input, click, writeText } = await home()
    input('labelInput', '日本語 <img> & "label" [test]')
    click('[data-format="html"]')
    click('#copyOutput')
    await vi.advanceTimersByTimeAsync(0)
    expect(writeText.mock.calls[0][0]).toContain('&lt;img&gt; &amp; &quot;label&quot;')
    const tab = document.querySelector<HTMLButtonElement>('[data-format="html"]')!
    tab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(document.querySelector('[data-format="css"]')!.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(document.querySelector('[data-format="css"]'))
    click('[data-format="agent"]'); click('#copyOutput')
    await vi.advanceTimersByTimeAsync(0)
    expect(writeText.mock.calls[1][0]).toContain('作成してください')
  })
})
