import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import app from '../../index'
import { createApp } from '../../app'
import { cnSiteConfig, globalSiteConfig, htmlLang } from '../../site'
import home from '../../templates/home.html'
import { PAGE_PATHS } from './sitemap'

describe('Japanese discovery and deployment compatibility', () => {
  it('provides Japanese metadata and reciprocal alternates on every page', async () => {
    for (const locale of globalSiteConfig.enabledLocales) for (const path of PAGE_PATHS) {
      const address = `/${locale}${path === '/' ? '' : path}`
      const res = await app.request(address + '?q=draft')
      expect(res.status).toBe(200)
      const dom = new JSDOM(await res.text())
      const doc = dom.window.document
      expect(doc.documentElement.lang).toBe(htmlLang(locale))
      expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(globalSiteConfig.origin + address)
      expect(doc.querySelector('link[hreflang="ja"]')!.getAttribute('href')).toBe(globalSiteConfig.origin + '/ja' + (path === '/' ? '' : path))
      if (locale === 'ja') {
        expect(doc.querySelector('[property="og:locale"]')!.getAttribute('content')).toBe('ja_JP')
        expect(doc.title).toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/)
        const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent || '{}')['@graph'] as Record<string, unknown>[]
        expect(graph.some(item => item.inLanguage === 'ja')).toBe(true)
      }
      dom.window.close()
    }
  })

  it('lists all 51 global and only 17 CN pages in both sitemap formats', async () => {
    const cn = createApp(cnSiteConfig, { home })
    for (const [site, count] of [[app, 51], [cn, 17]] as const) {
      const xml = await (await site.request('/sitemap.xml')).text()
      const txt = await (await site.request('/sitemap.txt')).text()
      expect([...xml.matchAll(/<loc>/g)]).toHaveLength(count)
      expect(txt.trim().split('\n')).toHaveLength(count)
      expect(xml).toContain('hreflang="ja" href="https://colors-cc.top/ja')
      if (count === 17) expect(txt).not.toContain('/ja')
      else for (const path of PAGE_PATHS) expect(txt).toContain('https://colors-cc.top/ja' + (path === '/' ? '' : path))
    }
    expect((await cn.request('/ja')).status).toBe(404)
    const html = await (await cn.request('/zh/tools/converter')).text()
    expect(html).toContain('hreflang="ja" href="https://colors-cc.top/ja/tools/converter"')
    expect(html).not.toContain('data-locale="ja"')
  })
})
