# ColorsCC - AI-Ready Color & Placeholder API

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![AI Ready](https://img.shields.io/badge/AI-Ready-blueviolet)](https://colors-cc.top/llms.txt)

A blazing fast, free, and stateless API designed to help **AI Agents (Cursor, Cline, OpenClaw)** and developers instantly generate UI assets like SVG gradient placeholder images and random colors.

**🌐 Live Site:** [https://colors-cc.top/](https://colors-cc.top/)  
**🚀 API Endpoint:** [https://api.colors-cc.top/](https://api.colors-cc.top/)

![Animated Fluid Gradient](https://api.colors-cc.top/fluid-placeholder?w=1200&h=300&stops=FFD6A5,FFADAD,E2A0FF&speed=12&text=Animated+Hero)

---

## 🚀 Features

- **🌐 Dual Domain Access:** Use `https://api.colors-cc.top/*` for cleaner API paths, or `colors-cc.top/api/*` for backward compatibility. Both return identical responses.
- **✨ Animated Fluid Gradients:** Create smooth, infinitely-looping animated SVG gradients with custom color stops and speeds for hero banners and backgrounds.
- **🤖 AI Native:** Built-in `llms.txt` and system prompts for seamless integration with AI coding assistants.
- **🎨 SVG Image Placeholder:** Generate lightweight, beautiful gradient placeholders with custom text. No more broken images in your mockups.
- **🎲 Random Color API:** Get random HEX/RGB colors in JSON format instantly.
- **⚡ Edge Runtime:** Powered by Cloudflare Workers for global low-latency.

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

**Parameters:**
- `w` / `width`: Image width (default: 800)
- `h` / `height`: Image height (default: 400)
- `text`: Text to display (default: width x height)
- `start`: Start hex color (encoded, e.g., `%23F06292`)
- `end`: End hex color (encoded)

**Example:**
```
https://api.colors-cc.top/placeholder?w=800&h=400&text=Hello+World&start=%23F06292&end=%2364B5F6
```

### 2. Animated Fluid Placeholder
`GET /fluid-placeholder`

Generate animated SVG gradients with smooth, infinite color transitions perfect for modern hero banners, background effects, and loading states. The lightweight SVG format creates a "fluid" visual effect as colors seamlessly blend and cycle through your chosen palette.

**Parameters:**
- `w` / `width`: Image width (default: 800)
- `h` / `height`: Image height (default: 400)
- `text`: Text to display (optional)
- `stops`: Comma-separated hex colors (e.g., `FFD6A5,FFADAD,E2A0FF`)
- `speed`: Animation speed in seconds, 1-30 (default: 10)

**Basic URL Example:**
```
https://api.colors-cc.top/fluid-placeholder?w=1200&h=600&text=Aurora&stops=FFD6A5,FFADAD,E2A0FF&speed=15
```

**As CSS Background:**
```css
/* Hero section with animated gradient */
.hero {
  background-image: url('https://api.colors-cc.top/fluid-placeholder?w=1920&h=1080&stops=FFD6A5,FFADAD,E2A0FF&speed=20');
  background-size: cover;
  background-position: center;
  min-height: 600px;
}
```

**As Inline Style:**
```html
<section style="
  background: url('https://api.colors-cc.top/fluid-placeholder?w=1600&h=900&stops=FFD6A5,FFADAD,E2A0FF&speed=15') center/cover;
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

- **[Color Converter](https://colors-cc.top/tools/converter)** - Universal color converter (HEX ↔ RGB ↔ HSL ↔ CMYK)
- **[Random Palette Generator](https://colors-cc.top/tools/random-palette)** - Generate palettes by theme
- **[CSS Color Names](https://colors-cc.top/tools/color-names)** - Searchable reference of all CSS color names
- **[Fluid Placeholder Generator](https://colors-cc.top/tools/fluid-placeholder)** - Create animated gradient placeholders

---

### Tech Stack
- [Hono](https://hono.dev/) - Web framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Deployment
- [TypeScript](https://www.typescriptlang.org/) - Language
- [pnpm](https://pnpm.io/) - Package manager (v10.32.0)

## 📄 License
MIT
