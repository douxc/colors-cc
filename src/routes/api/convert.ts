import { Hono } from 'hono'
import { normalizeToHex } from '../../lib/color/parsers'
import { hexToRgb, hexToHsl, hexToCmyk } from '../../lib/color/converters'

const app = new Hono()

app.get('/convert', (c) => {
  const query = c.req.query()
  if (!query.hex && !query.rgb && !query.hsl && !query.cmyk) {
    return c.json({ error: 'Missing color parameter (hex, rgb, hsl, or cmyk)' }, 400)
  }
  
  const baseHex = normalizeToHex(query)
  if (!baseHex) return c.json({ error: 'Invalid color format' }, 400)

  const rgb = hexToRgb(baseHex)
  const hsl = hexToHsl(baseHex)
  const cmyk = hexToCmyk(baseHex)

  return c.json({ hex: baseHex, rgb, hsl, cmyk })
})

export default app
