// Color utility functions

export function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
}

export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(hex)
}

export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num))
}
