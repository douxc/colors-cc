import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JSDOM } from 'jsdom'
import { toolBrowser } from './browser-test-utils'

const browsers: JSDOM[] = []
afterEach(() => { browsers.splice(0).forEach(dom => dom.window.close()); vi.useRealTimers() })
async function fluid(query = '') {
  vi.useFakeTimers()
  const browser = await toolBrowser('/ja/tools/fluid-placeholder' + query)
  browsers.push(browser.dom); expect(browser.errors).toEqual([])
  await vi.advanceTimersByTimeAsync(0)
  return browser
}

describe('fluid SVG workflow', () => {
  it('restores parameters and copies the valid snapshot before preview loads', async () => {
    const { document, images, click, writeText } = await fluid('?palette=%23112233,%23445566&speed=5&text=日本語')
    expect(document.getElementById('fluid-controls-title')!.textContent).toBe('アニメーション設定')
    expect((document.getElementById('fluid-speed-number') as HTMLInputElement).value).toBe('5')
    expect(new URL(images[0].src).searchParams.get('text')).toBe('日本語')
    click('#copy-fluid-url'); await vi.advanceTimersByTimeAsync(0)
    expect(writeText).toHaveBeenCalledWith(images[0].src)
    const language = document.querySelector<HTMLAnchorElement>('[data-locale="en"]')!
    expect(new URL(language.href).searchParams.get('text')).toBe('日本語')
    expect(document.getElementById('fluid-speed-number')!.closest('details')!.open).toBe(false)
  })

  it('retains old previews but never copies an invalid draft URL', async () => {
    const { document, images, input, click, writeText } = await fluid()
    images[0].onload!()
    input('fluid-palette', '#112233,invalid,#445566')
    expect(document.getElementById('fluid-palette-error')!.textContent).toContain('2番目')
    expect((document.getElementById('copy-fluid-url') as HTMLButtonElement).disabled).toBe(true)
    expect(document.getElementById('fluid-status')!.textContent).toContain('前回の結果')
    click('#copy-fluid-url'); expect(writeText).not.toHaveBeenCalled()
    expect((document.getElementById('fluid-preview') as HTMLImageElement).src).toBe(images[0].src)
  })

  it('keeps presets and preview consistent despite delayed image callbacks', async () => {
    const { document, images, click } = await fluid()
    click('[data-palette="#FCEE09,#FF003C,#00B8FF"]'); await vi.advanceTimersByTimeAsync(0)
    images[1].onload!(); images[0].onerror!()
    expect((document.getElementById('fluid-preview') as HTMLImageElement).src).toBe(images[1].src)
    expect(document.getElementById('fluid-status')!.dataset.tone).toBe('success')
    expect((document.getElementById('fluid-palette') as HTMLInputElement).value).toBe('#FCEE09, #FF003C, #00B8FF')
  })

  it('retries failed images and reveals errors inside advanced controls', async () => {
    const { document, images, click, input } = await fluid()
    images[0].onerror!()
    expect((document.getElementById('copy-fluid-url') as HTMLButtonElement).disabled).toBe(false)
    click('#fluid-retry'); await vi.advanceTimersByTimeAsync(0)
    expect(images).toHaveLength(2)
    input('fluid-speed-number', '99')
    expect(document.getElementById('fluid-speed-number')!.closest('details')!.open).toBe(true)
    expect(document.getElementById('fluid-speed-number')!.getAttribute('aria-invalid')).toBe('true')
    expect((document.getElementById('copy-fluid-url') as HTMLButtonElement).disabled).toBe(true)
  })
})
