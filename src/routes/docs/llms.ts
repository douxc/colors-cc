import { Hono } from 'hono'

const app = new Hono()

app.get('/llms.txt', (c) => {
  const content = `# colors-cc.top - Agent & LLM Documentation
> A free, stateless API designed for AI Agents to generate UI assets, palettes, and colors.

## Base URL
https://colors-cc.top

## Golden Rules for Agents
1. DO NOT HALLUCINATE PARAMETERS. Only use the parameters documented below.
2. ENCODE HEX COLORS. The '#' symbol MUST be encoded as '%23' in URLs.
3. INLINE IMAGES. Use Markdown ![alt](url) or HTML <img> directly; do not fetch image endpoints yourself.
4. DIMENSIONS CLAMPED: Width and height are automatically clamped between 50-4000px.
5. TEXT LIMIT: Placeholder text is truncated to 100 characters.

## API Endpoints

### 1. SVG Gradient Placeholder
Generate dynamic, lightweight SVG gradient images.

**Endpoint:** GET /api/placeholder

**Parameters:**
- w: Width in pixels (default: 800, range: 50-4000)
- h: Height in pixels (default: 400, range: 50-4000)
- text: Center text, URL-encoded (default: "{width} x {height}", max: 100 chars)
- start: Start gradient color as hex (default: random, must be valid 6-digit hex)
- end: End gradient color as hex (default: random, must be valid 6-digit hex)

**Example Prompts:**
- "Create a 1200x630 hero banner placeholder"
  → <img src="https://colors-cc.top/api/placeholder?w=1200&h=630&text=Hero+Banner" alt="Hero">
  
- "Generate a thumbnail with custom gradient from red to blue"
  → <img src="https://colors-cc.top/api/placeholder?w=400&h=300&start=%23FF0000&end=%230000FF" alt="Thumbnail">

**Response:** SVG image with Cache-Control: public, max-age=31536000, immutable

### 1.5. Fluid Animated SVG Placeholder
Generate dynamic SVG gradients with smooth color transitions and animations.

**Endpoint:** GET /api/fluid-placeholder

**Parameters:**
- w: Width in pixels (default: 800, range: 50-4000)
- h: Height in pixels (default: 400, range: 50-4000)
- stops: Comma-separated HEX colors for gradient (default: aurora theme, range: 2-10 colors)
- speed: Animation duration in seconds (default: 10, range: 1-30)
- text: Optional center text (max 100 chars)

**Example Prompts:**
- "Create an animated aurora gradient banner"
  → <img src="https://colors-cc.top/api/fluid-placeholder?w=1200&h=400&stops=%2300FF41,%2300B8FF,%237000FF" alt="Aurora Banner">
  
- "Generate a cyberpunk animated background with text"
  → <img src="https://colors-cc.top/api/fluid-placeholder?w=800&h=600&stops=%23FCEE09,%23FF003C,%2300B8FF&speed=5&text=Welcome" alt="Cyberpunk BG">
  
- "Make an animated hero banner with custom message"
  → <img src="https://colors-cc.top/api/fluid-placeholder?w=1200&h=400&text=Coming+Soon&stops=%2300FF41,%2300B8FF,%237000FF&speed=12" alt="Hero with Text">

**Response:** Animated SVG image with Cache-Control: public, max-age=31536000, immutable

### 2. Random Color
Get a random color in HEX and RGB formats.

**Endpoint:** GET /api/random

**Returns:** {"hex": "#A1B2C3", "rgb": "rgb(161, 178, 195)", "timestamp": "2024-03-12T10:30:00.000Z"}

**Example Prompts:**
- "Give me a random color for my button"
  → fetch('https://colors-cc.top/api/random')
  
- "I need random colors for mock data"
  → Use this endpoint in loops or data generators

### 3. Color Palette
Get curated color palettes by theme.

**Endpoint:** GET /api/palette?theme={theme_name}

**Parameters:**
- theme: Theme name (options: cyberpunk, vaporwave, retro, monochrome; default: cyberpunk)

**Returns:** {"theme": "cyberpunk", "colors": ["#FCEE09", "#00FF41", ...], "count": 5}

**Example Prompts:**
- "Show me a cyberpunk color palette"
  → fetch('https://colors-cc.top/api/palette?theme=cyberpunk')
  
- "I want retro colors for my design"
  → fetch('https://colors-cc.top/api/palette?theme=retro')

### 4. Color Converter
Convert between HEX, RGB, HSL, and CMYK formats.

**Endpoint:** GET /api/convert?hex={hex}|rgb={rgb}|hsl={hsl}|cmyk={cmyk}

**Parameters:** Provide ONE of:
- hex: Hex color (e.g., %23FF5733 or FF5733)
- rgb: RGB string (e.g., rgb(255,87,51))
- hsl: HSL string (e.g., hsl(10,100%,60%))
- cmyk: CMYK string (e.g., cmyk(0%,65%,80%,0%))

**Returns:** {"hex": "#FF5733", "rgb": "rgb(255, 87, 51)", "hsl": "hsl(10, 100%, 60%)", "cmyk": "cmyk(0%, 66%, 80%, 0%)"}

**Error:** {"error": "Invalid color format"} with status 400

**Example Prompts:**
- "Convert #FF5733 to RGB"
  → fetch('https://colors-cc.top/api/convert?hex=%23FF5733')
  
- "What's hsl(200, 50%, 50%) in hex?"
  → fetch('https://colors-cc.top/api/convert?hsl=hsl(200,50%,50%)')

### 5. Color Names Directory
Get all standard CSS color names with their HEX values.

**Endpoint:** GET /api/all-names

**Returns:** {"AliceBlue": "#F0F8FF", "AntiqueWhite": "#FAEBD7", ...}

**Example Prompts:**
- "What's the hex code for 'tomato'?"
  → fetch('https://colors-cc.top/api/all-names') then lookup data.Tomato

## Common Pitfalls

❌ WRONG: start=#FF0000 (unencoded hash)
✅ RIGHT: start=%23FF0000 (encoded hash)

❌ WRONG: Dimensions outside 50-4000 range (will be clamped)
✅ RIGHT: Use w=800&h=600 or any value between 50-4000

❌ WRONG: Fetching SVG content and re-encoding
✅ RIGHT: Use the URL directly in <img> tags

## Rate Limits
None. All endpoints are free and unlimited.

## Web Tools
- Universal Color Converter: https://colors-cc.top/tools/converter
- Random Palette Generator: https://colors-cc.top/tools/random-palette
- CSS Color Names: https://colors-cc.top/tools/color-names
- Fluid Gradient Placeholder: https://colors-cc.top/tools/fluid-placeholder
`
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=86400')
  return c.body(content)
})

export default app
