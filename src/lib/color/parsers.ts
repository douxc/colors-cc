// Color format parsers (convert TO HEX)

export function parseRgbToHex(rgbStr: string): string | null {
  const match = rgbStr.match(/\d+/g)
  if (!match || match.length < 3) return null
  const r = parseInt(match[0]), g = parseInt(match[1]), b = parseInt(match[2])
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

export function parseHslToHex(hslStr: string): string | null {
  const match = hslStr.match(/\d+/g)
  if (!match || match.length < 3) return null
  let h = parseInt(match[0]) / 360, s = parseInt(match[1]) / 100, l = parseInt(match[2]) / 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return "#" + (toHex(r) + toHex(g) + toHex(b)).toUpperCase()
}

export function parseCmykToHex(cmykStr: string): string | null {
  const match = cmykStr.match(/\d+/g)
  if (!match || match.length < 4) return null
  let c = parseInt(match[0]) / 100, m = parseInt(match[1]) / 100, y = parseInt(match[2]) / 100, k = parseInt(match[3]) / 100
  let r = 255 * (1 - c) * (1 - k)
  let g = 255 * (1 - m) * (1 - k)
  let b = 255 * (1 - y) * (1 - k)
  const toHex = (x: number) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return "#" + (toHex(r) + toHex(g) + toHex(b)).toUpperCase()
}

export function normalizeToHex(query: any): string | null {
  if (query.hex) {
    let hex = query.hex
    if (!hex.startsWith('#')) hex = '#' + hex
    return /^#[0-9A-F]{6}$/i.test(hex) ? hex : null
  }
  if (query.rgb) return parseRgbToHex(query.rgb)
  if (query.hsl) return parseHslToHex(query.hsl)
  if (query.cmyk) return parseCmykToHex(query.cmyk)
  return null
}
