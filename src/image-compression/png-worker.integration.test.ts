import * as fs from 'node:fs/promises'
import { Worker } from 'node:worker_threads'
import { deflateSync } from 'node:zlib'
import { afterEach, describe, expect, it } from 'vitest'

type CompressionResponse = {
  id: number
  success: boolean
  png?: ArrayBuffer
  strategy?: string
  originalSize?: number
  outputSize?: number
  quantizationAttempted?: boolean
  quantizedCandidateSize?: number
  quantizationError?: string
  paletteLength?: number
  error?: string
}

const workers: Worker[] = []

afterEach(async () => {
  await Promise.all(workers.splice(0).map(worker => worker.terminate()))
})

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

const pngChunk = (type: string, data: Uint8Array): Uint8Array => {
  const typeBytes = new TextEncoder().encode(type)
  const chunk = new Uint8Array(12 + data.byteLength)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, data.byteLength)
  chunk.set(typeBytes, 4)
  chunk.set(data, 8)
  view.setUint32(8 + data.byteLength, crc32(chunk.subarray(4, 8 + data.byteLength)))
  return chunk
}

const encodeRgbaPng = (
  width: number,
  height: number,
  pixel: (x: number, y: number) => readonly [number, number, number, number]
): Uint8Array => {
  const raw = new Uint8Array(height * (1 + width * 4))

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (1 + width * 4)
    raw[rowOffset] = 0
    for (let x = 0; x < width; x += 1) {
      raw.set(pixel(x, y), rowOffset + 1 + x * 4)
    }
  }

  const header = new Uint8Array(13)
  const headerView = new DataView(header.buffer)
  headerView.setUint32(0, width)
  headerView.setUint32(4, height)
  header.set([8, 6, 0, 0, 0], 8)

  const compressed = Uint8Array.from(deflateSync(raw, { level: 0 }))
  const parts = [
    Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', new Uint8Array())
  ]
  const output = new Uint8Array(parts.reduce((size, part) => size + part.byteLength, 0))
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.byteLength
  }
  return output
}

const createPaletteFriendlyPng = (width: number, height: number): Uint8Array => {
  let random = 0x12345678
  return encodeRgbaPng(width, height, () => {
    random = (random * 1664525 + 1013904223) >>> 0
    const color = random % 300
    return [
      (color % 20) * 12,
      (Math.floor(color / 20) % 15) * 16,
      (color * 13 % 32) * 8,
      255
    ]
  })
}

const startCodecWorker = async (): Promise<Worker> => {
  const workerBundle = await fs.readFile(
    new URL('../generated/image-compress-worker.html', import.meta.url),
    'utf8'
  )
  const harness = `
    const { parentPort } = require('node:worker_threads');
    globalThis.postMessage = (message, transfer) => parentPort.postMessage(message, transfer);
    parentPort.on('message', (data) => globalThis.onmessage({ data }));
  `
  const worker = new Worker(harness + workerBundle, { eval: true })
  workers.push(worker)
  return worker
}

describe('PNG codec worker', () => {
  it('runs the real libimagequant and OxiPNG WASM pipeline', async () => {
    const worker = await startCodecWorker()
    const input = createPaletteFriendlyPng(128, 128)
    const originalSize = input.byteLength

    const response = await new Promise<CompressionResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Codec worker timed out')), 20_000)
      worker.once('error', reject)
      worker.once('message', (message: CompressionResponse) => {
        clearTimeout(timeout)
        resolve(message)
      })
      const png = Uint8Array.from(input).buffer
      worker.postMessage({ id: 1, action: 'compress-png', png, quality: 82 }, [png])
    })

    expect(response.success, response.error).toBe(true)
    expect(response.quantizationAttempted).toBe(true)
    expect(response.quantizationError).toBeUndefined()
    expect(response.quantizedCandidateSize, JSON.stringify(response)).toBeDefined()
    expect(['oxipng', 'libimagequant-oxipng']).toContain(response.strategy)
    expect(response.originalSize).toBe(originalSize)
    expect(response.outputSize).toBeLessThan(originalSize)
    expect(response.paletteLength).toBeLessThanOrEqual(192)

    const output = new Uint8Array(response.png ?? new ArrayBuffer(0))
    expect(Array.from(output.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  }, 25_000)

  it('uses OxiPNG without quantization for continuous-tone PNG images', async () => {
    const worker = await startCodecWorker()
    const input = encodeRgbaPng(256, 256, (x, y) => [x, y, (x * 3 + y * 5) % 256, 255])
    const originalSize = input.byteLength

    const response = await new Promise<CompressionResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Codec worker timed out')), 20_000)
      worker.once('error', reject)
      worker.once('message', (message: CompressionResponse) => {
        clearTimeout(timeout)
        resolve(message)
      })
      const png = Uint8Array.from(input).buffer
      worker.postMessage({ id: 2, action: 'compress-png', png, quality: 82 }, [png])
    })

    expect(response.success, response.error).toBe(true)
    expect(response.quantizationAttempted).toBe(false)
    expect(response.strategy).toBe('oxipng')
    expect(response.outputSize).toBeLessThan(originalSize)
  }, 25_000)
})
