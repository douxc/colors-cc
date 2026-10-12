// Browser-level verification for the flattened language switch. Kept out of the
// default suite because it needs a real Chrome; run it on demand:
//
//   node_modules/.bin/vitest run --config vitest.e2e.config.ts
//
// The structural guard lives in language-switch.test.ts, which runs everywhere.
import { createServer, type Server } from 'node:http'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../src/index'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const chromeAvailable = existsSync(CHROME)

type Cdp = {
  send(method: string, params?: Record<string, unknown>): Promise<any>
  evaluate<T = any>(expression: string): Promise<T>
  events: { method: string; params: any }[]
  close(): void
}

let server: Server
let origin = ''
let chrome: ChildProcess
let profile = ''
let cdp: Cdp

const localeOf = (url: string): string => new URL(url).pathname.split('/')[1]

const startSite = async (): Promise<void> => {
  server = createServer((request, response) => {
    void (async () => {
      try {
        const url = new URL(request.url ?? '/', 'http://127.0.0.1')
        const rendered = await app.request(url.pathname + url.search)
        response.writeHead(rendered.status, {
          'Content-Type': rendered.headers.get('Content-Type') ?? 'text/html; charset=utf-8'
        })
        response.end(await rendered.text())
      } catch (error) {
        response.writeHead(500, { 'Content-Type': 'text/plain' })
        response.end(String(error))
      }
    })()
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('site server did not bind a port')
  origin = `http://127.0.0.1:${address.port}`
}

const startChrome = async (): Promise<string> => {
  profile = mkdtempSync(join(tmpdir(), 'colors-cc-e2e-'))
  chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-crashpad',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] })

  return await new Promise<string>((resolve, reject) => {
    let output = ''
    const timer = setTimeout(() => reject(new Error(`chrome never reported a debugger endpoint:\n${output}`)), 30000)
    chrome.stderr!.on('data', (chunk: Buffer) => {
      output += chunk.toString()
      const match = output.match(/ws:\/\/[^\s]+/)
      if (match) { clearTimeout(timer); resolve(match[0]) }
    })
    chrome.on('exit', code => { clearTimeout(timer); reject(new Error(`chrome exited early with ${code}`)) })
  })
}

const connect = async (wsUrl: string): Promise<Cdp> => {
  const browser = new WebSocket(wsUrl)
  await new Promise((resolve, reject) => {
    browser.addEventListener('open', resolve, { once: true })
    browser.addEventListener('error', reject, { once: true })
  })

  let nextId = 0
  const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>()
  const events: { method: string; params: any }[] = []
  browser.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data))
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id)!
      pending.delete(message.id)
      message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result)
    } else if (message.method) {
      events.push(message)
    }
  })

  const rawSend = (method: string, params: Record<string, unknown> = {}, sessionId?: string) =>
    new Promise<any>((resolve, reject) => {
      const id = ++nextId
      pending.set(id, { resolve, reject })
      browser.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })

  const { targetId } = await rawSend('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await rawSend('Target.attachToTarget', { targetId, flatten: true })
  const send = (method: string, params: Record<string, unknown> = {}) => rawSend(method, params, sessionId)

  const evaluate = async <T>(expression: string): Promise<T> => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
    return result.value as T
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  return { send, evaluate, events, close: () => browser.close() }
}

const settle = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms))

const viewport = (width: number, height = 900) =>
  cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: width <= 760 ? 2 : 1, mobile: width <= 760 })

const open = async (path: string): Promise<void> => {
  await cdp.send('Page.navigate', { url: `${origin}${path}` })
  await settle()
}

const pageState = () => cdp.evaluate<{ url: string; lang: string }>(
  `({ url: location.href, lang: document.documentElement.lang })`)

