import * as fs from 'node:fs/promises'
import { defaultExtensionMap, toSSG } from 'hono/ssg'
import { createApp } from '../src/app'
import { llmsContent } from '../src/routes/docs/llms'
import { cnSiteConfig } from '../src/site'

const outputDir = 'dist/vps'

const main = async (): Promise<void> => {
  await fs.rm(outputDir, { recursive: true, force: true })

  const [home, imageCompress] = await Promise.all([
    fs.readFile(new URL('../src/templates/home.html', import.meta.url), 'utf8'),
    fs.readFile(new URL('../src/pages/image-compress.html', import.meta.url), 'utf8')
  ])

  const app = createApp(cnSiteConfig, { home, imageCompress })
  const result = await toSSG(app, fs, {
    dir: outputDir,
    concurrency: 4,
    extensionMap: {
      ...defaultExtensionMap,
      'text/markdown': 'md',
      'text/plain': 'txt',
      'application/json': 'json'
    }
  })

  if (!result.success) {
    throw result.error ?? new Error('VPS static build failed')
  }

  await fs.writeFile(`${outputDir}/404.txt`, llmsContent, 'utf8')

  console.log(`Generated ${result.files.length + 1} VPS files in ${outputDir}`)
}

void main()
