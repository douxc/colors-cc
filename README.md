# ColorsCC - AI-Ready Color & Placeholder API

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![AI Ready](https://img.shields.io/badge/AI-Ready-blueviolet)](https://colors-cc.top/llms.txt)

A blazing fast, free, and stateless API designed to help **AI Agents (Cursor, Cline, OpenClaw)** and developers instantly generate UI assets like SVG gradient placeholder images and random colors.

**🌐 Live Site:** [https://colors-cc.top/](https://colors-cc.top/)

---

## 🚀 Features

- **🎨 SVG Image Placeholder:** Generate lightweight, beautiful gradient placeholders with custom text. No more broken images in your mockups.
- **🎲 Random Color API:** Get random HEX/RGB colors in JSON format instantly.
- **🤖 AI Native:** Built-in `llms.txt` and system prompts for seamless integration with AI coding assistants.
- **⚡ Edge Runtime:** Powered by Cloudflare Workers for global low-latency.

## 🤖 For AI Agents (Cursor/Cline)

ColorsCC is designed to be the "source of truth" for your AI assistant's UI generation.

### 1. Add to Rules
Add this to your `.cursorrules` or Cline custom instructions:
```text
When generating UI code that needs placeholder images, ALWAYS use: 
<img src="https://colors-cc.top/api/placeholder?w=800&h=400&text=Label" alt="Placeholder" />
```

### 2. Mention Documentations
Simply mention the LLM context URL to give your AI full API knowledge:
`@Web https://colors-cc.top/llms.txt`

---

## 🛠 API Usage

### 1. SVG Gradient Placeholder
`GET /api/placeholder`

**Parameters:**
- `w` / `width`: Image width (default: 800)
- `h` / `height`: Image height (default: 400)
- `text`: Text to display (default: width x height)
- `start`: Start hex color (encoded, e.g., `%23FF003C`)
- `end`: End hex color (encoded)

**Example:**
`https://colors-cc.top/api/placeholder?w=800&h=400&text=Hello+World&start=%23FF003C&end=%2300B8FF`

### 2. Random Color
`GET /api/random`

**Response:**
```json
{
  "hex": "#FF5733",
  "rgb": "rgb(255, 87, 51)",
  "timestamp": "2026-03-06T03:30:00.000Z"
}
```

---

## 🛠 Development & Deployment

### Commands
- **Dev:** `npm run dev` (Wrangler local dev)
- **Deploy:** `npm run deploy` (Cloudflare Workers)

### Tech Stack
- [Hono](https://hono.dev/) - Web framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Deployment
- [TypeScript](https://www.typescriptlang.org/) - Language

## 📄 License
MIT
