import { Hono } from 'hono'
import { PALETTES } from '../../lib/color/constants'

const app = new Hono()

app.get('/palette', (c) => {
  const theme = c.req.query('theme') || 'cyberpunk'
  const colors = PALETTES[theme] || PALETTES['cyberpunk']
  
  return c.json({ 
    theme, 
    colors,
    count: colors.length
  })
})

export default app
