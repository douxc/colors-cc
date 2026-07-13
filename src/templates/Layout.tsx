import type { Child, FC } from 'hono/jsx'
import { sharedStyles } from './styles'

type LayoutProps = {
  title: string
  desc: string
  path?: string
  eyebrow?: string
  children?: Child
}

export const Layout: FC<LayoutProps> = (props) => {
  const canonicalUrl = `https://colors-cc.top${props.path || ''}`
  const ogImage = 'https://api.colors-cc.top/placeholder?w=1200&h=630&text=colors-cc+API&effect=mesh&palette=%235EE7F7,%23A78BFA,%23F472B6'
  const fullTitle = `${props.title} | colors-cc`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: props.title,
    description: props.desc,
    url: canonicalUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: 'colors-cc', url: 'https://colors-cc.top' }
  }

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#07080c" />
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
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={props.desc} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <style dangerouslySetInnerHTML={{ __html: sharedStyles }} />
      </head>
      <body>
        <a href="#main-content" class="skip-link">Skip to content</a>
        <div class="app-shell">
          <header class="site-nav">
            <a href="/" class="brand" aria-label="colors-cc home">
              <span class="brand-mark" aria-hidden="true"></span>
              <span>colors-cc</span>
            </a>
            <nav class="nav-links" aria-label="Primary navigation">
              <a class="nav-link" href="/">Create</a>
              <a class="nav-link" href="/tools/converter">Convert</a>
              <a class="nav-link" href="/tools/random-palette">Palettes</a>
              <a class="nav-link" href="/tools/color-names">Color names</a>
            </nav>
            <div class="nav-actions">
              <a class="button button-quiet button-small" href="/llms.txt">llms.txt</a>
              <a class="button button-primary button-small" href="/#for-ai">For AI</a>
            </div>
          </header>

          <main id="main-content">
            <header class="page-heading">
              <p class="eyebrow">{props.eyebrow || 'Color tool'}</p>
              <h1>{props.title}</h1>
              <p>{props.desc}</p>
            </header>
            {props.children}
          </main>

          <footer class="site-footer">
            <span>Edge-native color infrastructure for humans and AI agents.</span>
            <nav class="footer-links" aria-label="Footer navigation">
              <a href="https://github.com/douxc/colors-cc" target="_blank" rel="noopener">GitHub</a>
              <a href="/llms.txt">llms.txt</a>
              <a href="/openapi.json">OpenAPI</a>
              <a href="/skills/colors-cc.md">Agent Skill</a>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  )
}
