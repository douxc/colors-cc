import { Hono } from 'hono'
import { randomHex, escapeXml, isValidHex, clamp } from '../../lib/color/utils'

const app = new Hono()

app.get('/placeholder', (c) => {
  const widthRaw = c.req.query('w') || '800'
  const heightRaw = c.req.query('h') || '400'
  const textRaw = c.req.query('text')
  const startColorRaw = c.req.query('start')
  const endColorRaw = c.req.query('end')

  // Validate and clamp dimensions
  const width = clamp(parseInt(widthRaw) || 800, 50, 4000)
  const height = clamp(parseInt(heightRaw) || 400, 50, 4000)
  
  // Validate colors
  let startColor = startColorRaw || randomHex()
  if (startColorRaw && !startColorRaw.startsWith('#')) {
    startColor = '#' + startColorRaw
  }
  if (!isValidHex(startColor)) {
    startColor = randomHex()
  }
  
  let endColor = endColorRaw || randomHex()
  if (endColorRaw && !endColorRaw.startsWith('#')) {
    endColor = '#' + endColorRaw
  }
  if (!isValidHex(endColor)) {
    endColor = randomHex()
  }
  
  // Escape text content
  const text = textRaw ? escapeXml(textRaw.slice(0, 100)) : `${width} x ${height}`
  const fontSize = Math.max(16, Math.min(width, height) * 0.1)

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}px" fill="#ffffff" font-weight="bold" style="text-shadow: 0px 2px 4px rgba(0,0,0,0.3);">
    ${text}
  </text>
</svg>`

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
  return c.body(svg)
})

export default app
