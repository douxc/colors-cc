import { Hono } from 'hono'
import type { Env, Variables } from './types'

// Import HTML templates
import homeTemplate from './templates/home.html'

// Import middleware
import { hostnameMiddleware } from './middleware/hostname'

// Import unified API router
import apiRouter from './routes/api/index'

// Import documentation routes
import llmsRoute from './routes/docs/llms'
import openapiRoute from './routes/docs/openapi'
import skillsRoute from './routes/docs/skills'

// Import SEO routes
import robotsRoute from './routes/seo/robots'
import sitemapRoute from './routes/seo/sitemap'

// Import tool pages
import toolsRoute from './routes/pages/tools'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Apply hostname detection middleware globally
app.use('*', hostnameMiddleware())

// Conditional routing based on hostname
// For api.colors-cc.top: mount API routes at root level
// For colors-cc.top: mount API routes at /api prefix
app.use('*', async (c, next) => {
  const isApiSubdomain = c.get('isApiSubdomain')
  
  if (isApiSubdomain) {
    // API subdomain: only serve API endpoints at root
    const path = new URL(c.req.url).pathname
    
    // Check if this is an API endpoint path
    const apiPaths = ['/random', '/palette', '/convert', '/all-names', '/placeholder', '/fluid-placeholder']
    const isApiPath = apiPaths.some(p => path === p || path.startsWith(p + '?'))
    
    if (isApiPath) {
      // Route to API handler
      return apiRouter.fetch(c.req.raw, c.env)
    } else {
      // For non-API paths on subdomain, return 404
      return c.json({ error: 'Not found. This subdomain only serves API endpoints.' }, 404)
    }
  }
  
  await next()
})

// Main domain routes (colors-cc.top)
// Mount API routes with /api prefix
app.route('/api', apiRouter)

// Mount documentation routes
app.route('/', llmsRoute)
app.route('/', openapiRoute)
app.route('/', skillsRoute)

// Mount SEO routes
app.route('/', robotsRoute)
app.route('/', sitemapRoute)

// Mount tool pages
app.route('/tools', toolsRoute)

// Homepage
app.get('/', (c) => {
  return c.html(homeTemplate)
})

export default app
