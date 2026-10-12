import { describe, expect, it } from 'vitest'
import { commonMessages } from './index'
import {
  effectMessages, escapeHtml, formatMessage, homeMessages, paletteThemeMessages,
  presetMessages, renderHomeMessages, scriptJson, seoMessages, statusMessages, toolMessages
} from './messages'
import { PALETTE_THEMES, PLACEHOLDER_EFFECTS, PLACEHOLDER_PRESETS } from '../contracts/colors-api'
import app from '../index'

describe('locale messages', () => {
  it('covers the same nonempty keys for all three languages', () => {
    for (const messages of [commonMessages, homeMessages, toolMessages, statusMessages,
      effectMessages, paletteThemeMessages, presetMessages, seoMessages]) {
      for (const locale of ['zh', 'ja'] as const) {
        expect(Object.keys(messages[locale]).sort()).toEqual(Object.keys(messages.en).sort())
        expect(Object.values(messages[locale]).every(value => value.length > 0)).toBe(true)
      }
    }
  })

  it('does not expose user text as HTML or a closing script tag', () => {
    const input = '</script><img src=x onerror=alert(1)>\u2028'
    expect(scriptJson({ value: input })).not.toContain('</script>')
    expect(JSON.parse(scriptJson({ value: input })).value).toBe(input)
    expect(escapeHtml(input)).not.toContain('<img')
    expect(renderHomeMessages('<h1>{{home.hero}}</h1>', 'ja')).toContain(homeMessages.ja.hero)
  })

  it('interpolates values literally and covers contract identifiers', () => {
    expect(formatMessage('{value}', { value: '$&{value}' })).toBe('$&{value}')
    for (const id of PLACEHOLDER_EFFECTS) expect(effectMessages.ja[id]).toBeTruthy()
    for (const id of PALETTE_THEMES) expect(paletteThemeMessages.ja[id]).toBeTruthy()
    for (const preset of PLACEHOLDER_PRESETS) expect(presetMessages.ja[preset.id]).toBeTruthy()
  })

  it('keeps machine values while showing Japanese presets and themes', async () => {
    const palette = await (await app.request('/ja/tools/random-palette')).text()
    expect(palette).toContain('value="cyberpunk">サイバーパンク')
    const fluid = await (await app.request('/ja/tools/fluid-placeholder')).text()
    expect(fluid).toContain('オーロラの配色を使用')
    expect(fluid).toContain('data-palette="#FFD6A5,#FFADAD,#E2A0FF"')
    const home = await (await app.request('/ja')).text()
    expect(home).toContain('"fluid":"流動"')
    expect(home).toContain('"id":"cyberpunk"')
  })
})
