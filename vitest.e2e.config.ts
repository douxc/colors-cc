import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

// On-demand browser verification. The default `vitest.config.ts` deliberately does
// not include `e2e/`, so this suite only runs when asked for explicitly.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['e2e/**/*.e2e.test.ts'],
    testTimeout: 120000,
    hookTimeout: 60000
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
      }
    }
  ]
})
