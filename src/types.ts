/**
 * Type definitions for the application
 */

// Define the environment type for Cloudflare Workers
export type Env = {
  // Add KV namespaces, D1 databases, or secrets here if needed
  // MY_KV: KVNamespace
}

// Define context variables
export type Variables = {
  isApiSubdomain: boolean
}
