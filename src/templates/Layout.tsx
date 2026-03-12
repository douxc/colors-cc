import type { FC } from 'hono/jsx'

export const Layout: FC<{ title: string; desc: string; children?: any }> = (props) => {
  return (
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} | colors-cc</title>
        <meta name="description" content={props.desc} />
        <style dangerouslySetInnerHTML={{ __html: `
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
            header { margin-bottom: 40px; }
            h1 { color: #111; }
            .box { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 20px; }
            a { color: #0066cc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .home-link { margin-bottom: 20px; display: inline-block; }
        `}} />
    </head>
    <body>
        <a href="/" class="home-link">&larr; Back to API Home</a>
        <header>
            <h1>{props.title}</h1>
            <p>{props.desc}</p>
        </header>
        <main>
            {props.children}
        </main>
    </body>
    </html>
  )
}
