import { JSDOM } from 'jsdom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toolRuntimeScript } from './runtime'

type Runtime = {
  read: (defaults: Record<string, string>) => Record<string, string>
  save: (values: Record<string, string>) => void
  track: (reader: () => Record<string, string>) => void
  palette: (value: string, allowMissingHash?: boolean) => { colors: string[]; error: string }
  fieldError: (input: Element, message: string) => boolean
  status: (input: Element, message: string, tone?: string, previous?: boolean) => void
  copy: (value: string, button: Element, feedback?: Element) => Promise<boolean>
  intent: () => { begin: () => { id: number; signal: AbortSignal }; invalidate: () => void; current: (id: number) => boolean }
  json: (url: string, signal: AbortSignal, valid: (data: unknown) => boolean) => Promise<unknown>
}

const browsers: JSDOM[] = []
function browser(search = '') {
  const dom = new JSDOM('<a data-locale="ja" href="/ja/tools/converter">日本語</a><input id="value"><button id="copy">Copy</button><div id="status"></div>', {
    url: 'https://colors-cc.top/en/tools/converter' + search, runScripts: 'outside-only'
  })
  browsers.push(dom)
  const tools = dom.window.eval(toolRuntimeScript('ja') + '\n;Tools') as Runtime
  return { dom, tools, document: dom.window.document }
}

afterEach(() => { browsers.splice(0).forEach(dom => dom.window.close()); vi.useRealTimers() })

describe('shared visitor behavior', () => {
  it('round-trips each tool state, preserving invalid drafts and fragments', () => {
    const cases: Record<string, string>[] = [
      { w: '', h: '400', palette: '#112233,bad,#445566', effect: 'mesh', speed: '10', text: '日本語 & #', attribution: '0' },
      { format: 'rgb', value: 'rgb(invalid)' }, { theme: 'retro' },
      { q: 'Tomato & <test>' }, { palette: '#112233,bad', speed: '5', text: '流動' }
    ]
    for (const state of cases) {
      const { dom, tools } = browser('#create')
      tools.save(state)
      expect(tools.read(state)).toEqual(state)
      expect(dom.window.location.hash).toBe('#create')
      expect(new URL(dom.window.document.querySelector('a')!.href).searchParams.get(Object.keys(state)[0]))
        .toBe(Object.values(state)[0])
      const reloaded = browser(dom.window.location.search + '#create')
      expect(reloaded.tools.read(state)).toEqual(state)
    }
  })

  it('keeps latest input on language links even when history is unavailable', () => {
    const { dom, tools, document } = browser('?value=old#result')
    vi.spyOn(dom.window.history, 'replaceState').mockImplementation(() => { throw new Error('unavailable') })
    let value = 'initial'
    tools.track(() => ({ format: 'rgb', value }))
    value = 'rgb(1, 2, 3)'
    const link = document.querySelector('a')!
    link.dispatchEvent(new dom.window.Event('click', { cancelable: true }))
    const target = new URL(link.href)
    expect(target.pathname).toBe('/ja/tools/converter')
    expect(target.hash).toBe('#result')
    expect(target.searchParams.get('value')).toBe(value)
  })

  it('rejects every invalid color and associates field errors', () => {
    const { tools, document } = browser()
    expect(tools.palette('#112233,bad,#445566').colors).toEqual([])
    expect(tools.palette('#112233,bad,#445566').error).toContain('2番目')
    expect(tools.palette('112233,445566', true).colors).toEqual(['#112233', '#445566'])
    const field = document.getElementById('value')!
    tools.fieldError(field, '入力を確認')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(field.getAttribute('aria-describedby')).toBe('value-error')
    expect(document.getElementById('value-error')!.textContent).toBe('入力を確認')
    tools.fieldError(field, '')
    expect(field.getAttribute('aria-invalid')).toBe('false')
    tools.status(document.getElementById('status')!, '再試行', 'error', true)
    expect(document.getElementById('status')!.textContent).toContain('前回の結果')
  })

  it('confirms primary and fallback copying, and provides raw text when both fail', async () => {
    const { dom, tools, document } = browser()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(dom.window.navigator, 'clipboard', { value: { writeText } })
    const fallback = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', { value: fallback })
    const button = document.getElementById('copy')!
    expect(await tools.copy('#123456', button)).toBe(true)
    expect(button.textContent).toContain('コピーしました')
    writeText.mockRejectedValue(new Error('denied'))
    expect(await tools.copy('#abcdef', button)).toBe(true)
    expect(fallback).toHaveBeenCalledWith('copy')
    fallback.mockReturnValue(false)
    expect(await tools.copy('<original>&value', button)).toBe(false)
    expect((document.getElementById('manual-copy-text') as HTMLTextAreaElement).value).toBe('<original>&value')
    expect(document.getElementById('copy-status')!.textContent).toContain('コピーできません')
    expect(button.textContent).toBe('Copy')
    document.querySelector<HTMLButtonElement>('#manual-copy button')!.click()
    expect(document.activeElement).toBe(button)
    fallback.mockImplementation(() => { throw new Error('failed') })
    expect(await tools.copy('again', button)).toBe(false)
  })

  it('protects feedback during consecutive pending copies', async () => {
    const { dom, tools, document } = browser()
    let resolveFirst: (() => void) | undefined
    const writeText = vi.fn().mockImplementationOnce(() => new Promise<void>(resolve => { resolveFirst = resolve }))
      .mockResolvedValue(undefined)
    Object.defineProperty(dom.window.navigator, 'clipboard', { value: { writeText } })
    const button = document.getElementById('copy')!
    const first = tools.copy('first', button)
    await tools.copy('second', button)
    resolveFirst!()
    await first
    expect(button.textContent).toContain('コピーしました')
  })

  it('invalidates old responses immediately, including the debounce interval', async () => {
    const { dom, tools } = browser()
    const requests = tools.intent()
    const first = requests.begin()
    requests.invalidate()
    expect(first.signal.aborted).toBe(true)
    expect(requests.current(first.id)).toBe(false)
    const second = requests.begin()
    expect(requests.current(second.id)).toBe(true)
    dom.window.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ colors: ['bad'] }) })
    await expect(tools.json('/palette', second.signal, () => false)).rejects.toThrow('Invalid response')
  })
})
