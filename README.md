# ColorsCC - AI-Ready Color & Placeholder API

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![AI Ready](https://img.shields.io/badge/AI-Ready-blueviolet)](https://colors-cc.top/llms.txt)

> **Note:** This repository contains the **frontend-only** application (https://colors-cc.top). The API service (https://api.colors-cc.top) is maintained separately.

A blazing fast, free, and stateless API designed to help **AI Agents (Cursor, Cline, OpenClaw)** and developers instantly generate UI assets like SVG gradient placeholder images and random colors.

**🌐 Frontend Site:** [https://colors-cc.top/](https://colors-cc.top/)  
**🚀 External API:** [https://api.colors-cc.top/](https://api.colors-cc.top/)

![Animated Fluid Gradient](https://api.colors-cc.top/fluid-placeholder?w=1200&h=300&palette=%23FFD6A5,%23FFADAD,%23E2A0FF&speed=12&text=Animated+Hero)

---

## 🚀 Features

This frontend application provides:
- **📚 Interactive Documentation:** Web-based color conversion tools and palette generators
- **🎨 Visual Playground:** Interactive demos for all API endpoints
- **🤖 AI-Optimized Docs:** Built-in `llms.txt`, OpenAPI spec, and skill files for AI agent integration
- **📱 Responsive Design:** Beautiful, mobile-friendly interface for exploring color utilities

The external API service provides:
- **✨ Animated Fluid Gradients:** Create smooth, infinitely-looping animated SVG gradients with custom color stops and speeds
- **🎨 SVG Image Placeholder:** Generate lightweight, beautiful gradient placeholders with custom text
- **🎲 Random Color API:** Get random HEX/RGB colors in JSON format instantly
- **⚡ Edge Runtime:** Powered by Cloudflare Workers for global low-latency

## 🤖 For AI Agents (Cursor/Cline/OpenClaw)

ColorsCC is designed to be the "source of truth" for your AI assistant's UI generation.

### 1. Add to Rules
Add this to your `.cursorrules` or Cline custom instructions:
```text
When generating UI code that needs placeholder images, ALWAYS use: 
<img src="https://api.colors-cc.top/placeholder?w=800&h=400&text=Label" alt="Placeholder" />
```

### 2. LLM-Optimized Documentation
- **LLM Context:** `@Web https://colors-cc.top/llms.txt` - Plain-text documentation optimized for AI consumption
- **OpenAPI Spec:** `https://colors-cc.top/openapi.json` - Full OpenAPI 3.0 specification
- **Agent Skills:** `https://colors-cc.top/skills/colors-cc.md` - Installable skill file for OpenClaw/Cursor agents

---

## 🛠 API Usage

> **💡 API Access:**  `https://api.colors-cc.top/{endpoint}` - Cleaner, shorter paths

### 1. SVG Gradient Placeholder
`GET /placeholder`

Generate dynamic SVG placeholders with multiple visual effects including static gradients, animated fluids, breathing radials, holographic shifts, and mesh patterns.

**Parameters:**
- `w` / `width`: Image width (default: 800, range: 50-4000)
- `h` / `height`: Image height (default: 400, range: 50-4000)
- `text`: Text to display (default: width × height, max: 100 chars, URL-encoded)
- `effect`: Visual effect - `static` (default), `fluid`, `breathe`, `holographic`, `mesh`
- `palette`: Comma-separated colors — HEX, RGB, or HSL (default: 2 random colors, range: 2-10 colors)
- `speed`: Animation duration in seconds for non-static effects (default: 10, range: 1-30)
- `attribution`: Include branding watermark (default: `true`). Set to `false` or `0` to disable

**Examples:**
```
Static gradient:
https://api.colors-cc.top/placeholder?w=800&h=400&text=Hello+World&palette=%23F06292,%2364B5F6

Holographic effect:
https://api.colors-cc.top/placeholder?w=800&h=400&effect=holographic&palette=%2300FF41,%2300B8FF&speed=5

Mesh gradient:
https://api.colors-cc.top/placeholder?w=800&h=400&effect=mesh&palette=%23FFD6A5,%23FFADAD,%23E2A0FF

Without attribution:
https://api.colors-cc.top/placeholder?w=800&h=400&attribution=false
```

### 2. Animated Fluid Placeholder
`GET /fluid-placeholder`

Generate animated SVG gradients with smooth, infinite color transitions perfect for modern hero banners, background effects, and loading states. The lightweight SVG format creates a "fluid" visual effect as colors seamlessly blend and cycle through your chosen palette.

> **Note:** This is an alias for `/placeholder?effect=fluid`. All parameters work the same way.

**Parameters:**
- `w` / `width`: Image width (default: 800, range: 50-4000)
- `h` / `height`: Image height (default: 400, range: 50-4000)
- `text`: Text to display (optional, max: 100 chars, URL-encoded)
- `palette`: Comma-separated colors — HEX, RGB, or HSL (default: 2 random, range: 2-10 colors)
- `speed`: Animation speed in seconds (default: 10, range: 1-30)
- `attribution`: Include branding watermark (default: `true`). Set to `false` or `0` to disable

**Basic URL Example:**
```
https://api.colors-cc.top/fluid-placeholder?w=1200&h=600&text=Aurora&palette=%23FFD6A5,%23FFADAD,%23E2A0FF&speed=15
```

**As CSS Background:**
```css
/* Hero section with animated gradient */
.hero {
  background-image: url('https://api.colors-cc.top/fluid-placeholder?w=1920&h=1080&palette=%23FFD6A5,%23FFADAD,%23E2A0FF&speed=20');
  background-size: cover;
  background-position: center;
  min-height: 600px;
}
```

**As Inline Style:**
```html
<section style="
  background: url('https://api.colors-cc.top/fluid-placeholder?w=1600&h=900&palette=%23FFD6A5,%23FFADAD,%23E2A0FF&speed=15') center/cover;
  min-height: 400px;
">
  <h1>Your Content Here</h1>
</section>
```

**Common Use Cases:**
- Hero banners with eye-catching animated backgrounds
- Landing page sections with dynamic visual interest
- Loading screens and splash pages
- Modern card backgrounds
- Email headers (static fallback in most clients)

### 3. Random Color
`GET /random`

**Response:**
```json
{
  "hex": "#FF5733",
  "rgb": "rgb(255, 87, 51)",
  "timestamp": "2026-03-06T03:30:00.000Z"
}
```

### 4. Theme-Based Palettes
`GET /palette`

Get curated color palettes by theme.

**Parameters:**
- `theme`: `cyberpunk`, `vaporwave`, `retro`, `monochrome` (default: `cyberpunk`)

**Response:**
```json
{
  "theme": "cyberpunk",
  "colors": ["#FCEE09", "#00FF41", "#00B8FF", "#FF003C", "#D902EE"],
  "count": 5
}
```

### 5. Universal Color Converter
`GET /convert`

Convert between HEX, RGB, HSL, and CMYK formats.

**Parameters:**
- `hex`: HEX color (e.g., `FF5733`)
- `rgb`: RGB string (e.g., `rgb(255,87,51)`)
- `hsl`: HSL string (e.g., `hsl(9,100%,60%)`)
- `cmyk`: CMYK string (e.g., `cmyk(0%,66%,80%,0%)`)

**Response:**
```json
{
  "hex": "#FF5733",
  "rgb": "rgb(255, 87, 51)",
  "hsl": "hsl(9, 100%, 60%)",
  "cmyk": "cmyk(0%, 66%, 80%, 0%)"
}
```

**Example:**
```
https://api.colors-cc.top/convert?rgb=rgb(255,87,51)
```

### 6. CSS Color Names
`GET /all-names`

Get a complete map of ~140 CSS color names to HEX values.

**Response:**
```json
{
  "AliceBlue": "#F0F8FF",
  "AntiqueWhite": "#FAEBD7",
  ...
}
```

---

## 🎨 Frontend Tools

ColorsCC also provides interactive web tools for designers and developers:

- **[Placeholder Generator](https://colors-cc.top/)** - Interactive SVG placeholder generator with live preview
- **[Color Converter](https://colors-cc.top/tools/converter)** - Universal color converter (HEX ↔ RGB ↔ HSL ↔ CMYK)
- **[Random Palette Generator](https://colors-cc.top/tools/random-palette)** - Generate palettes by theme
- **[CSS Color Names](https://colors-cc.top/tools/color-names)** - Searchable reference of all CSS color names

---

### Tech Stack
- [Hono](https://hono.dev/) - Web framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Deployment
- [TypeScript](https://www.typescriptlang.org/) - Language
- [pnpm](https://pnpm.io/) - Package manager (v10.32.0)

## 📄 License
MIT
