import { Hono } from 'hono'

const app = new Hono()

app.get('/sitemap.xml', (c) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://colors-cc.top/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://colors-cc.top/tools/converter</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url><loc>https://colors-cc.top/tools/hex-to-rgb</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hex-to-hsl</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hex-to-cmyk</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/rgb-to-hex</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/rgb-to-hsl</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hsl-to-hex</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/hsl-to-rgb</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/cmyk-to-hex</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://colors-cc.top/tools/cmyk-to-rgb</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url>
    <loc>https://colors-cc.top/tools/random-palette</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://colors-cc.top/tools/color-names</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
  c.header('Content-Type', 'text/xml')
  c.header('Cache-Control', 'public, max-age=86400')
  return c.body(xml)
})

export default app
