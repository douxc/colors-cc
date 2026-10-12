import { runInContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import { vi } from 'vitest'
import app from '../index'

export class ControlledImage {
  src = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
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
  for (const script of dom.window.document.querySelectorAll('script:not([type="application/ld+json"])')) {
    try { runInContext(script.textContent || '', dom.getInternalVMContext()) } catch (error) {
      errors.push(error as Error)
    }
  }
  return {
    dom, document: dom.window.document, images, errors, fetchMock, writeText, html,
    input(id: string, value: string) {
      const input = dom.window.document.getElementById(id) as HTMLInputElement
      input.value = value
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    },
    click(selector: string) { dom.window.document.querySelector<HTMLButtonElement>(selector)!.click() }
  }
}
