declare module "*.html" {
  const content: string
  export default content
}

declare module "*.wasm" {
  const bytes: Uint8Array
  export default bytes
}
