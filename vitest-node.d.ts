declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string
}

declare module 'node:fs/promises' {
  export function mkdir(path: string, options: { recursive: boolean }): Promise<string | undefined>
  export function readFile(path: string | URL, encoding: 'utf8'): Promise<string>
  export function rm(path: string, options: { recursive: boolean; force: boolean }): Promise<void>
  export function writeFile(path: string, data: string | Uint8Array, encoding?: 'utf8'): Promise<void>
}
