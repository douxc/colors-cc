import type { Child, FC } from 'hono/jsx'
import { commonMessages } from '../i18n'
import { createSeoMetadata } from '../seo'
import {
  htmlLang,
  localePrefix,
  type Locale,
  type SiteConfig
} from '../site'
import { renderSiteFooter, renderSiteNav, siteNavScript } from './site-chrome'
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
          <div
            class="site-chrome-slot"
            dangerouslySetInnerHTML={{ __html: renderSiteNav(props.config, props.locale, path) }}
          />

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

          <div
            class="site-chrome-slot"
            dangerouslySetInnerHTML={{ __html: renderSiteFooter(props.config, props.locale) }}
          />
        </div>
        <script dangerouslySetInnerHTML={{ __html: themeControlScript }} />
        <script dangerouslySetInnerHTML={{ __html: siteNavScript }} />
      </body>
    </html>
  )
}
