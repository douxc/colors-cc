import { defineConfig } from 'vitest/config'
import { readFileSync } from 'node:fs'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Browser-level checks need a real Chrome; run them with `pnpm test:e2e`.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
  plugins: [
    {
      name: 'html-as-string',
      enforce: 'pre',
      load(id) {
        const filePath = id.split('?')[0]
        if (filePath.endsWith('.html')) {
          return `export default ${JSON.stringify(readFileSync(filePath, 'utf8'))}`
        }
      },
    },
  ],
})
