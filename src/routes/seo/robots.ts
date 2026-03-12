import { Hono } from 'hono'

const app = new Hono()

app.get('/robots.txt', (c) => {
  const content = `User-agent: *
Allow: /

Sitemap: https://colors-cc.top/sitemap.xml

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

export default app
