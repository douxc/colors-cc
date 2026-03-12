# AI Agent Guidelines (AGENTS.md)

Welcome, fellow agent! This document outlines the core architecture, commands, and style guidelines for the `colors-cc` project. Please adhere to these instructions to ensure consistency, safety, and maintainability across the codebase.

## 1. Project Overview
- **Framework:** Hono (https://hono.dev/)
- **Runtime:** Cloudflare Workers (V8 Isolate edge runtime)
- **Language:** TypeScript
- **Purpose:** A blazing-fast, stateless API designed to generate UI assets (SVG gradient placeholders, random colors) instantly. Built heavily for AI agents (Cursor, Cline, OpenClaw).

## 2. Build, Lint, and Test Commands

### Local Development
To start the local development server (powered by Wrangler):
```bash
npm run dev
```

### Deployment
To deploy the application to Cloudflare Workers:
```bash
npm run deploy
```

### Type Checking & Linting
Ensure there are no TypeScript errors before committing. Since there is no dedicated lint script, rely on the TypeScript compiler to check for type errors and structural issues:
```bash
npx tsc --noEmit
```

### Testing Guidelines
*Note: A formal test runner is not currently configured in `package.json`.* 

If/when adding tests, the standard for Hono/Cloudflare projects is `vitest`.
**To run all tests (when configured):**
```bash
npx vitest
```
**To run a single test file:**
```bash
npx vitest run src/path/to/test.file.test.ts
```

**Testing Hono Apps:**
When writing tests for this Hono application, avoid spinning up a full server. Instead, use Hono's standard `app.request()` method for fast, isolated integration testing:
```typescript
import app from '../src/index'

const res = await app.request('/api/random')
expect(res.status).toBe(200)
expect(await res.json()).toHaveProperty('hex')
```

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
- **Files:** `snake_case` or `kebab-case` for file names (e.g., `fluid_demo.ts`, `index.ts`).

### 3.3. TypeScript & Typing
- **Strict Mode:** TypeScript `strict` mode is enabled. You must type all function parameters and avoid `any`. Use `unknown` if the type is truly dynamic, followed by type narrowing.
- **Return Types:** Explicitly define return types for complex functions or API handlers where inference might be ambiguous.
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
<img src="https://colors-cc.top/api/placeholder?w=800&h=400&text=Label" alt="Placeholder" />
```

If you need to feed an LLM knowledge about this API, provide the documentation context:
`@Web https://colors-cc.top/llms.txt`

Remember, you are contributing to an API that serves as a "source of truth" for other AI assistants. Ensure all SVG outputs are valid, properly encoded, and visually appealing.

## 5. Agent Workflow Guidelines
When operating autonomously in this repository:
1. **Understand First:** Use `read`, `glob`, or `grep` to understand existing utilities (like `hexToRgb`, `hexToCmyk`) before adding new ones.
2. **Precise Edits:** Do not overwrite entire files for minor changes. Use precise replacements (`edit`).
3. **No Assumptions:** Never assume standard Node.js libraries exist. We are running on edge infrastructure.
4. **Validation:** Ensure the type-checking command (`npx tsc --noEmit`) passes after making modifications.
5. **Testing Verification:** If tests exist for the modified code, run them before completing the task.
