import { describe, expect, it } from 'vitest'
import app from '../../index'

const withoutProse = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withoutProse)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).filter(([key]) => !['description', 'summary'].includes(key))
    .map(([key, child]) => [key, withoutProse(child)]))
}

describe('Japanese public documentation', () => {
  it('serves localized text and Markdown while retaining root documents', async () => {
    for (const [path, type] of [['llms.txt', 'text/plain'], ['skills/colors-cc.md', 'text/markdown']]) {
      const localized = await app.request('/ja/' + path)
      expect(localized.status).toBe(200)
      expect(localized.headers.get('content-type')).toContain(type)
      const text = await localized.text()
      expect(text).toContain('パラメーター')
      expect(text).toContain('https://api.colors-cc.top/convert?')
      expect(text).toContain('%23')
      expect(text).toContain('https://colors-cc.top/ja/tools/converter')
      const legacy = await app.request('/' + path)
      expect(legacy.status).toBe(200)
      expect(await legacy.text()).toContain('Golden Rules')
    }
  })

  it('localizes OpenAPI prose without changing its machine-readable contract', async () => {
    const root = await (await app.request('/openapi.json')).json()
    const japanese = await app.request('/ja/openapi.json')
    expect(japanese.status).toBe(200)
    expect(japanese.headers.get('content-type')).toContain('application/json')
    const localized = await japanese.json()
    expect(withoutProse(localized)).toEqual(withoutProse(root))
    expect(JSON.stringify(localized)).toContain('入力パラメーターは1つだけ')
    expect(JSON.stringify(localized)).not.toContain('Get a random HEX')
  })

  it('connects Japanese developer links', async () => {
    const html = await (await app.request('/ja')).text()
    for (const path of ['llms.txt', 'openapi.json', 'skills/colors-cc.md']) {
      expect(html).toContain(`href="/ja/${path}"`)
    }
  })

  it('sends Japanese documentation readers to the Japanese offline-tools path', async () => {
    const llms = await (await app.request('/ja/llms.txt')).text()
    expect(llms).toContain('https://offline-tools.colors-cc.top/ja/image-compress/')
    // English owns the destination root, so the un-prefixed address would hand a
    // Japanese reader an English page.
    expect(llms).not.toContain('https://offline-tools.colors-cc.top/image-compress/')
  })
})
