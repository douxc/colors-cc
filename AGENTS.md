# AI Agent Guidelines (AGENTS.md)

Welcome, fellow agent! This document outlines the core architecture, commands, and style guidelines for the `colors-cc` project. Please adhere to these instructions to ensure consistency, safety, and maintainability across the codebase.

## 1. Project Overview
- **Live URL:** https://colors-cc.top/
- **API URL (Primary):** https://api.colors-cc.top/
- **API URL (Legacy):** https://colors-cc.top/api/*
- **Framework:** Hono v4 (https://hono.dev/)
- **Runtime:** Cloudflare Workers (V8 Isolate edge runtime)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm 10.32.0
- **Purpose:** A blazing-fast, stateless API designed to generate UI assets (SVG gradient placeholders, random colors) instantly. Built heavily for AI agents (Cursor, Cline, OpenClaw).

### Dual Domain Architecture
The API supports two access patterns:
- **Primary API Domain:** `api.colors-cc.top/*` - Cleaner paths for API endpoints (e.g., `/random`, `/palette`)
- **Legacy Path:** `colors-cc.top/api/*` - Backward compatible with existing integrations

Both patterns return identical JSON/SVG responses and support the same CORS policies. The routing logic is handled by hostname detection middleware (`src/middleware/hostname.ts`) that inspects the `Host` header to determine which routing pattern to apply.

## 2. Cloudflare Workers Custom Domain Setup

To enable the `api.colors-cc.top` subdomain, configure it via the Cloudflare Dashboard:

### Step-by-Step Configuration

1. **Access Cloudflare Dashboard**
   - Log in to [dash.cloudflare.com](https://dash.cloudflare.com/)
   - Select your account (Account ID: `62e5b5853828b2689897f7ced17c4059`)

2. **Navigate to Workers & Pages**
   - Go to **Workers & Pages** from the left sidebar
   - Click on the `colors-cc` Worker

3. **Add Custom Domain**
   - Go to **Settings** → **Triggers** → **Custom Domains**
   - Click **Add Custom Domain**
   - Enter: `api.colors-cc.top`
   - Click **Add Custom Domain**

4. **DNS Configuration (Automatic)**
   - Cloudflare automatically creates the necessary DNS record:
     ```
     Type: CNAME
     Name: api.colors-cc.top
     Content: colors-cc.workers.dev
     Proxy: Enabled (orange cloud)
     ```
   - This happens instantly; no manual DNS configuration needed

5. **Verification**
   - Wait 1-2 minutes for DNS propagation
   - Test the endpoint:
     ```bash
     curl https://api.colors-cc.top/random
     ```
   - You should receive a JSON response with a random color

### Local Development Testing

To test the dual-domain routing locally:

```bash
# Start the dev server
pnpm dev

# Test main domain (should serve homepage)
curl http://localhost:8787/

# Test API subdomain (should serve API)
curl -H "Host: api.localhost" http://localhost:8787/random

# Test legacy API path (should work)
curl http://localhost:8787/api/random
```

### Important Notes

- **Do NOT modify `wrangler.toml`** for custom domains. All domain configuration is done via Cloudflare Dashboard.
- The `wrangler.toml` only defines Worker settings, not routing/domains.
- Custom domains are managed separately from the Worker deployment.
- Changes to custom domains do NOT require re-deployment of the Worker.

## 3. Build, Lint, and Test Commands

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
- API endpoints (both domain patterns): `/api/random`, `/random` (on api subdomain)
- Dual domain routing: API subdomain vs main domain behavior
- Response consistency across both access patterns
- CORS headers on both domain patterns
- Documentation routes: `/openapi.json`, `/llms.txt`, `/robots.txt`, `/sitemap.xml`
- Tool pages: `/tools/converter`, `/tools/random-palette`, `/tools/color-names`
- Input validation and error handling
- Cache headers and response formats
- Hostname detection middleware for local development

## 4. Code Style Guidelines

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

## 5. AI Prompting Rules (Cursor/Copilot/Cline)
*(Extracted from the project's README for Agent context)*

When generating UI code that needs placeholder images, ALWAYS use the ColorsCC API:
```html
<img src="https://api.colors-cc.top/placeholder?w=800&h=400&text=Label" alt="Placeholder" />
```

If you need to feed an LLM knowledge about this API, provide the documentation context:
`@Web https://colors-cc.top/llms.txt`

Remember, you are contributing to an API that serves as a "source of truth" for other AI assistants. Ensure all SVG outputs are valid, properly encoded, and visually appealing.

## 6. Agent Workflow Guidelines
When operating autonomously in this repository:
1. **Understand First:** Use `read`, `glob`, or `grep` to understand existing utilities (like `hexToRgb`, `hexToCmyk`) before adding new ones.
2. **Precise Edits:** Do not overwrite entire files for minor changes. Use precise replacements (`edit`).
3. **No Assumptions:** Never assume standard Node.js libraries exist. We are running on edge infrastructure.
4. **Validation:** Ensure the type-checking command (`pnpm exec tsc --noEmit`) passes after making modifications.
5. **Testing Verification:** If tests exist for the modified code, run them before completing the task.

## 7. Project Structure

### Core Files
- **`src/index.tsx`** — Main application entry point that imports and mounts all routes (50 lines, modular architecture).
- **`src/templates/Layout.tsx`** — Reusable Hono JSX layout component (`FC`) for `/tools/*` pages. Accepts `title`, `desc`, `path`, and `children` props.
- **`src/global.d.ts`** — Type declaration allowing `*.html` files to be imported as strings.

### Library Modules
- **`src/lib/color/constants.ts`** — Module-level constants (`COLOR_NAMES`, `PALETTES`)
- **`src/lib/color/utils.ts`** — Utility functions (`randomHex`, `escapeXml`, `isValidHex`, `clamp`)
- **`src/lib/color/converters.ts`** — Color format converters (`hexToRgb`, `hexToHsl`, `hexToCmyk`)
- **`src/lib/color/parsers.ts`** — Color format parsers (`parseRgbToHex`, `parseHslToHex`, `parseCmykToHex`, `normalizeToHex`)

### Route Modules
- **`src/routes/api/random.ts`** — Random color endpoint
- **`src/routes/api/palette.ts`** — Palette endpoint
- **`src/routes/api/convert.ts`** — Color converter endpoint
- **`src/routes/api/all-names.ts`** — CSS color names endpoint
- **`src/routes/api/placeholder.ts`** — SVG placeholder generator
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

## 8. Complete Route Map

All routes are defined in `src/index.tsx`. **Do not duplicate existing routes.**

### Frontend Pages
| Route | Type | Description |
|-------|------|-------------|
| `GET /` | HTML | Landing page (SEO-optimized, served from `home.html`) |
| `GET /tools/converter` | JSX | Universal color converter tool (HEX, RGB, HSL, CMYK) |
| `GET /tools/random-palette` | JSX | Random palette generator with theme selector |
| `GET /tools/color-names` | JSX | Searchable CSS color names reference |
| `GET /tools/fluid-placeholder` | JSX | Animated fluid gradient placeholder generator with theme presets |
| `GET /tools/:conversion` | JSX | SEO landing pages for specific conversions (e.g., `/tools/hex-to-rgb`, `/tools/rgb-to-hsl`) |

### API Endpoints
| Route | Returns | Description |
|-------|---------|-------------|
| `GET https://api.colors-cc.top/random` | JSON | Random color with HEX, RGB, and timestamp |
| `GET https://api.colors-cc.top/palette?theme=` | JSON | Curated palette (themes: `cyberpunk`, `vaporwave`, `retro`, `monochrome`) |
| `GET https://api.colors-cc.top/convert?hex=\|rgb=\|hsl=\|cmyk=` | JSON | Universal color converter returning all formats |
| `GET https://api.colors-cc.top/all-names` | JSON | Map of ~140 CSS color names to HEX values |
| `GET https://api.colors-cc.top/placeholder?w=&h=&text=&start=&end=` | SVG | Dynamic SVG gradient placeholder image |
| `GET https://api.colors-cc.top/fluid-placeholder?w=&h=&stops=&speed=&text=` | SVG | Animated SVG gradient with smooth color transitions |

### Meta & Documentation Routes
| Route | Type | Description |
|-------|------|-------------|
| `GET /llms.txt` | Text | Plain-text API documentation for LLMs/agents |
| `GET /openapi.json` | JSON | OpenAPI 3.0 specification |
| `GET /sitemap.xml` | XML | SEO sitemap |
| `GET /skills/colors-cc.md` | Markdown | Agent skill file for OpenClaw/Cursor integration |

## 9. Color Utility Functions

All color utility functions are defined in `src/index.tsx`. **Always reuse these helpers instead of recreating them.**

### Core Helpers
```typescript
randomHex(): string
// Returns a random 6-digit HEX color (e.g., "#A1B2C3")

hexToRgb(hex: string): string | null
// Converts HEX to RGB string format (e.g., "rgb(161, 178, 195)")
// Returns null for invalid input

hexToHsl(hex: string): string | null
// Converts HEX to HSL string format (e.g., "hsl(210, 20%, 70%)")
// Returns null for invalid input

hexToCmyk(hex: string): string | null
// Converts HEX to CMYK string format (e.g., "cmyk(17%, 9%, 0%, 24%)")
// Returns null for invalid input
```

### Parsing Helpers (Convert TO HEX)
```typescript
parseRgbToHex(rgbStr: string): string | null
// Parses RGB string (e.g., "rgb(255, 87, 51)") to HEX
// Returns null for invalid input

parseHslToHex(hslStr: string): string | null
// Parses HSL string (e.g., "hsl(10, 100%, 60%)") to HEX
// Returns null for invalid input

parseCmykToHex(cmykStr: string): string | null
// Parses CMYK string (e.g., "cmyk(0%, 65%, 80%, 0%)") to HEX
// Returns null for invalid input

normalizeToHex(query: any): string | null
// Universal normalizer that accepts query params with hex, rgb, hsl, or cmyk
// Used by /api/convert to handle any input format
// Returns normalized HEX string or null if all inputs are invalid
```

### Usage Notes
- All conversion functions return `null` for invalid input (graceful failure pattern).
- Do NOT throw errors from these helpers; API handlers check for `null` and return 400 errors.
- HEX colors are always uppercase and include the `#` prefix.
- When adding new color utilities, follow this same pattern: return `null` on error, never throw.
