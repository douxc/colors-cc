import { Hono } from 'hono'
import { randomHex, escapeXml, isValidHex, clamp } from '../../lib/color/utils'

const app = new Hono()

app.get('/fluid-placeholder', (c) => {
  const widthRaw = c.req.query('w') || '800'
  const heightRaw = c.req.query('h') || '400'
  const textRaw = c.req.query('text')
  const stopsRaw = c.req.query('stops')
  const speedRaw = c.req.query('speed') || '10'

  // Validate and clamp dimensions
  const width = clamp(parseInt(widthRaw) || 800, 50, 4000)
  const height = clamp(parseInt(heightRaw) || 400, 50, 4000)
  
  // Validate and clamp speed (1-30 seconds)
  const speedParsed = parseInt(speedRaw)
  const speed = clamp(isNaN(speedParsed) ? 10 : speedParsed, 1, 30)
  
  // Parse and validate color stops
  const defaultStops = ['#00FF41', '#00B8FF', '#7000FF'] // Aurora theme
  let stops: string[] = defaultStops
  
  if (stopsRaw) {
    const parsedStops = stopsRaw.split(',').map(s => {
      let hex = s.trim()
      if (!hex.startsWith('#')) {
        hex = '#' + hex
      }
      return hex.toUpperCase()
    }).filter(hex => isValidHex(hex))
    
    // Clamp stops count (2-10)
    if (parsedStops.length >= 2 && parsedStops.length <= 10) {
      stops = parsedStops
    }
  }
  
  // Escape text content
  const text = textRaw ? escapeXml(textRaw.slice(0, 100)) : ''
  const fontSize = Math.max(16, Math.min(width, height) * 0.1)

  // Generate stop elements with animation
  const stopElements = stops.map((color, i) => {
    const offset = (i / (stops.length - 1)) * 100
    // Create circular color transition: each stop cycles through all colors
    const values = stops.map((_, j) => stops[(i + j) % stops.length]).join(';')
    
    return `    <stop offset="${offset}%" stop-color="${color}">
      <animate attributeName="stop-color" values="${values};${color}" dur="${speed}s" repeatCount="indefinite" />
    </stop>`
  }).join('\n')

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
${stopElements}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
${text ? `  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}px" fill="#ffffff" font-weight="bold" style="text-shadow: 0px 2px 4px rgba(0,0,0,0.3);">
    ${text}
  </text>` : ''}
</svg>`

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-Control', 'public, max-age=31536000, immutable')
  return c.body(svg)
})

export default app
