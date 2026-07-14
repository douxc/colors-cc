import type { SiteConfig } from './site'

export type SearchVerificationBindings = {
  SEO_GOOGLE_SITE_VERIFICATION?: string
  SEO_BAIDU_SITE_VERIFICATION?: string
  SEO_360_SITE_VERIFICATION?: string
  SEO_BYTEDANCE_VERIFICATION_CODE?: string
  SEO_EXTRA_VERIFICATION_META?: string
}

const META_NAME_PATTERN = /^[A-Za-z0-9_.:-]+$/

const nonEmpty = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed || undefined
}

const parseExtraMeta = (value: string | undefined): Record<string, string> => {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([name, content]) =>
          META_NAME_PATTERN.test(name) && typeof content === 'string' && content.trim())
        .map(([name, content]) => [name, (content as string).trim()])
    )
  } catch {
    return {}
  }
}

export const verificationMetaFromBindings = (
  bindings?: SearchVerificationBindings | null
): Readonly<Record<string, string>> => {
  const meta = parseExtraMeta(bindings?.SEO_EXTRA_VERIFICATION_META)
  const google = nonEmpty(bindings?.SEO_GOOGLE_SITE_VERIFICATION)
  const baidu = nonEmpty(bindings?.SEO_BAIDU_SITE_VERIFICATION)
  const qihoo360 = nonEmpty(bindings?.SEO_360_SITE_VERIFICATION)
  const bytedance = nonEmpty(bindings?.SEO_BYTEDANCE_VERIFICATION_CODE)

  if (google) meta['google-site-verification'] = google
  if (baidu) meta['baidu-site-verification'] = baidu
  if (qihoo360) meta['360-site-verification'] = qihoo360
  if (bytedance) meta['bytedance-verification-code'] = bytedance

  return meta
}

export const withSearchVerification = (
  config: SiteConfig,
  bindings?: SearchVerificationBindings | null
): SiteConfig => {
  const verificationMeta = {
    ...(config.verificationMeta ?? {}),
    ...verificationMetaFromBindings(bindings)
  }

  if (Object.keys(verificationMeta).length === 0) return config
  return { ...config, verificationMeta }
}
