import { globalSiteConfig, htmlLang } from '../src/site'
import { PAGE_PATHS } from '../src/routes/seo/sitemap'

const nodeProcess = (globalThis as typeof globalThis & {
  process?: { argv?: string[] }
}).process

const urlArguments = nodeProcess?.argv?.filter(argument => /^https?:\/\//.test(argument)) ?? []
const originArgument = urlArguments[0]

if (!originArgument) throw new Error('Usage: pnpm verify:seo -- <request-origin> [canonical-origin]')

const siteOrigin = new URL(originArgument).origin
const canonicalOrigin = new URL(urlArguments[1] ?? siteOrigin).origin
const enabledLocales = globalSiteConfig.enabledLocales

function requireCondition (condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const fetchText = async (
  path: string,
  expectedContentTypes: string | readonly string[],
  userAgent = 'colors-cc-seo-verifier/1.0'
): Promise<string> => {
  const url = `${siteOrigin}${path}`
  const response = await fetch(url, {
    redirect: 'manual',
    headers: { 'User-Agent': userAgent }
  })

  requireCondition(response.status === 200, `${url} returned ${response.status}; expected 200`)
  const contentType = response.headers.get('content-type') ?? ''
  const acceptedTypes = typeof expectedContentTypes === 'string'
    ? [expectedContentTypes]
    : expectedContentTypes
  requireCondition(
    acceptedTypes.some(type => contentType.toLowerCase().includes(type)),
    `${url} returned Content-Type ${contentType || '(missing)'}; expected ${acceptedTypes.join(' or ')}`
  )

  return response.text()
}

const requireIncludes = (content: string, expected: string, source: string): void => {
  requireCondition(content.includes(expected), `${source} is missing: ${expected}`)
}

const verifyRobots = async (): Promise<void> => {
  const robots = await fetchText('/robots.txt', 'text/plain')
  const source = `${siteOrigin}/robots.txt`

  for (const crawler of ['Googlebot', 'Baiduspider', '360Spider', 'Bytespider']) {
    requireIncludes(robots, `User-agent: ${crawler}\nAllow: /`, source)
    requireCondition(
      !robots.includes(`User-agent: ${crawler}\nDisallow: /`),
      `${source} blocks ${crawler}; disable the conflicting edge-managed robots rule`
    )
  }

  requireIncludes(robots, `Sitemap: ${canonicalOrigin}/sitemap.xml`, source)
  requireIncludes(robots, `Sitemap: ${canonicalOrigin}/sitemap.txt`, source)
}

const verifySitemaps = async (): Promise<void> => {
  const [xml, text] = await Promise.all([
    fetchText('/sitemap.xml', ['application/xml', 'text/xml']),
    fetchText('/sitemap.txt', 'text/plain')
  ])
  const xmlLocations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
  const textLocations = text.split(/\r?\n/).filter(Boolean)

  const expectedUrlCount = enabledLocales.length * PAGE_PATHS.length
  requireCondition(
    xmlLocations.length === expectedUrlCount,
    `XML sitemap has ${xmlLocations.length} URLs; expected ${expectedUrlCount}`
  )
  requireCondition(
    textLocations.length === expectedUrlCount,
    `Text sitemap has ${textLocations.length} URLs; expected ${expectedUrlCount}`
  )
  requireIncludes(xml, '<lastmod>', `${siteOrigin}/sitemap.xml`)
  requireIncludes(xml, 'hreflang="x-default"', `${siteOrigin}/sitemap.xml`)
  requireIncludes(xml, 'hreflang="zh-CN"', `${siteOrigin}/sitemap.xml`)
  requireIncludes(xml, 'hreflang="ja"', `${siteOrigin}/sitemap.xml`)
  requireCondition(
    !xml.includes('www.colors-cc.top'),
    `${siteOrigin}/sitemap.xml still references the retired CN host`
  )
  requireCondition(
    !xml.includes('hreflang="en-CN"'),
    `${siteOrigin}/sitemap.xml references the disabled CN English locale`
  )
  requireIncludes(xml, '<mobile:mobile type="pc,mobile" />', `${siteOrigin}/sitemap.xml`)

  for (const locale of enabledLocales) {
    requireIncludes(xml, `<loc>${canonicalOrigin}/${locale}</loc>`, `${siteOrigin}/sitemap.xml`)
    requireCondition(
      textLocations.includes(`${canonicalOrigin}/${locale}`),
      `${siteOrigin}/sitemap.txt is missing ${canonicalOrigin}/${locale}`
    )
  }
}

const verifyPage = async (path: string, userAgent?: string): Promise<void> => {
  const html = await fetchText(path, 'text/html', userAgent)
  const url = `${siteOrigin}${path}`
  const canonicalUrl = `${canonicalOrigin}${path}`

  requireIncludes(html, `<link rel="canonical" href="${canonicalUrl}"`, url)
  requireIncludes(html, 'name="robots" content="index, follow, max-image-preview:large', url)
  requireIncludes(html, 'name="applicable-device" content="pc,mobile"', url)
  requireIncludes(html, 'hreflang="x-default" href="https://colors-cc.top/en', url)
  requireIncludes(html, 'hreflang="zh-CN" href="https://colors-cc.top/zh', url)
  requireIncludes(html, 'hreflang="ja" href="https://colors-cc.top/ja', url)
  requireCondition(
    !html.includes('www.colors-cc.top'),
    `${url} still references the retired CN host`
  )
  const locale = enabledLocales.find(locale => path === `/${locale}` || path.startsWith(`/${locale}/`))
  if (locale) requireIncludes(html, `<html lang="${htmlLang(locale)}">`, url)
  requireCondition(!html.includes('hreflang="en-CN"'), `${url} references the disabled CN English locale`)
  requireIncludes(html, '<script type="application/ld+json">', url)
}

const verifyCrawlerAccess = async (): Promise<void> => {
  for (const crawler of ['Googlebot', 'Baiduspider/2.0', '360Spider', 'Bytespider']) {
    await verifyPage('/zh', crawler)
  }
}

const verifyAssets = async (): Promise<void> => {
  await Promise.all([
    fetchText('/favicon.svg', 'image/svg+xml'),
    fetchText('/site.webmanifest', 'application/manifest+json')
  ])
}

const OFFLINE_IMAGE_COMPRESS = 'https://offline-tools.colors-cc.top/image-compress/'

const verifyRedirect = async (path: string): Promise<void> => {
  const url = `${siteOrigin}${path}`
  const response = await fetch(url, { redirect: 'manual' })

  requireCondition(response.status === 301, `${url} returned ${response.status}; expected 301`)
  const location = response.headers.get('location') ?? ''
  requireCondition(
    location === OFFLINE_IMAGE_COMPRESS,
    `${url} redirected to ${location || '(missing)'}; expected ${OFFLINE_IMAGE_COMPRESS}`
  )
  requireCondition(!location.includes('?'), `${url} kept a query in its redirect: ${location}`)
}

const verifyMigratedToolRedirects = async (): Promise<void> => {
  const paths = ['/tools/image-compress', ...enabledLocales.map(locale => `/${locale}/tools/image-compress`)]
  await Promise.all(paths.map(verifyRedirect))
}

const main = async (): Promise<void> => {
  const pageChecks = enabledLocales.flatMap(locale => PAGE_PATHS.map(path =>
    verifyPage(`/${locale}${path === '/' ? '' : path}`)))
  const results = await Promise.allSettled([
    verifyRobots(),
    verifySitemaps(),
    ...pageChecks,
    verifyCrawlerAccess(),
    verifyMigratedToolRedirects(),
    verifyAssets()
  ])
  const failures = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(result => result.reason instanceof Error ? result.reason.message : String(result.reason))

  if (failures.length > 0) {
    throw new Error(`${failures.length} SEO checks failed for ${siteOrigin}:\n- ${failures.join('\n- ')}`)
  }

  console.log(`SEO verification passed for ${siteOrigin} (global Worker)`)
}

void main()
