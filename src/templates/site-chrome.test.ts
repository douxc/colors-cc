import { describe, expect, it } from 'vitest'
import { cnSiteConfig, globalSiteConfig } from '../site'
import { renderSiteFooter, renderSiteNav } from './site-chrome'

describe('localized chrome', () => {
  it('provides self-named languages and Japanese navigation and resources', () => {
    const nav = renderSiteNav(globalSiteConfig, 'ja', '/tools/converter')
    for (const label of ['English', '简体中文', '日本語', 'メニューを開く', 'ライトテーマ']) {
      expect(nav).toContain(label)
    }
    expect(nav).toContain('href="/ja/tools/converter"')
    expect(nav).toContain('href="/ja/llms.txt"')
    const footer = renderSiteFooter(globalSiteConfig, 'ja')
    expect(footer).toContain('/ja/openapi.json')
    expect(footer).toContain('/ja/skills/colors-cc.md')
    expect(footer).toContain('フィードバック')
  })

  it('does not offer nonexistent languages on the Chinese deployment', () => {
    expect(renderSiteNav(cnSiteConfig, 'zh', '/')).not.toContain('data-locale=')
    expect(renderSiteFooter(cnSiteConfig, 'zh')).toContain(cnSiteConfig.icp.number)
  })

  it('renders every language as a direct link to the same page', () => {
    const nav = renderSiteNav(globalSiteConfig, 'zh', '/tools/converter')
    const group = nav.match(/<div class="nav-segmented"[^>]*aria-label="语言"[^>]*>([\s\S]*?)<\/div>/)
    expect(group, nav).not.toBeNull()

    const entries = [...group![1].matchAll(/<a[\s\S]*?<\/a>/g)].map(match => match[0])
    expect(entries).toHaveLength(3)
    expect(entries.map(entry => entry.match(/data-locale="(\w+)"/)![1])).toEqual(['en', 'zh', 'ja'])
    expect(entries.map(entry => entry.match(/href="([^"]+)"/)![1])).toEqual([
      '/en/tools/converter',
      '/zh/tools/converter',
      '/ja/tools/converter'
    ])
    expect(entries.map(entry => entry.match(/lang="([^"]+)"/)![1])).toEqual(['en', 'zh-CN', 'ja'])
    expect(entries.map(entry => entry.match(/>([^<]+)<\/a>/)![1])).toEqual(['English', '简体中文', '日本語'])
    expect(entries.filter(entry => entry.includes('aria-current="page"'))).toHaveLength(1)
    expect(entries[1]).toContain('aria-current="page"')

    // The control carries no expandable state of its own.
    expect(group![1]).not.toContain('<summary')
    expect(nav).not.toContain('class="language-toggle"')
    expect(nav).not.toMatch(/<details[^>]*language-control/)
  })
})
