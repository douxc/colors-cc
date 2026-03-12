import { Hono } from 'hono'

const app = new Hono()

app.get('/skills/colors-cc.md', (c) => {
  const content = `# SKILL: ColorsCC

## Description
A native UI asset and color toolset for AI Agents (OpenClaw, Cursor, Cline, GPTs). Use this when you need to mock up frontends, select palettes, or convert colors without hallucinating data.

## When to Use This Skill
- User asks for placeholder images, mock images, or demo content
- User needs color palettes, random colors, or color conversions
- User is building UI mockups or prototypes
- User needs to generate frontend code with visual assets

## Golden Rules
1. **ALWAYS encode '#' as '%23' in URLs** - This is the #1 mistake agents make
2. **Use URLs directly in <img> tags** - Don't fetch and re-encode SVG content
3. **Don't hallucinate parameters** - Only use documented parameters below
4. **Dimensions are clamped** - Valid range is 50-4000px (auto-clamped if outside)
5. **Text is truncated** - Max 100 characters for placeholder text

## Quick Reference

### Placeholder Images
\`\`\`html
<!-- Basic placeholder -->
<img src="https://colors-cc.top/api/placeholder?w=800&h=400" alt="Placeholder">

<!-- With custom text -->
<img src="https://colors-cc.top/api/placeholder?w=1200&h=630&text=Hero+Banner" alt="Hero">

<!-- With custom gradient -->
<img src="https://colors-cc.top/api/placeholder?w=400&h=300&start=%23FF003C&end=%2300B8FF" alt="Card">

<!-- Animated fluid placeholder with text -->
<img src="https://colors-cc.top/api/fluid-placeholder?w=1200&h=600&stops=%2300FF41,%2300B8FF,%237000FF&text=Coming+Soon&speed=8" alt="Animated Hero">
\`\`\`

### Random Colors (JSON)
\`\`\`bash
curl https://colors-cc.top/api/random
# Returns: {"hex": "#A1B2C3", "rgb": "rgb(161, 178, 195)", "timestamp": "..."}
\`\`\`

### Theme Palettes (JSON)
\`\`\`bash
curl "https://colors-cc.top/api/palette?theme=cyberpunk"
# Returns: {"theme": "cyberpunk", "colors": ["#FCEE09", ...], "count": 5}
# Themes: cyberpunk, vaporwave, retro, monochrome
\`\`\`

### Color Conversion (JSON)
\`\`\`bash
curl "https://colors-cc.top/api/convert?hex=%23FF5733"
# Returns: {"hex": "#FF5733", "rgb": "...", "hsl": "...", "cmyk": "..."}

# Also supports: ?rgb=..., ?hsl=..., ?cmyk=...
\`\`\`

### CSS Color Names (JSON)
\`\`\`bash
curl "https://colors-cc.top/api/all-names"
# Returns: {"AliceBlue": "#F0F8FF", "Tomato": "#FF6347", ...}
\`\`\`

## Common Use Cases

### 1. Building a Landing Page
\`\`\`html
<section>
  <img src="https://colors-cc.top/api/placeholder?w=1200&h=600&text=Hero+Section" alt="Hero">
</section>
<div class="features">
  <img src="https://colors-cc.top/api/placeholder?w=400&h=300&text=Feature+1" alt="Feature 1">
  <img src="https://colors-cc.top/api/placeholder?w=400&h=300&text=Feature+2" alt="Feature 2">
</div>
\`\`\`

### 2. Generating Mock Data with Colors
\`\`\`javascript
const colors = await fetch('https://colors-cc.top/api/palette?theme=vaporwave')
  .then(r => r.json())

const mockData = colors.colors.map((color, i) => ({
  id: i,
  name: \`Item \${i+1}\`,
  color: color
}))
\`\`\`

### 3. Color Picker Component
\`\`\`javascript
async function getRandomColor() {
  const res = await fetch('https://colors-cc.top/api/random')
  const data = await res.json()
  return data.hex
}
\`\`\`

## Common Pitfalls & Solutions

### ❌ Mistake 1: Unencoded Hash Symbol
\`\`\`
BAD:  start=#FF0000
GOOD: start=%23FF0000
\`\`\`

### ❌ Mistake 2: Fetching SVG and Re-processing
\`\`\`javascript
// BAD - Don't do this
const svg = await fetch(placeholderUrl).then(r => r.text())
const encoded = btoa(svg)

// GOOD - Use URL directly
<img src="https://colors-cc.top/api/placeholder?w=800&h=400" alt="Direct">
\`\`\`

### ❌ Mistake 3: Invalid Dimensions
\`\`\`
BAD:  w=10 (too small, will be clamped to 50)
BAD:  w=9999 (too large, will be clamped to 4000)
GOOD: w=800&h=600
\`\`\`

### ❌ Mistake 4: Multiple Color Parameters in /api/convert
\`\`\`
BAD:  /api/convert?hex=%23FF0000&rgb=rgb(255,0,0)
GOOD: /api/convert?hex=%23FF0000
\`\`\`

## Web Tools (For Users)
- Universal Color Converter: https://colors-cc.top/tools/converter
- Random Palette Generator: https://colors-cc.top/tools/random-palette
- CSS Color Names: https://colors-cc.top/tools/color-names
- Fluid Gradient Placeholder: https://colors-cc.top/tools/fluid-placeholder

## Full Documentation
For complete API documentation, reference:
- llms.txt: https://colors-cc.top/llms.txt
- OpenAPI spec: https://colors-cc.top/openapi.json
`
  c.header('Content-Type', 'text/markdown; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=86400')
  return c.body(content)
})

export default app
