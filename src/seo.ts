import {
  hreflangAlternates,
  htmlLang,
  localizedUrl,
  type HreflangAlternate,
  type Locale,
  type SiteConfig
} from './site'

export const SEARCH_ROBOTS_POLICY =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export type SeoMetadata = {
  title: string
  description: string
  keywords: string
  canonicalUrl: string
  alternates: readonly HreflangAlternate[]
  ogLocale: string
  ogLocaleAlternate: string
  ogImage: string
  robots: string
  structuredData: Record<string, unknown>
  verificationMeta: Readonly<Record<string, string>>
}

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const pageName = (title: string): string => title.replace(/\s*\|\s*colors-cc$/i, '')

const applicationCategory = (path: string): string => {
  if (path === '/tools/image-compress') return 'MultimediaApplication'
  if (path === '/tools/random-palette' || path === '/tools/color-names') return 'DesignApplication'
  return 'DeveloperApplication'
}

const localizedKeywords = (locale: Locale, path: string): string => {
  const common = locale === 'zh'
    ? ['颜色工具', 'SVG 占位图', '颜色 API', '颜色转换器', '配色生成器', 'CSS 颜色']
    : ['color tools', 'SVG placeholder', 'color API', 'color converter', 'palette generator', 'CSS colors']
  const pathTerms = path
    .split('/')
    .filter(Boolean)
    .flatMap(term => term.split('-'))
    .filter(term => term !== 'tools')

  return [...new Set([...pathTerms, ...common])].join(', ')
}

const createStructuredData = (
  config: SiteConfig,
  locale: Locale,
  path: string,
  title: string,
  description: string,
  canonicalUrl: string
): Record<string, unknown> => {
  const siteId = `${config.origin}/#website`
  const organizationId = `${config.origin}/#organization`
  const graph: Array<Record<string, unknown>> = []

  if (path === '/') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'colors-cc',
        url: `${config.origin}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${config.origin}/favicon.svg`,
          width: 64,
          height: 64
        },
        sameAs: ['https://github.com/douxc/colors-cc']
      },
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: `${config.origin}/`,
        name: 'colors-cc',
        alternateName: 'Colors CC',
        inLanguage: ['en', 'zh-CN'],
        publisher: { '@id': organizationId }
      }
    )
  }

  graph.push({
    '@type': 'WebApplication',
    '@id': `${canonicalUrl}#webapp`,
    name: pageName(title),
    description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    isPartOf: { '@id': siteId },
    applicationCategory: applicationCategory(path),
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern web browser',
    inLanguage: htmlLang(locale),
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    author: { '@id': organizationId }
  })

  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'zh' ? '首页' : 'Home',
          item: localizedUrl(config.origin, locale, '/')
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageName(title),
          item: canonicalUrl
        }
      ]
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export const createSeoMetadata = (
  config: SiteConfig,
  locale: Locale,
  path: string,
  title: string,
  description: string
): SeoMetadata => {
  const canonicalUrl = localizedUrl(config.origin, locale, path)
  const imageText = encodeURIComponent(pageName(title).slice(0, 64))
  const ogImage = `${config.apiBaseUrl}/placeholder?w=1200&h=630&text=${imageText}` +
    '&effect=mesh&palette=%235EE7F7,%23A78BFA,%23F472B6'

  return {
    title,
    description,
    keywords: localizedKeywords(locale, path),
    canonicalUrl,
    alternates: hreflangAlternates(path),
    ogLocale: locale === 'zh' ? 'zh_CN' : 'en_US',
    ogLocaleAlternate: locale === 'zh' ? 'en_US' : 'zh_CN',
    ogImage,
    robots: SEARCH_ROBOTS_POLICY,
    structuredData: createStructuredData(config, locale, path, title, description, canonicalUrl),
    verificationMeta: path === '/' ? (config.verificationMeta ?? {}) : {}
  }
}

export const renderSeoHead = (metadata: SeoMetadata, config: SiteConfig): string => {
  const alternates = metadata.alternates
    .map(({ hreflang, href }) =>
      `<link rel="alternate" hreflang="${escapeHtml(hreflang)}" href="${escapeHtml(href)}">`)
    .join('\n  ')
  const verification = Object.entries(metadata.verificationMeta)
    .map(([name, content]) =>
      `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`)
    .join('\n  ')
  const structuredData = JSON.stringify(metadata.structuredData).replace(/</g, '\\u003c')

  return `<title>${escapeHtml(metadata.title)}</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <meta name="keywords" content="${escapeHtml(metadata.keywords)}">
  <meta name="author" content="colors-cc">
  <meta name="robots" content="${metadata.robots}">
  <meta name="googlebot" content="${metadata.robots}">
  <meta name="Baiduspider" content="index, follow">
  <meta name="applicable-device" content="pc,mobile">
  ${verification ? `${verification}\n  ` : ''}<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}">
  ${alternates}
  <link rel="sitemap" type="application/xml" href="${config.origin}/sitemap.xml">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="${config.apiBaseUrl}" crossorigin>
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:image" content="${escapeHtml(metadata.ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(metadata.title)}">
  <meta property="og:locale" content="${metadata.ogLocale}">
  <meta property="og:locale:alternate" content="${metadata.ogLocaleAlternate}">
  <meta property="og:site_name" content="colors-cc">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
  <meta name="twitter:image" content="${escapeHtml(metadata.ogImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(metadata.title)}">
  <script type="application/ld+json">${structuredData}</script>`
}
