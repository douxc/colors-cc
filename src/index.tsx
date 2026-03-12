import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import HTML templates
import homeTemplate from './templates/home.html'

// Import API routes
import randomApi from './routes/api/random'
import paletteApi from './routes/api/palette'
import convertApi from './routes/api/convert'
import allNamesApi from './routes/api/all-names'
import placeholderApi from './routes/api/placeholder'

// Import documentation routes
import llmsRoute from './routes/docs/llms'
import openapiRoute from './routes/docs/openapi'
import skillsRoute from './routes/docs/skills'

// Import SEO routes
import robotsRoute from './routes/seo/robots'
import sitemapRoute from './routes/seo/sitemap'

// Import tool pages
import toolsRoute from './routes/pages/tools'

const app = new Hono()

// Enable CORS for all API routes
app.use('/api/*', cors())

// Mount API routes
app.route('/api', randomApi)
app.route('/api', paletteApi)
app.route('/api', convertApi)
app.route('/api', allNamesApi)
app.route('/api', placeholderApi)

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
