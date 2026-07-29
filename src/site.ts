export type Locale = 'en' | 'zh'

type BaseSiteConfig = {
  origin: string
  defaultLocale: Locale
  enabledLocales: readonly Locale[]
  apiBaseUrl: string
  verificationMeta?: Readonly<Record<string, string>>
  feedbackEmail?: string
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
  enabledLocales: ['en', 'zh'],
  apiBaseUrl: 'https://api.colors-cc.top',
  feedbackEmail: 'douxc512@gmail.com'
} satisfies SiteConfig

export const cnSiteConfig = {
  edition: 'cn',
  origin: 'https://www.colors-cc.top',
  defaultLocale: 'zh',
  enabledLocales: ['zh'],
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

export const supportsLocale = (config: SiteConfig, locale: Locale): boolean =>
  config.enabledLocales.includes(locale)

export const htmlLang = (locale: Locale): string => locale === 'zh' ? 'zh-CN' : 'en'

export type HreflangAlternate = {
  hreflang: string
  href: string
}

export const hreflangAlternates = (path: string): readonly HreflangAlternate[] => [
  { hreflang: 'en', href: localizedUrl(globalSiteConfig.origin, 'en', path) },
  { hreflang: 'zh-Hans', href: localizedUrl(globalSiteConfig.origin, 'zh', path) },
  { hreflang: 'zh-CN', href: localizedUrl(cnSiteConfig.origin, 'zh', path) },
  { hreflang: 'x-default', href: localizedUrl(globalSiteConfig.origin, 'en', path) }
]

export const renderComplianceFooter = (config: SiteConfig): string => {
  if (config.edition !== 'cn') return ''
  return `<div class="site-compliance"><a href="${config.icp.url}" target="_blank" rel="noopener noreferrer">${config.icp.number}</a></div>`
}

export const renderFeedbackLink = (config: SiteConfig, locale: Locale): string => {
  if (config.edition !== 'global' || !config.feedbackEmail) return ''
  const label = locale === 'zh' ? '反馈' : 'Feedback'
  return `<a href="mailto:${config.feedbackEmail}">${label}</a>`
}