const realClick = async (selector: string): Promise<void> => {
  const box = await cdp.evaluate<{ x: number; y: number; w: number } | null>(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)})
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width }
  })()`)
  expect(box, selector).not.toBeNull()
  expect(box!.w).toBeGreaterThan(0)
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box!.x, y: box!.y })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box!.x, y: box!.y, button: 'left', clickCount: 1, buttons: 1 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box!.x, y: box!.y, button: 'left', clickCount: 1, buttons: 0 })
}

const pressKey = async (key: string, code: string, keyCode: number): Promise<void> => {
  for (const type of ['rawKeyDown', 'keyUp']) {
    await cdp.send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode })
  }
}

describe.skipIf(!chromeAvailable)('language switch in a real browser', () => {
  beforeAll(async () => {
    await startSite()
    cdp = await connect(await startChrome())
  }, 60000)

  afterAll(() => {
    cdp?.close()
    chrome?.kill('SIGKILL')
    server?.close()
    if (profile) rmSync(profile, { recursive: true, force: true })
  })

  it('switches language on pointer activation from every locale', async () => {
    const directions = [
      { from: '/en', option: 'zh', to: 'zh', lang: 'zh-CN' },
      { from: '/zh', option: 'en', to: 'en', lang: 'en' },
      { from: '/ja', option: 'zh', to: 'zh', lang: 'zh-CN' }
    ]
    for (const direction of directions) {
      await viewport(1280)
      await open(direction.from)
      const visible = await cdp.evaluate<boolean>(
        `(() => { const a = document.querySelector('a[data-locale="${direction.option}"]'); const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0 })()`)
      expect(visible, direction.from).toBe(true)
      await realClick(`a[data-locale="${direction.option}"]`)
      await settle(2000)
      const state = await pageState()
      expect(localeOf(state.url), direction.from).toBe(direction.to)
      expect(state.lang, direction.from).toBe(direction.lang)
    }
  }, 60000)

  it('carries no disclosure state on the language control', async () => {
    await viewport(1280)
    await open('/en')
    const disclosure = await cdp.evaluate<number>(
      `document.querySelectorAll('details.language-control, .language-toggle, .language-control summary').length`)
    expect(disclosure).toBe(0)
  })

  it('reaches the target language from the keyboard alone', async () => {
    await viewport(1280)
    await open('/en')
    await cdp.evaluate(`(() => {
      const sentinel = document.createElement('button')
      sentinel.id = 'tab-sentinel'
      sentinel.textContent = 'sentinel'
      document.querySelector('.language-control').before(sentinel)
      sentinel.focus()
      return true
    })()`)
    await pressKey('Tab', 'Tab', 9)
    await pressKey('Tab', 'Tab', 9)
    const focused = await cdp.evaluate<{ active: string; visible: boolean }>(`(() => {
      const active = document.activeElement
      const zh = document.querySelector('a[data-locale="zh"]')
      const r = zh.getBoundingClientRect()
      return { active: active.tagName + ':' + (active.dataset?.locale ?? ''), visible: r.width > 0 && r.height > 0 }
    })()`)
    expect(focused.active).toBe('A:zh')
    expect(focused.visible).toBe(true)
    await pressKey('Enter', 'Enter', 13)
    await settle(2000)
    const state = await pageState()
    expect(localeOf(state.url)).toBe('zh')
    expect(state.lang).toBe('zh-CN')
  }, 60000)

  it('does not let the header overflow because of the language entries', async () => {
    await viewport(360)
    await open('/en')
    const withoutLanguageControl = await cdp.evaluate<any>(`(() => {
      const header = document.querySelector('.site-nav')
      const control = document.querySelector('.language-control')
      const before = { client: header.clientWidth, scroll: header.scrollWidth }
      control.remove()
      const after = { client: header.clientWidth, scroll: header.scrollWidth }
      return { before, after, viewport: innerWidth, shell: getComputedStyle(document.querySelector('.app-shell')).paddingInlineStart }
    })()`)
    // Removing the control must not change whether the header overflows: whatever
    // slack the header lacks is not attributable to the language entries.
    expect(
      withoutLanguageControl.after.scroll > withoutLanguageControl.after.client + 1,
      JSON.stringify(withoutLanguageControl)
    ).toBe(withoutLanguageControl.before.scroll > withoutLanguageControl.before.client + 1)
  }, 60000)

  it('keeps the header usable at every breakpoint', async () => {
    for (const width of [360, 390, 430, 760, 1280]) {
      await viewport(width)
      await open('/en')
      if (width <= 760) {
        // The compact navigation starts collapsed at the same breakpoint the CSS uses.
        await cdp.evaluate(`(() => { const menu = document.querySelector('.nav-menu'); if (menu) menu.open = true; return true })()`)
        await settle(200)
      }
      const metrics = await cdp.evaluate<any>(`(() => {
        const size = (el) => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } }
        const header = document.querySelector('.site-nav')
        return {
          headerOverflow: header.scrollWidth > header.clientWidth + 1,
          bodyOverflow: document.documentElement.scrollWidth > innerWidth,
          links: [...document.querySelectorAll('a[data-locale]')].map(a => ({
            locale: a.dataset.locale, ...size(a), clipped: a.scrollWidth > a.clientWidth + 1, visible: a.getBoundingClientRect().width > 0
          })),
          themes: [...document.querySelectorAll('[data-theme-option]')].map(size)
        }
      })()`)
      const label = `width ${width} ${JSON.stringify(metrics)}`
      expect(metrics.bodyOverflow, label).toBe(false)
      expect(metrics.links.filter((link: any) => link.clipped).map((link: any) => link.locale), label).toEqual([])
      expect(metrics.links.filter((link: any) => !link.visible).map((link: any) => link.locale), label).toEqual([])
      expect(metrics.themes.map((theme: any) => `${theme.w}x${theme.h}`), label).toEqual(['44x44', '44x44', '44x44'])
    }
  }, 120000)

  it('preserves query and fragment when switching language', async () => {
    await viewport(1280)
    await open('/en?palette=%23112233,%23445566&text=%E6%97%A5%E6%9C%AC%E8%AA%9E#agent-output')
    await realClick('a[data-locale="zh"]')
    await settle(2000)
    const state = await pageState()
    const url = new URL(state.url)
    expect(localeOf(state.url)).toBe('zh')
    expect(url.searchParams.get('palette')).toBe('#112233,#445566')
    expect(url.searchParams.get('text')).toBe('日本語')
    expect(url.hash).toBe('#agent-output')
  }, 60000)

  it('runs without page errors', () => {
    const errors = cdp.events.filter(event =>
      event.method === 'Runtime.exceptionThrown' ||
      (event.method === 'Log.entryAdded' && event.params.entry.level === 'error'))
    expect(errors.map(event => JSON.stringify(event.params).slice(0, 200))).toEqual([])
  })
})
