import { describe, expect, it } from 'vitest'
import { cnSiteConfig, globalSiteConfig, htmlLang, hreflangAlternates, localizedPath } from './site'

describe('deployment locales', () => {
  it('adds Japanese on the global deployment and preserves Chinese deployment', () => {
    expect(globalSiteConfig.enabledLocales).toEqual(['en', 'zh', 'ja'])
    expect(cnSiteConfig.enabledLocales).toEqual(['zh'])
    expect(globalSiteConfig.defaultLocale).toBe('en')
    expect(htmlLang('ja')).toBe('ja')
    expect(htmlLang('zh')).toBe('zh-CN')
    expect(localizedPath('ja', '/tools/converter')).toBe('/ja/tools/converter')
    expect(localizedPath('en')).toBe('/en')
  })

  it('keeps every alternate on the canonical origin', () => {
    expect(hreflangAlternates('/tools/converter')).toContainEqual({
      hreflang: 'ja', href: 'https://colors-cc.top/ja/tools/converter'
    })
    expect(hreflangAlternates('/tools/converter')).toContainEqual({
      hreflang: 'zh-CN', href: 'https://colors-cc.top/zh/tools/converter'
    })
    expect(hreflangAlternates('/tools/converter')).toContainEqual({
      hreflang: 'zh-Hans', href: 'https://colors-cc.top/zh/tools/converter'
    })
    // The retired CN host must never come back as a cross-domain alternate.
    expect(hreflangAlternates('/tools/converter').every(alternate =>
      alternate.href.startsWith('https://colors-cc.top'))).toBe(true)
  })
})
