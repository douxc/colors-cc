import type { FC } from 'hono/jsx'

export const Layout: FC<{ title: string; desc: string; path?: string; children?: any }> = (props) => {
  const canonicalUrl = `https://colors-cc.top${props.path || ''}`
  const ogImage = 'https://api.colors-cc.top/placeholder?w=1200&h=630&text=colors-cc+API&start=%23FF003C&end=%2300B8FF'
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
            
            @media (max-width: 640px) {
                body { margin: 20px auto; }
                h1 { font-size: 1.8em; }
                h2 { font-size: 1.2em; }
                .box { padding: 20px; }
                #theme-cards { grid-template-columns: repeat(2, 1fr) !important; }
                #demo-box { height: 400px !important; }
                footer { margin-top: 40px; }
                footer div { flex-direction: column; gap: 10px; }
            }
            
            @media (min-width: 641px) and (max-width: 768px) {
                #demo-box { height: 500px !important; }
            }
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
        <footer style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee;">
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 15px;">
                <a href="https://github.com/douxc/colors-cc" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 8px; color: #666; text-decoration: none; transition: color 0.2s;">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                    </svg>
                    <span style="font-size: 0.9em; font-weight: 500;">GitHub</span>
                </a>
            </div>
            <p style="text-align: center; color: #999; font-size: 0.85em; margin: 0;">
                Free Color API for Developers | <a href="https://colors-cc.top" style="color: #999;">colors-cc.top</a>
            </p>
        </footer>
    </body>
    </html>
  )
}
