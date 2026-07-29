import * as fs from 'node:fs/promises'
import { build } from 'esbuild'

const outputFile = 'src/generated/image-compress-worker.html'
const legalBanner = [
  'colors-cc image compression worker',
  'GPL-3.0-or-later',
  'Source: https://github.com/douxc/colors-cc',
  'License: https://github.com/douxc/colors-cc/blob/main/LICENSE',
  'Third-party notices: https://github.com/douxc/colors-cc/blob/main/THIRD_PARTY_NOTICES.md',
  'NO WARRANTY'
].join(' | ')

const main = async (): Promise<void> => {
  const result = await build({
    entryPoints: ['src/client/image-compress-worker.ts'],
    bundle: true,
    banner: {
      js: `/*! ${legalBanner} */`
    },
    format: 'iife',
    legalComments: 'inline',
    loader: { '.wasm': 'binary' },
    minify: true,
    platform: 'browser',
    target: 'es2022',
    write: false
  })
  const output = result.outputFiles[0]
  if (!output) throw new Error('Image codec worker bundle was not generated')

  try {
    const existingOutput = await fs.readFile(outputFile, 'utf8')
    if (existingOutput === output.text) {
      console.log(`Unchanged ${outputFile} (${output.contents.byteLength} bytes)`)
      return
    }
  } catch (error: unknown) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }

  await fs.mkdir('src/generated', { recursive: true })
  await fs.writeFile(outputFile, output.contents)
  console.log(`Generated ${outputFile} (${output.contents.byteLength} bytes)`)
}

void main()
