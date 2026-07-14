# ColorsCC - AI-Ready Color & Placeholder API

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![AI Ready](https://img.shields.io/badge/AI-Ready-blueviolet)](https://colors-cc.top/llms.txt)

> **Note:** This repository contains the **frontend-only** application (https://colors-cc.top). The API service (https://api.colors-cc.top) is maintained separately.

A blazing fast, free, and stateless API designed to help **AI Agents (Cursor, Cline, OpenClaw)** and developers instantly generate UI assets like SVG gradient placeholder images and random colors.

**🌐 Frontend Site:** [https://colors-cc.top/](https://colors-cc.top/)  
**🇨🇳 Mainland Site:** [https://www.colors-cc.top/](https://www.colors-cc.top/)
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

## Deployment

The same application source produces two independent deployments. The global
edition serves English under `/en` and Simplified Chinese under `/zh`, while
preserving legacy unprefixed routes in English. The mainland edition is a
Chinese-only build: it serves the root homepage and `/zh` pages, does not emit
`/en`, and does not render a language switch.

### Cloudflare Worker (`colors-cc.top`)

The global edition defaults to English and does not render ICP information.

```bash
pnpm validate
pnpm build:worker
pnpm deploy:worker
```

`build:worker` writes an inspectable dry-run bundle to `dist/worker`.
`deploy:worker` publishes the Worker using the Custom Domain declared in
`wrangler.toml`.

### Mainland VPS (`www.colors-cc.top`)

The VPS edition defaults to Chinese and renders `苏ICP备2024075067号-4` in the
footer of every HTML page. It is exported to static files and does not require a
Node.js process on the server.

```bash
pnpm validate
pnpm build:vps
```

The static site is generated in `dist/vps`. Configure the deployment target in
the ignored `.env` file:

```bash
VPS_TARGET=deploy@your-vps
# Optional; defaults match the current VPS layout
VPS_ROOT=/var/www/colors-cc.top
VPS_SITE_ORIGIN=https://www.colors-cc.top
VPS_NGINX_CONFIG=/etc/nginx/sites-available/colors-cc.top
```

Then deploy it with a full replacement:

```bash
pnpm deploy:vps
```

The deployment uses `rsync --delete`; the target directory must contain only
generated site files. It also installs `deploy/nginx-vps.conf` through the
configured SSH account using passwordless `sudo`. The remote installer runs
`nginx -t` before reloading and restores the previous configuration if
validation fails.

The deploy command runs `pnpm verify:seo` against the public CN origin after
syncing. It fails if clean localized URLs redirect, a crawler is blocked, an
SEO asset has the wrong content type, or required sitemap/page metadata is
missing. The global deployment can be checked independently with:

```bash
pnpm verify:seo -- https://colors-cc.top
```

## Search engine onboarding

Both deployments render complete server-side HTML and publish the same SEO
contract on every localized page:

- self-referencing canonical URLs and reciprocal cross-domain `hreflang` links;
- Open Graph, Twitter Card, favicon, manifest, and large-preview directives;
- `WebSite`, `Organization`, `WebApplication`, and breadcrumb JSON-LD;
- responsive-page metadata for Baidu (`applicable-device=pc,mobile`);
- XML and plain-text sitemaps at `/sitemap.xml` and `/sitemap.txt`;
- explicit crawl access for Googlebot, Baiduspider, 360Spider, and Bytespider.

After each release that changes indexable page content, update
`SITEMAP_LAST_MODIFIED` in `src/routes/seo/sitemap.ts` to the real release date.
Do not replace it with the request time: search engines expect `lastmod` to be
truthful.

Webmaster platforms require proof that you control each domain. Copy
`.env.example` to the ignored `.env` file for the VPS deployment, then fill in
only the `content` value issued by each platform:

```bash
SEO_GOOGLE_SITE_VERIFICATION=
SEO_BAIDU_SITE_VERIFICATION=
SEO_360_SITE_VERIFICATION=
SEO_BYTEDANCE_VERIFICATION_CODE=
```

Configure the same variables in the Cloudflare Worker's environment before
deploying the global site. If another platform issues a different meta name,
pass an exact name-to-value JSON object through
`SEO_EXTRA_VERIFICATION_META`, for example:

```bash
SEO_EXTRA_VERIFICATION_META={"sogou_site_verification":"issued-value"}
```

Verification tags are rendered only on home pages and are omitted when no
values are configured. Platform-specific variables override duplicate names
from the JSON object. Submit the matching sitemap after verification:

- Google Search Console: `https://colors-cc.top/sitemap.xml`
- Baidu Search Resource Platform: `https://www.colors-cc.top/sitemap.xml`
- 360 Webmaster Platform: `https://www.colors-cc.top/sitemap.xml`
- Toutiao/ByteDance: Bytespider is allowed; use the current platform-provided
  verification and submission method if one is available for the account.

The generic sitemap and robots protocols remain valid for other standards-based
search engines. Never commit placeholder verification values.

Cloudflare can prepend a managed `robots.txt` that contains a separate
`Bytespider` `Disallow` rule. For the global domain, turn off the conflicting
managed robots preference under **Security Settings → Bot traffic**, and set
the Search/Bytespider crawler policy to **Allow** in AI Crawl Control. Verify
the public response with `pnpm verify:seo -- https://colors-cc.top`; changing
the Worker response alone cannot override an edge-prepended rule.

## 📄 License
MIT
