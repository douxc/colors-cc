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
})
