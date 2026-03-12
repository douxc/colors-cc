import { Hono } from 'hono'
import { COLOR_NAMES } from '../../lib/color/constants'

const app = new Hono()

app.get('/all-names', (c) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
  return c.json(COLOR_NAMES)
})

export default app
