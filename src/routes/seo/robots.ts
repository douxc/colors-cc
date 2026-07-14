import { Hono } from 'hono'
import type { SiteConfig } from '../../site'

export const createRobotsRoute = (config: SiteConfig): Hono => {
  const app = new Hono()

  app.get('/robots.txt', (c) => {
    const content = `# Search engines
User-agent: Googlebot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: 360Spider
Allow: /

User-agent: Bytespider
Allow: /

User-agent: *
Allow: /

Sitemap: ${config.origin}/sitemap.xml
Sitemap: ${config.origin}/sitemap.txt

# AI Agents & LLMs
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /`
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=86400')
    return c.body(content)
  })

  return app
}
