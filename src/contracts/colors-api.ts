export const API_BASE_URL = 'https://api.colors-cc.top'

export const PLACEHOLDER_EFFECTS = [
  'static',
  'fluid',
  'breathe',
  'holographic',
  'mesh'
] as const

export const PALETTE_THEMES = [
  'cyberpunk',
  'vaporwave',
  'retro',
  'monochrome'
] as const

export const COLOR_FORMATS = ['hex', 'rgb', 'hsl', 'cmyk'] as const

export const PLACEHOLDER_LIMITS = {
  width: { min: 50, max: 4000, default: 800 },
  height: { min: 50, max: 4000, default: 400 },
  speed: { min: 1, max: 30, default: 10 },
  textMaxLength: 100,
  palette: { min: 2, max: 10 }
} as const

export const PLACEHOLDER_PRESETS = [
  {
    id: 'aurora',
    name: 'Aurora',
    colors: ['#FFD6A5', '#FFADAD', '#E2A0FF']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: ['#FCEE09', '#FF003C', '#00B8FF']
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    colors: ['#01CDFE', '#05FFA1', '#B967FF']
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF71CE', '#FFFB96', '#E24E1B']
  }
] as const

export const DEFAULT_PLACEHOLDER = {
  effect: 'mesh',
  palette: PLACEHOLDER_PRESETS[0].colors,
  width: PLACEHOLDER_LIMITS.width.default,
  height: PLACEHOLDER_LIMITS.height.default,
  speed: PLACEHOLDER_LIMITS.speed.default,
  text: ''
} as const

export const PUBLIC_COLOR_API_CONTRACT = {
  baseUrl: API_BASE_URL,
  placeholder: {
    effects: PLACEHOLDER_EFFECTS,
    limits: PLACEHOLDER_LIMITS,
    presets: PLACEHOLDER_PRESETS,
    defaults: DEFAULT_PLACEHOLDER
  },
  paletteThemes: PALETTE_THEMES,
  colorFormats: COLOR_FORMATS
} as const

export type PlaceholderEffect = typeof PLACEHOLDER_EFFECTS[number]
export type PaletteTheme = typeof PALETTE_THEMES[number]
export type ColorFormat = typeof COLOR_FORMATS[number]
