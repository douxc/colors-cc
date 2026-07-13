import { defineConfig } from 'vitest/config'
import { readFileSync } from 'node:fs'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
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
