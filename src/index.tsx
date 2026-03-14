import { Hono } from 'hono'
import type { Env, Variables } from './types'

// Import HTML templates
import homeTemplate from './templates/home.html'

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
