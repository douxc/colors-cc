import type { Child, FC } from 'hono/jsx'
import { commonMessages } from '../i18n'
import {
  alternateLocale,
  htmlLang,
  localePrefix,
  localizedPath,
  localizedUrl,
  type Locale,
  type SiteConfig
} from '../site'
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
  const canonicalUrl = localizedUrl(props.config.origin, props.locale, path)
  const otherLocale = alternateLocale(props.locale)
  const languageSwitchUrl = localizedPath(otherLocale, path)
  const ogImage = `${props.config.apiBaseUrl}/placeholder?w=1200&h=630&text=colors-cc+API&effect=mesh&palette=%235EE7F7,%23A78BFA,%23F472B6`
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
    author: { '@type': 'Organization', name: 'colors-cc', url: props.config.origin }
  }

  return (
    <html lang={htmlLang(props.locale)}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#f7f9fc" />
        <title>{fullTitle}</title>
        <meta name="description" content={props.desc} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hreflang="en" href={localizedUrl('https://colors-cc.top', 'en', path)} />
        <link rel="alternate" hreflang="zh" href={localizedUrl('https://colors-cc.top', 'zh', path)} />
        <link rel="alternate" hreflang="en-CN" href={localizedUrl('https://www.colors-cc.top', 'en', path)} />
        <link rel="alternate" hreflang="zh-CN" href={localizedUrl('https://www.colors-cc.top', 'zh', path)} />
        <link rel="alternate" hreflang="x-default" href={localizedUrl('https://colors-cc.top', 'en', path)} />
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
              <a class="nav-link" href={prefix}>{messages.create}</a>
              <a class="nav-link" href={`${prefix}/tools/converter`}>{messages.convert}</a>
              <a class="nav-link" href={`${prefix}/tools/random-palette`}>{messages.palettes}</a>
              <a class="nav-link" href={`${prefix}/tools/color-names`}>{messages.colorNames}</a>
              <a class="nav-link" href={`${prefix}/tools/image-compress`}>{messages.imageTools}</a>
            </nav>
            <div class="nav-actions">
              <a class="button button-quiet button-small language-switch" href={languageSwitchUrl} aria-label={messages.switchLanguage}>
                {messages.switchLanguageText}
              </a>
              <label class="theme-picker">
                <span class="sr-only">{messages.colorTheme}</span>
                <select class="theme-select" data-theme-select aria-label={messages.colorTheme}>
                  <option value="system">{messages.systemTheme}</option>
                  <option value="light">{messages.lightTheme}</option>
                  <option value="dark">{messages.darkTheme}</option>
                </select>
              </label>
              <a class="button button-quiet button-small" href="/llms.txt">llms.txt</a>
              <a class="button button-primary button-small" href={`${prefix}#for-ai`}>{messages.forAi}</a>
            </div>
          </header>

          <main id="main-content">
            <header class="page-heading">
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
