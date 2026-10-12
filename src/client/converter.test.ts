import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JSDOM } from 'jsdom'
import app from '../index'
import { COLOR_FORMATS } from '../contracts/colors-api'
import { toolBrowser } from './browser-test-utils'

const COLOR = { hex: '#7C3AED', rgb: 'rgb(124, 58, 237)', hsl: 'hsl(262, 83%, 58%)', cmyk: 'cmyk(48%, 76%, 0%, 7%)' }
const response = (data = COLOR) => ({ ok: true, status: 200, json: async () => data })
const browsers: JSDOM[] = []
afterEach(() => { browsers.splice(0).forEach(dom => dom.window.close()); vi.useRealTimers() })
async function converter(path = '/ja/tools/rgb-to-hsl', fetchMock = vi.fn().mockResolvedValue(response())) {
  vi.useFakeTimers()
  const browser = await toolBrowser(path, fetchMock)
  browsers.push(browser.dom)
  expect(browser.errors).toEqual([])
  await vi.advanceTimersByTimeAsync(0)
  return browser
}

describe('converter visitor workflow', () => {
  it('renders each directed conversion in all languages with valid scripts', async () => {
    for (const locale of ['en', 'zh', 'ja']) for (const from of COLOR_FORMATS) for (const to of COLOR_FORMATS) {
      if (from === to) continue
      const html = await (await app.request(`/${locale}/tools/${from}-to-${to}`)).text()
      expect(html).toContain(`data-format-field="${from}"`)
      expect(html.indexOf(`data-format-field="${from}"`)).toBeLessThan(html.indexOf(`data-format-field="${to}"`))
      for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        if (script[0].includes('application/ld+json')) continue
        expect(() => new Function(script[1])).not.toThrow()
      }
    }
  })

  it('starts with directed source and target, supports examples and copies validated results', async () => {
    const { document, fetchMock, click, writeText } = await converter()
    expect(fetchMock.mock.calls[0][0]).toContain('/convert?rgb=')
    expect(document.getElementById('converter-source')!.textContent).toContain('RGB')
    expect(document.querySelector('[data-format-field="hsl"] label')!.textContent).toContain('変換先')
    click('[data-copy="hsl-input"]')
    await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledWith(COLOR.hsl)
    click('[data-example="cmyk"]')
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock.mock.calls[1][0]).toContain('/convert?cmyk=')
  })

  it('preserves invalid and valid source state and blocks unverified copying', async () => {
    const { document, input, dom, fetchMock } = await converter()
    input('rgb-input', 'rgb(invalid)')
    expect(document.getElementById('rgb-input')!.getAttribute('aria-invalid')).toBe('true')
    expect((document.querySelector('[data-copy="hsl-input"]') as HTMLButtonElement).disabled).toBe(true)
    expect(document.getElementById('converter-status')!.textContent).toContain('前回の結果')
    expect(new URL(document.querySelector<HTMLAnchorElement>('[data-locale="en"]')!.href).searchParams.get('value')).toBe('rgb(invalid)')
    const restored = await converter('/ja/tools/converter' + dom.window.location.search)
    expect((restored.document.getElementById('rgb-input') as HTMLInputElement).value).toBe('rgb(invalid)')
    expect(restored.fetchMock).not.toHaveBeenCalled()
    input('rgb-input', '')
    await vi.advanceTimersByTimeAsync(280)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('ignores an old response during a newer input debounce interval', async () => {
    let resolveOld: (value: ReturnType<typeof response>) => void = () => {}
    const fetchMock = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
      .mockResolvedValue(response())
    const { document, input } = await converter('/ja/tools/converter', fetchMock)
    input('rgb-input', 'rgb(10, 20, 30)')
    resolveOld(response())
    await vi.advanceTimersByTimeAsync(0)
    expect((document.getElementById('rgb-input') as HTMLInputElement).value).toBe('rgb(10, 20, 30)')
    expect(document.getElementById('converter-status')!.textContent).toContain('変換中')
    await vi.advanceTimersByTimeAsync(280)
    expect(fetchMock.mock.calls[1][0]).toContain('rgb=')
  })

  it('retries failures without losing the current source', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(response())
    const { document, click } = await converter('/ja/tools/converter?format=rgb&value=rgb(1,2,3)', fetchMock)
    expect(document.getElementById('converter-retry')!.hidden).toBe(false)
    expect((document.getElementById('rgb-input') as HTMLInputElement).value).toBe('rgb(1,2,3)')
    click('#converter-retry')
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock.mock.calls[0][0]).toBe(fetchMock.mock.calls[1][0])
    expect(document.getElementById('converter-status')!.textContent).toContain('変換しました')
  })
})
