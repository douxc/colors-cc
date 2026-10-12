import { runInContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import { vi } from 'vitest'
import app from '../index'

export class ControlledImage {
  src = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
}

export type ListenerRecord = {
  target: EventTarget
  tagName: string
  className: string
  type: string
}

export async function toolBrowser(path: string, fetchMock = vi.fn()) {
  const html = await (await app.request(path)).text()
  const dom = new JSDOM(html, { url: 'https://colors-cc.top' + path, runScripts: 'outside-only' })
  const images: ControlledImage[] = []
  const errors: Error[] = []
  dom.window.Image = class extends ControlledImage {
    constructor() { super(); images.push(this) }
  } as unknown as typeof dom.window.Image
  dom.window.matchMedia = (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as unknown as typeof dom.window.matchMedia
  dom.window.fetch = fetchMock
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(dom.window.navigator, 'clipboard', { value: { writeText } })
  Object.defineProperty(dom.window.document, 'execCommand', { value: vi.fn().mockReturnValue(false) })
  const listeners: ListenerRecord[] = []
  const eventTargetPrototype = dom.window.EventTarget.prototype
  const originalAddEventListener = eventTargetPrototype.addEventListener
  eventTargetPrototype.addEventListener = function (
    this: EventTarget,
    type: string,
    ...rest: unknown[]
  ) {
    const element = this as unknown as { tagName?: string; className?: string }
    listeners.push({
      target: this,
      tagName: element.tagName ?? this.constructor.name,
      className: typeof element.className === 'string' ? element.className : '',
      type: String(type)
    })
    return (originalAddEventListener as (...args: unknown[]) => void).call(this, type, ...rest)
  }
  for (const script of dom.window.document.querySelectorAll('script:not([type="application/ld+json"])')) {
    try { runInContext(script.textContent || '', dom.getInternalVMContext()) } catch (error) {
      errors.push(error as Error)
    }
  }
  eventTargetPrototype.addEventListener = originalAddEventListener
  return {
    dom, document: dom.window.document, images, errors, fetchMock, writeText, html, listeners,
    listenerCount(selector: string, type: string) {
      return listeners.filter(record => record.type === type && matchesSelector(record.target, selector)).length
    },
    listenerTypes(selector: string) {
      return [...new Set(listeners.filter(record => matchesSelector(record.target, selector)).map(record => record.type))]
    },
    input(id: string, value: string) {
      const input = dom.window.document.getElementById(id) as HTMLInputElement
      input.value = value
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    },
    click(selector: string) { dom.window.document.querySelector<HTMLButtonElement>(selector)!.click() }
  }
}

const matchesSelector = (target: EventTarget, selector: string): boolean => {
  const element = target as unknown as { matches?: (value: string) => boolean }
  return typeof element.matches === 'function' && element.matches(selector)
}
