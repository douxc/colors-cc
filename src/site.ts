export type Locale = 'en' | 'zh'

type BaseSiteConfig = {
  origin: string
  defaultLocale: Locale
  apiBaseUrl: string
}

export type SiteConfig =
  | (BaseSiteConfig & {
      edition: 'global'
    })
  | (BaseSiteConfig & {
      edition: 'cn'
      icp: {
        number: string
        url: string
      }
    })

export const globalSiteConfig = {
  edition: 'global',
  origin: 'https://colors-cc.top',
  defaultLocale: 'en',
  apiBaseUrl: 'https://api.colors-cc.top'
} satisfies SiteConfig

export const cnSiteConfig = {
  edition: 'cn',
  origin: 'https://www.colors-cc.top',
  defaultLocale: 'zh',
  apiBaseUrl: 'https://api.colors-cc.top',
  icp: {
    number: '苏ICP备2024075067号-4',
    url: 'https://beian.miit.gov.cn/'
  }
} satisfies SiteConfig

export const localePrefix = (locale: Locale): string => `/${locale}`

export const localizedPath = (locale: Locale, path = ''): string => {
  const normalizedPath = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `${localePrefix(locale)}${normalizedPath}`
}

export const localizedUrl = (origin: string, locale: Locale, path = ''): string =>
  `${origin}${localizedPath(locale, path)}`

export const alternateLocale = (locale: Locale): Locale => locale === 'en' ? 'zh' : 'en'

export const htmlLang = (locale: Locale): string => locale === 'zh' ? 'zh-CN' : 'en'

export const renderAlternateLinks = (path: string): string => {
  const globalOrigin = globalSiteConfig.origin
  const cnOrigin = cnSiteConfig.origin
  return [
    `<link rel="alternate" hreflang="en" href="${localizedUrl(globalOrigin, 'en', path)}">`,
    `<link rel="alternate" hreflang="zh" href="${localizedUrl(globalOrigin, 'zh', path)}">`,
    `<link rel="alternate" hreflang="en-CN" href="${localizedUrl(cnOrigin, 'en', path)}">`,
    `<link rel="alternate" hreflang="zh-CN" href="${localizedUrl(cnOrigin, 'zh', path)}">`,
    `<link rel="alternate" hreflang="x-default" href="${localizedUrl(globalOrigin, 'en', path)}">`
  ].join('\n  ')
}

export const renderComplianceFooter = (config: SiteConfig): string => {
  if (config.edition !== 'cn') return ''
  return `<div class="site-compliance"><a href="${config.icp.url}" target="_blank" rel="noopener noreferrer">${config.icp.number}</a></div>`
}
