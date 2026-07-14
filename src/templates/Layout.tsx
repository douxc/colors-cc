import type { Child, FC } from 'hono/jsx'
import { commonMessages } from '../i18n'
import { createSeoMetadata } from '../seo'
import {
  htmlLang,
  localePrefix,
  type Locale,
  type SiteConfig
} from '../site'
import { renderNavUtilityControlItems } from './nav-controls'
import { sharedStyles } from './styles'
import { themeControlScript, themeInitScript } from './theme'

type LayoutProps = {
  config: SiteConfig
  locale: Locale
  title: string
  desc: string
  path?: string
  eyebrow?: string
  children?: Child
}

export const Layout: FC<LayoutProps> = (props) => {
  const messages = commonMessages[props.locale]
  const prefix = localePrefix(props.locale)
  const path = props.path || ''
  const currentSection = path === '/tools/random-palette'
    ? 'palettes'
    : path === '/tools/color-names'
      ? 'names'
      : path === '/tools/image-compress'
        ? 'images'
        : path.startsWith('/tools/')
          ? 'convert'
          : 'create'
  const fullTitle = `${props.title} | colors-cc`
  const seo = createSeoMetadata(props.config, props.locale, path, fullTitle, props.desc)
  const structuredData = JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')

  return (
    <html lang={htmlLang(props.locale)}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#f7f9fc" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="author" content="colors-cc" />
        <meta name="robots" content={seo.robots} />
        <meta name="googlebot" content={seo.robots} />
        <meta name="Baiduspider" content="index, follow" />
        <meta name="applicable-device" content="pc,mobile" />
        {Object.entries(seo.verificationMeta).map(([name, content]) => (
          <meta name={name} content={content} />
        ))}
        <link rel="canonical" href={seo.canonicalUrl} />
        {seo.alternates.map(({ hreflang, href }) => (
          <link rel="alternate" hreflang={hreflang} href={href} />
        ))}
        <link rel="sitemap" type="application/xml" href={`${props.config.origin}/sitemap.xml`} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href={props.config.apiBaseUrl} crossorigin="" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.canonicalUrl} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={seo.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={seo.title} />
        <meta property="og:locale" content={seo.ogLocale} />
        <meta property="og:locale:alternate" content={seo.ogLocaleAlternate} />
        <meta property="og:site_name" content="colors-cc" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.ogImage} />
        <meta name="twitter:image:alt" content={seo.title} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <style dangerouslySetInnerHTML={{ __html: sharedStyles }} />
      </head>
      <body>
        <a href="#main-content" class="skip-link">{messages.skipToContent}</a>
        <div class="app-shell">
          <header class="site-nav">
            <a href={prefix} class="brand" aria-label={messages.homeLabel}>
              <span class="brand-mark" aria-hidden="true"></span>
              <span>colors-cc</span>
            </a>
            <nav class="nav-links" aria-label={messages.primaryNavigation}>
              <a
                class="nav-link"
                href={prefix}
                aria-current={currentSection === 'create' ? 'page' : undefined}
              >{messages.create}</a>
              <a
                class="nav-link"
                href={`${prefix}/tools/converter`}
                aria-current={currentSection === 'convert' ? 'page' : undefined}
              >{messages.convert}</a>
              <a
                class="nav-link"
                href={`${prefix}/tools/random-palette`}
                aria-current={currentSection === 'palettes' ? 'page' : undefined}
              >{messages.palettes}</a>
              <a
                class="nav-link"
                href={`${prefix}/tools/color-names`}
                aria-current={currentSection === 'names' ? 'page' : undefined}
              >{messages.colorNames}</a>
              <a
                class="nav-link"
                href={`${prefix}/tools/image-compress`}
                aria-current={currentSection === 'images' ? 'page' : undefined}
              >{messages.imageTools}</a>
            </nav>
            <div class="nav-actions">
              <div
                class="nav-utility-group"
                dangerouslySetInnerHTML={{ __html: renderNavUtilityControlItems(props.locale, path) }}
              />
              <a class="button button-quiet button-small" href="/llms.txt">llms.txt</a>
              <a class="button button-primary button-small" href={`${prefix}#for-ai`}>{messages.forAi}</a>
            </div>
          </header>

          <main id="main-content">
            <header class="page-heading">
              <nav class="breadcrumb" aria-label={props.locale === 'zh' ? '面包屑导航' : 'Breadcrumb'}>
                <a href={prefix}>{props.locale === 'zh' ? '首页' : 'Home'}</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{props.title}</span>
              </nav>
              <p class="eyebrow">{props.eyebrow || messages.colorTool}</p>
              <h1>{props.title}</h1>
              <p>{props.desc}</p>
            </header>
            {props.children}
          </main>

          <footer class="site-footer">
            <div class="site-footer-main">
              <span>{messages.footerTagline}</span>
              <nav class="footer-links" aria-label={messages.footerNavigation}>
                <a href="https://github.com/douxc/colors-cc" target="_blank" rel="noopener">GitHub</a>
                <a href="/llms.txt">llms.txt</a>
                <a href="/openapi.json">OpenAPI</a>
                <a href="/skills/colors-cc.md">{messages.agentSkill}</a>
              </nav>
            </div>
            {props.config.edition === 'cn' && (
              <div class="site-compliance">
                <a href={props.config.icp.url} target="_blank" rel="noopener noreferrer">{props.config.icp.number}</a>
              </div>
            )}
          </footer>
        </div>
        <script dangerouslySetInnerHTML={{ __html: themeControlScript }} />
      </body>
    </html>
  )
}
