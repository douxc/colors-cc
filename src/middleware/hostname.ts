import type { Context, Next, MiddlewareHandler } from 'hono'
import type { Env, Variables } from '../types'

/**
 * Hostname detection middleware
 * Detects if the request is coming from api.colors-cc.top subdomain
 * and sets a flag in the context for conditional routing
 */
export const hostnameMiddleware = (): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> => {
  return async (c, next) => {
    const host = c.req.header('host') || ''
    
    // Check if request is from API subdomain
    // Supports: api.colors-cc.top, api.localhost (for local dev)
    const isApiSubdomain = host.startsWith('api.') || host.includes('api.colors-cc')
    
    // Store flag in context for use in routing logic
    c.set('isApiSubdomain', isApiSubdomain)
    
    await next()
  }
}
