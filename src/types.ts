/**
 * Type definitions for the application
 */

import type { SearchVerificationBindings } from './search-verification'

// Define the environment type for Cloudflare Workers
export type Env = SearchVerificationBindings

// Define context variables
export type Variables = {
  isApiSubdomain: boolean
}
