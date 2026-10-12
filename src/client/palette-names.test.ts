import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JSDOM } from 'jsdom'
import { toolBrowser } from './browser-test-utils'

const browsers: JSDOM[] = []
const response = (data: unknown) => ({ ok: true, status: 200, json: async () => data })
afterEach(() => { browsers.splice(0).forEach(dom => dom.window.close()); vi.useRealTimers() })
async function open(path: string, fetchMock: ReturnType<typeof vi.fn>) {
  vi.useFakeTimers()
  const browser = await toolBrowser(path, fetchMock)
  browsers.push(browser.dom); expect(browser.errors).toEqual([])
  await vi.advanceTimersByTimeAsync(0)
  return browser
}

describe('palette and CSS reference workflows', () => {
  it('copies individual and complete palettes with stable machine values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ colors: ['#123456', '#abcdef'] }))
    const { document, dom, click, writeText } = await open('/ja/tools/random-palette?theme=retro', fetchMock)
    expect(document.getElementById('palette-controls-title')!.textContent).toBe('配色の設定')
    expect(fetchMock.mock.calls[0][0]).toContain('theme=retro')
    click('#copy-palette'); await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledWith('#123456,#abcdef')
    click('.palette-swatch'); await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledWith('#123456')
    expect(new URL(document.querySelector<HTMLAnchorElement>('[data-locale="zh"]')!.href).searchParams.get('theme')).toBe('retro')
    const select = document.querySelector('select')!
    select.value = 'monochrome'; select.dispatchEvent(new dom.window.Event('change'))
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock.mock.calls[1][0]).toContain('theme=monochrome')
  })

  it('ignores old palette success and failure after a newer theme succeeds', async () => {
    let resolveFirst: (value: ReturnType<typeof response>) => void = () => {}
    let rejectSecond: (reason: Error) => void = () => {}
    const fetchMock = vi.fn().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve }))
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectSecond = reject }))
      .mockResolvedValue(response({ colors: ['#001122', '#334455'] }))
    const { document, dom } = await open('/ja/tools/random-palette', fetchMock)
    const select = document.querySelector('select')!
    select.value = 'retro'; select.dispatchEvent(new dom.window.Event('change'))
    select.value = 'monochrome'; select.dispatchEvent(new dom.window.Event('change'))
    await vi.advanceTimersByTimeAsync(0)
    resolveFirst(response({ colors: ['#aaaaaa', '#bbbbbb'] })); rejectSecond(new Error('late failure'))
    await vi.advanceTimersByTimeAsync(0)
    expect(document.getElementById('palette-display')!.textContent).toContain('#001122')
    expect(document.getElementById('palette-display')!.textContent).not.toContain('#aaaaaa')
    expect(document.getElementById('palette-status')!.dataset.tone).toBe('success')
  })

  it('retains an old palette on failure and retries its selected theme', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response({ colors: ['#123456', '#abcdef'] }))
      .mockRejectedValueOnce(new Error('offline')).mockResolvedValue(response({ colors: ['#445566', '#778899'] }))
    const { document, click } = await open('/ja/tools/random-palette?theme=retro', fetchMock)
    click('#refresh-btn'); await vi.advanceTimersByTimeAsync(0)
    expect(document.getElementById('palette-display')!.textContent).toContain('#123456')
    expect(document.getElementById('palette-status')!.textContent).toContain('前回の結果')
    expect((document.getElementById('copy-palette') as HTMLButtonElement).disabled).toBe(true)
    click('#palette-retry'); await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock.mock.calls[1][0]).toBe(fetchMock.mock.calls[2][0])
    expect(document.getElementById('palette-status')!.dataset.tone).toBe('success')
  })

  it('applies searches typed before data arrives, clears them and copies standard HEX', async () => {
    let resolve: (value: ReturnType<typeof response>) => void = () => {}
    const fetchMock = vi.fn().mockImplementation(() => new Promise(ready => { resolve = ready }))
    const { document, dom, input, click, writeText } = await open('/ja/tools/color-names', fetchMock)
    input('color-search', 'tom')
    resolve(response({ Tomato: '#FF6347', Blue: '#0000FF' })); await vi.advanceTimersByTimeAsync(0)
    expect(document.querySelectorAll('.color-card')).toHaveLength(1)
    expect(document.getElementById('color-grid')!.textContent).toContain('Tomato')
    expect(new URL(document.querySelector<HTMLAnchorElement>('[data-locale="en"]')!.href).searchParams.get('q')).toBe('tom')
    click('.color-card'); await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledWith('#FF6347')
    click('#clear-search')
    expect(document.querySelectorAll('.color-card')).toHaveLength(2)
    expect(document.activeElement).toBe(document.getElementById('color-search'))
    input('color-search', '0000ff')
    expect(document.getElementById('color-grid')!.textContent).toContain('Blue')
    input('color-search', 'no match')
    expect(document.getElementById('color-status')!.dataset.tone).not.toBe('error')
    expect(document.getElementById('color-status')!.textContent).toContain('一致する色名がありません')
    expect(new URL(dom.window.location.href).searchParams.get('q')).toBe('no match')
  })

  it('retries the CSS directory without dropping the query', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(response({ Tomato: '#FF6347', Blue: '#0000FF' }))
    const { document, click } = await open('/ja/tools/color-names?q=Blue', fetchMock)
    expect(document.getElementById('color-retry')!.hidden).toBe(false)
    click('#color-retry'); await vi.advanceTimersByTimeAsync(0)
    expect((document.getElementById('color-search') as HTMLInputElement).value).toBe('Blue')
    expect(document.querySelectorAll('.color-card')).toHaveLength(1)
  })

  it('rejects malformed data instead of constructing executable HTML', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ '<img src=x onerror=alert(1)>': '#FF6347' }))
    const { document } = await open('/ja/tools/color-names', fetchMock)
    expect(document.querySelector('#color-grid img')).toBeNull()
    expect(document.querySelectorAll('.color-card')).toHaveLength(0)
    expect(document.getElementById('color-retry')!.hidden).toBe(false)
  })
})
