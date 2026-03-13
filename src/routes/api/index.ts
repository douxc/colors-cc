import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import all API route modules
import randomApi from './random'
import paletteApi from './palette'
import convertApi from './convert'
import allNamesApi from './all-names'
import placeholderApi from './placeholder'
import fluidPlaceholderApi from './fluid-placeholder'

/**
 * Create a unified API router
 * This router consolidates all API endpoints into a single Hono instance
 * that can be mounted at different paths based on the hostname
 */
export const createApiRouter = () => {
  const api = new Hono()

  // Enable CORS for all API routes
  api.use('/*', cors())

  // Mount all API endpoints
  // Each route module defines its own path (e.g., '/random', '/palette')
  api.route('/', randomApi)
  api.route('/', paletteApi)
  api.route('/', convertApi)
  api.route('/', allNamesApi)
  api.route('/', placeholderApi)
  api.route('/', fluidPlaceholderApi)

  return api
}

export default createApiRouter()
