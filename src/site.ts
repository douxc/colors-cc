export type Locale = 'en' | 'zh' | 'ja'

export const localeInfo = {
  en: { label: 'English', lang: 'en', hreflang: 'en', ogLocale: 'en_US' },
  zh: { label: '简体中文', lang: 'zh-CN', hreflang: 'zh-Hans', ogLocale: 'zh_CN' },
  ja: { label: '日本語', lang: 'ja', hreflang: 'ja', ogLocale: 'ja_JP' }
} satisfies Record<Locale, { label: string; lang: string; hreflang: string; ogLocale: string }>

export type SiteConfig = {
  origin: string
  defaultLocale: Locale
  enabledLocales: readonly Locale[]
  apiBaseUrl: string
  verificationMeta?: Readonly<Record<string, string>>
  feedbackEmail?: string
}

export const globalSiteConfig = {
  origin: 'https://colors-cc.top',
  defaultLocale: 'en',
  enabledLocales: ['en', 'zh', 'ja'],
  apiBaseUrl: 'https://api.colors-cc.top',
  feedbackEmail: 'douxc512@gmail.com'
} satisfies SiteConfig

// Legacy tool paths migrated to the standalone offline-tools app.
// Single source of truth for both the Worker redirects and the home/nav links.
export const TOOL_REDIRECTS = {
  '/tools/image-compress': 'https://offline-tools.colors-cc.top/image-compress/'
} as const

export const localePrefix = (locale: Locale): string => `/${locale}`

export const localizedPath = (locale: Locale, path = ''): string => {
  const normalizedPath = !path || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `${localePrefix(locale)}${normalizedPath}`
}

export const localizedUrl = (origin: string, locale: Locale, path = ''): string =>
  `${origin}${localizedPath(locale, path)}`

export const supportsLocale = (config: SiteConfig, locale: Locale): boolean =>
  config.enabledLocales.includes(locale)

export const htmlLang = (locale: Locale): string => localeInfo[locale].lang

export const documentationPath = (locale: Locale, path: string): string =>
  locale === 'ja' ? `/ja${path}` : path

export type HreflangAlternate = {
  hreflang: string
  href: string
}

export const hreflangAlternates = (path: string): readonly HreflangAlternate[] => [
  { hreflang: 'en', href: localizedUrl(globalSiteConfig.origin, 'en', path) },
  { hreflang: 'zh-Hans', href: localizedUrl(globalSiteConfig.origin, 'zh', path) },
  { hreflang: 'zh-CN', href: localizedUrl(globalSiteConfig.origin, 'zh', path) },
  { hreflang: 'ja', href: localizedUrl(globalSiteConfig.origin, 'ja', path) },
  { hreflang: 'x-default', href: localizedUrl(globalSiteConfig.origin, 'en', path) }
]

export const renderFeedbackLink = (config: SiteConfig, locale: Locale): string => {
  if (!config.feedbackEmail) return ''
  const label = { en: 'Feedback', zh: '反馈', ja: 'フィードバック' }[locale]
  return `<a href="mailto:${config.feedbackEmail}">${label}</a>`
}
