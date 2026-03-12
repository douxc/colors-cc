import type { FC } from 'hono/jsx'

export const Layout: FC<{ title: string; desc: string; path?: string; children?: any }> = (props) => {
  const canonicalUrl = `https://colors-cc.top${props.path || ''}`
  const ogImage = 'https://colors-cc.top/api/placeholder?w=1200&h=630&text=colors-cc+API&start=%23FF003C&end=%2300B8FF'
  const fullTitle = `${props.title} | colors-cc`
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': props.title,
    'description': props.desc,
    'url': canonicalUrl,
    'applicationCategory': 'DeveloperApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'author': {
      '@type': 'Organization',
      'name': 'colors-cc',
      'url': 'https://colors-cc.top'
    }
  }
  
  return (
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <title>{fullTitle}</title>
        <meta name="description" content={props.desc} />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={props.desc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="colors-cc" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={props.desc} />
        <meta name="twitter:image" content={ogImage} />
        
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        
        <style dangerouslySetInnerHTML={{ __html: `
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; background: #fafafa; }
            header { margin-bottom: 40px; }
            h1 { color: #111; }
            h2 { color: #222; margin-top: 30px; }
            h3 { color: #444; font-size: 1.1em; }
            .box { background: #fff; padding: 25px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .desc { color: #666; line-height: 1.5; }
            code { background: #f0f0f0; padding: 3px 6px; border-radius: 4px; font-size: 0.9em; font-family: ui-monospace, monospace; color: #e83e8c; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .home-link { margin-bottom: 20px; display: inline-block; color: #666; }
            .btn { display: inline-block; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 10px; font-weight: 500; transition: background 0.2s; }
            .btn:hover { background: #333; text-decoration: none; }
        `}} />
    </head>
    <body>
        <a href="/" class="home-link">&larr; Back to API Home</a>
        <header>
            <h1>{props.title}</h1>
            <p class="desc">{props.desc}</p>
        </header>
        <main>
            {props.children}
        </main>
        <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 0.85em;">
            <p>Free Color API for Developers | <a href="https://colors-cc.top" style="color: #999;">colors-cc.top</a></p>
        </footer>
    </body>
    </html>
  )
}
