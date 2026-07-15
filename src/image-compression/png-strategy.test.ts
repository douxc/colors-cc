import { describe, expect, it } from 'vitest'
import { analyzePngPixels, choosePngCompressionPlan } from './png-strategy'

const createPixels = (
  width: number,
  height: number,
  pixel: (x: number, y: number) => readonly [number, number, number, number]
): Uint8ClampedArray => {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      pixels.set(pixel(x, y), offset)
    }
  }
  return pixels
}

describe('PNG compression strategy', () => {
  it('selects palette quantization for flat graphics', () => {
    const pixels = createPixels(64, 64, (x, y) =>
      (x + y) % 2 === 0 ? [20, 40, 60, 255] : [240, 220, 180, 255])
    const analysis = analyzePngPixels(pixels, 64, 64)
    const plan = choosePngCompressionPlan(analysis, 80)

    expect(analysis.colorBuckets).toBe(2)
    expect(plan.mode).toBe('quantized')
    expect(plan.maxColors).toBe(192)
  })

  it('keeps continuous-tone images on the lossless path', () => {
    const pixels = createPixels(256, 256, (x, y) => [x, y, (x * 3 + y * 5) % 256, 255])
    const analysis = analyzePngPixels(pixels, 256, 256)
    const plan = choosePngCompressionPlan(analysis, 80)

    expect(analysis.colorBuckets).toBeGreaterThan(1_100)
    expect(analysis.edgeRatio).toBeLessThan(0.12)
    expect(plan.mode).toBe('lossless')
    expect(plan.reason).toBe('continuous-tone')
  })

  it('selects quantization for transparent artwork', () => {
    const pixels = createPixels(128, 128, (x, y) => [x * 2, y * 2, 160, (x + y) % 5 === 0 ? 0 : 255])
    const analysis = analyzePngPixels(pixels, 128, 128)
    const plan = choosePngCompressionPlan(analysis, 92)

    expect(analysis.transparentPixelRatio).toBeGreaterThan(0.01)
    expect(plan.mode).toBe('quantized')
    expect(plan.reason).toBe('transparent-graphics')
    expect(plan.maxColors).toBe(256)
  })

  it('rejects invalid pixel buffers without throwing', () => {
    expect(analyzePngPixels(new Uint8ClampedArray(3), 10, 10)).toEqual({
      sampledPixels: 0,
      colorBuckets: 0,
      colorBucketRatio: 0,
      transparentPixelRatio: 0,
      edgeRatio: 0
    })
  })
})
