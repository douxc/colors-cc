import { Hono } from 'hono'
import { randomHex } from '../../lib/color/utils'
import { hexToRgb } from '../../lib/color/converters'

const app = new Hono()

app.get('/random', (c) => {
  const hex = randomHex()
  return c.json({
    hex: hex,
    rgb: hexToRgb(hex),
    timestamp: new Date().toISOString()
  })
})

export default app
