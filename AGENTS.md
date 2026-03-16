# AI Agent Guidelines (AGENTS.md)

Welcome, fellow agent! This document outlines the core architecture, commands, and style guidelines for the `colors-cc` project. Please adhere to these instructions to ensure consistency, safety, and maintainability across the codebase.

## 1. Project Overview

> **Note:** This repository contains the **frontend-only** application. The API service (`api.colors-cc.top`) is maintained separately and is not part of this codebase.

- **Live URL:** https://colors-cc.top/
- **External API:** https://api.colors-cc.top/
- **Framework:** Hono v4 (https://hono.dev/)
- **Runtime:** Cloudflare Workers (V8 Isolate edge runtime)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm 10.32.0
- **Purpose:** Frontend web application that provides interactive color tools and documentation for the colors-cc API. The API itself is a blazing-fast, stateless service designed to generate UI assets (SVG gradient placeholders, random colors) instantly. Built heavily for AI agents (Cursor, Cline, OpenClaw).

## 2. Build, Lint, and Test Commands

### Local Development
To start the local development server (powered by Wrangler):
```bash
pnpm dev
```

### Deployment
To deploy the application to Cloudflare Workers:
```bash
pnpm deploy
```

### Type Checking
Run TypeScript type checking to ensure no type errors before committing:
```bash
pnpm typecheck
```

### Testing
This project uses `vitest` for testing. All tests are located in `src/index.test.ts`.

**Run all tests:**
```bash
pnpm test
```

**Run tests in watch mode:**
```bash
pnpm test:watch
```

**Run validation (typecheck + tests):**
```bash
pnpm validate
```

**Testing Hono Apps:**
Tests use Hono's standard `app.request()` method for fast, isolated integration testing without spinning up a server:
```typescript
import app from './index'

const res = await app.request('/api/random')
expect(res.status).toBe(200)
const data = await res.json() as { hex: string; rgb: string }
expect(data).toHaveProperty('hex')
```

**Test Coverage:**
- Documentation routes: `/openapi.json`, `/llms.txt`, `/skills/colors-cc.md`, `/robots.txt`, `/sitemap.xml`
- Tool pages: `/tools/converter`, `/tools/random-palette`, `/tools/color-names`, `/tools/fluid-placeholder`
- Homepage rendering
- SEO metadata and structured data

## 3. Code Style Guidelines

### 3.1. Formatting
- **Indentation:** 2 spaces.
- **Quotes:** Use single quotes (`'`) for strings unless double quotes (`"`) are necessary (e.g., JSX attributes or JSON).
- **Semicolons:** Omit semicolons where possible (StandardJS/Prettier style), unless required to prevent ASI issues. Existing code has mixed usage; lean towards modern TS standard (no semicolons) for new code.
- **Line Length:** Keep lines under 100-120 characters to maintain readability.

### 3.2. Naming Conventions
- **Variables & Functions:** `camelCase` (e.g., `hexToRgb`, `randomHex`).
- **Constants:** `UPPER_SNAKE_CASE` for global, immutable primitive constants.
- **Types & Interfaces:** `PascalCase` (e.g., `ColorResponse`, `PlaceholderOptions`). Do not prefix interfaces with `I`.
- **Files:** `snake_case` or `kebab-case` for file names (e.g., `color_utils.ts`, `index.ts`).

### 3.3. TypeScript & Typing
- **Strict Mode:** TypeScript `strict` mode is enabled. You must type all function parameters and avoid `any`. Use `unknown` if the type is truly dynamic, followed by type narrowing.
- **Return Types:** Explicitly define return types for complex functions or API handlers where inference might be ambiguous.
- **JSX Rendering:** This project uses Hono JSX (`hono/jsx`), NOT React. The `tsconfig.json` configures `"jsx": "react-jsx"` with `"jsxImportSource": "hono/jsx"`. When creating new tool pages, import and use Hono's JSX components (e.g., `Layout` from `./templates/Layout`).
- **Cloudflare Workers Types:** Use `@cloudflare/workers-types` for environment bindings.
  ```typescript
  type Env = {
    // Add KV namespaces, D1 databases, or secrets here
    MY_KV: KVNamespace;
  }
  const app = new Hono<{ Bindings: Env }>()
  ```

### 3.4. Imports & Modules
- Use standard ES Modules (`import`/`export`).
- Group imports logically:
  1. External dependencies (e.g., `import { Hono } from 'hono'`)
  2. Internal absolute/relative paths
- **HTML as Strings:** HTML files can be imported directly as strings thanks to `src/global.d.ts` (which declares `*.html` modules) and `wrangler.toml` rules. Example: `import homeTemplate from './templates/home.html'` — the variable `homeTemplate` will be a string containing the full HTML content.
- **WARNING:** Do not import Node.js core modules (like `fs`, `path`, `crypto`) as this code runs in Cloudflare Workers, not Node.js. Use the Web Crypto API or Cloudflare APIs instead.

### 3.5. Error Handling
- **Graceful Failures:** Helper functions should handle invalid input gracefully (e.g., `hexToRgb` returns `null` for invalid hex instead of throwing).
- **API Responses:** Return appropriate HTTP status codes using Hono's context helpers.
  ```typescript
  if (!valid) {
    return c.json({ error: 'Invalid parameter provided' }, 400)
  }
  ```
- **Try/Catch:** Wrap risky operations in `try/catch` blocks. Do not leak internal stack traces to the API response.

### 3.6. Architecture & Patterns
- **Statelessness:** Cloudflare Workers are stateless. Do not rely on global variables to persist data across requests. 
- **Hono Routing:** Keep routes modular. For large routing files, split them into separate Hono instances and mount them.
- **CORS:** Ensure CORS is enabled for `/api/*` routes so that external web applications can consume the endpoints securely.

## 4. AI Prompting Rules (Cursor/Copilot/Cline)
*(Extracted from the project's README for Agent context)*

When generating UI code that needs placeholder images, ALWAYS use the ColorsCC API:
```html
<img src="https://api.colors-cc.top/placeholder?w=800&h=400&text=Label" alt="Placeholder" />
```

If you need to feed an LLM knowledge about this API, provide the documentation context:
`@Web https://colors-cc.top/llms.txt`

Remember, you are contributing to an API that serves as a "source of truth" for other AI assistants. Ensure all SVG outputs are valid, properly encoded, and visually appealing.

## 5. Agent Workflow Guidelines
When operating autonomously in this repository:
1. **Understand First:** Use `read`, `glob`, or `grep` to understand existing utilities (like `hexToRgb`, `hexToCmyk`) before adding new ones.
2. **Precise Edits:** Do not overwrite entire files for minor changes. Use precise replacements (`edit`).
3. **No Assumptions:** Never assume standard Node.js libraries exist. We are running on edge infrastructure.
4. **Validation:** Ensure the type-checking command (`pnpm exec tsc --noEmit`) passes after making modifications.
5. **Testing Verification:** If tests exist for the modified code, run them before completing the task.

## 6. Project Structure

### Core Files
- **`src/index.tsx`** — Main application entry point that imports and mounts all routes (50 lines, modular architecture).
- **`src/templates/Layout.tsx`** — Reusable Hono JSX layout component (`FC`) for `/tools/*` pages. Accepts `title`, `desc`, `path`, and `children` props.
- **`src/global.d.ts`** — Type declaration allowing `*.html` files to be imported as strings.

### Route Modules
- **`src/routes/docs/llms.ts`** — LLM documentation (`/llms.txt`)
- **`src/routes/docs/openapi.ts`** — OpenAPI specification (`/openapi.json`)
- **`src/routes/docs/skills.ts`** — Agent skill file (`/skills/colors-cc.md`)
- **`src/routes/seo/robots.ts`** — Robots.txt
- **`src/routes/seo/sitemap.ts`** — Sitemap.xml
- **`src/routes/pages/tools.tsx`** — All tool pages (converter, palette, color-names, fluid-placeholder)

### HTML Templates (imported as strings)
- **`src/templates/home.html`** — Landing page with full SEO optimization, served at `/`.
- **`src/templates/base.html`** — ⚠️ **ORPHANED FILE** — Mustache-style template prototype. NOT used in production. Do not reference or mount.

### Configuration Files
- **`package.json`** — Declares `pnpm@10.32.0` as package manager, with `dev` and `deploy` scripts.
- **`tsconfig.json`** — Strict mode enabled, Hono JSX configured via `"jsxImportSource": "hono/jsx"`.
- **`wrangler.toml`** — Cloudflare Workers config with HTML text import rules.
- **`.nvmrc`** — Node version: `24.13.0`.

## 7. Complete Route Map

All frontend routes are defined in `src/index.tsx`. **Do not duplicate existing routes.**

> **Note:** API endpoints listed below are **external services** and are not implemented in this repository. The frontend application consumes these APIs from `https://api.colors-cc.top`.

### Frontend Pages
| Route | Type | Description |
|-------|------|-------------|
| `GET /` | HTML | Landing page (SEO-optimized, served from `home.html`) |
| `GET /tools/converter` | JSX | Universal color converter tool (HEX, RGB, HSL, CMYK) |
| `GET /tools/random-palette` | JSX | Random palette generator with theme selector |
| `GET /tools/color-names` | JSX | Searchable CSS color names reference |
| `GET /tools/fluid-placeholder` | JSX | Animated fluid gradient placeholder generator with theme presets |
| `GET /tools/:conversion` | JSX | SEO landing pages for specific conversions (e.g., `/tools/hex-to-rgb`, `/tools/rgb-to-hsl`) |

### External API Endpoints (Not Implemented in This Repo)
The following endpoints are provided by the external API service at `https://api.colors-cc.top`:

| Route | Returns | Description |
|-------|---------|-------------|
| `GET https://api.colors-cc.top/random` | JSON | Random color with HEX, RGB, and timestamp |
| `GET https://api.colors-cc.top/palette?theme=` | JSON | Curated palette (themes: `cyberpunk`, `vaporwave`, `retro`, `monochrome`) |
| `GET https://api.colors-cc.top/convert?hex=\|rgb=\|hsl=\|cmyk=` | JSON | Universal color converter returning all formats |
| `GET https://api.colors-cc.top/all-names` | JSON | Map of ~140 CSS color names to HEX values |
| `GET https://api.colors-cc.top/placeholder` | SVG | Dynamic SVG placeholder with multiple effects (static, fluid, breathe, holographic, mesh) |
| `GET https://api.colors-cc.top/fluid-placeholder` | SVG | Alias for `/placeholder?effect=fluid` - Animated SVG gradient with smooth color transitions |

#### Detailed API Parameters

**`/placeholder` endpoint:**
- `w` / `width`: Width in pixels (default: 800, range: 50-4000)
- `h` / `height`: Height in pixels (default: 400, range: 50-4000)
- `text`: Center text, URL-encoded (default: "{width} × {height}", max: 100 chars)
- `effect`: Visual effect - `static` (default), `fluid`, `breathe`, `holographic`, `mesh`
- `palette`: Comma-separated HEX colors (default: 2 random colors, range: 2-10 colors)
- `speed`: Animation duration in seconds for non-static effects (default: 10, range: 1-30)
- `attribution`: Include branding watermark (default: `true`). Set to `false` or `0` to disable. When enabled, adds a subtle "colors-cc.top" watermark (15% opacity) in bottom-right corner and HTML comment for viral sharing.
- `start` / `end`: (Legacy) Start and end gradient colors as hex. Prefer `palette` parameter.

**`/fluid-placeholder` endpoint:**
- Same parameters as `/placeholder`, automatically sets `effect=fluid`
- `stops`: Alias for `palette` parameter

### Meta & Documentation Routes
| Route | Type | Description |
|-------|------|-------------|
| `GET /llms.txt` | Text | Plain-text API documentation for LLMs/agents |
| `GET /openapi.json` | JSON | OpenAPI 3.0 specification |
| `GET /sitemap.xml` | XML | SEO sitemap |
| `GET /skills/colors-cc.md` | Markdown | Agent skill file for OpenClaw/Cursor integration |

## 8. External API Documentation

The colors-cc API provides various color utilities and SVG generation capabilities. For complete API documentation, refer to:
- LLM-optimized docs: https://colors-cc.top/llms.txt
- OpenAPI specification: https://colors-cc.top/openapi.json
- Agent skill file: https://colors-cc.top/skills/colors-cc.md
