import { Hono } from 'hono'
import { PUBLIC_COLOR_API_CONTRACT } from './contracts/colors-api'
import { localizeHomeHtml, localizeImageHtml } from './i18n'
import llmsRoute, { llmsContent } from './routes/docs/llms'
import openapiRoute from './routes/docs/openapi'
import skillsRoute from './routes/docs/skills'
import { createToolsRoute } from './routes/pages/tools'
import { createRobotsRoute } from './routes/seo/robots'
import { createSeoAssetsRoute } from './routes/seo/assets'
import { createSitemapRoute } from './routes/seo/sitemap'
import { withSearchVerification } from './search-verification'
import { createSeoMetadata, renderSeoHead } from './seo'
import {
  htmlLang,
  localePrefix,
  renderComplianceFooter,
  type Locale,
  type SiteConfig
} from './site'
import { renderNavUtilityControlItems } from './templates/nav-controls'
import { sharedStyles } from './templates/styles'
import { themeControlScript, themeInitScript } from './templates/theme'
import type { Env, Variables } from './types'

export type HtmlTemplates = {
  home: string
  imageCompress: string
}

type App = Hono<{ Bindings: Env; Variables: Variables }>

const prefixInternalLinks = (html: string, locale: Locale): string => {
  const prefix = localePrefix(locale)
  return html
    .replaceAll('href="/tools/', `href="${prefix}/tools/`)
    .replaceAll('href="/#', `href="${prefix}#`)
    .replaceAll('href="/"', `href="${prefix}"`)
}

const decorateDocument = (
  html: string,
  config: SiteConfig,
  locale: Locale,
  path: string
): string => {
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]
  const description = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]

  if (!title || !description) {
    throw new Error(`Missing SEO title or description for ${locale}${path}`)
  }

  const seoHead = renderSeoHead(
    createSeoMetadata(config, locale, path, title, description),
    config
  )

  return prefixInternalLinks(html, locale)
    .replace(/<html lang="[^"]+">/, `<html lang="${htmlLang(locale)}">`)
    .replace(/<!--__SEO_HEAD_START__-->[\s\S]*?<!--__SEO_HEAD_END__-->/, seoHead)
    .replace('__NAV_UTILITY_CONTROLS__', renderNavUtilityControlItems(config, locale, path))
    .replace('__COMPLIANCE_FOOTER__', renderComplianceFooter(config))
}

const renderHome = (
  template: string,
  config: SiteConfig,
  locale: Locale
): string => {
  const contract = { ...PUBLIC_COLOR_API_CONTRACT, baseUrl: config.apiBaseUrl }
  const html = template
    .replace('__THEME_INIT_SCRIPT__', themeInitScript)
    .replace('__THEME_CONTROL_SCRIPT__', themeControlScript)
    .replace('/*__SHARED_STYLES__*/', sharedStyles)
    .replace('__COLOR_API_CONTRACT__', JSON.stringify(contract).replace(/</g, '\\u003c'))
  return decorateDocument(localizeHomeHtml(html, locale), config, locale, '/')
}

const renderImageCompress = (
  template: string,
  config: SiteConfig,
  locale: Locale
): string => {
  const html = template
    .replace('__THEME_INIT_SCRIPT__', themeInitScript)
    .replace('__THEME_CONTROL_SCRIPT__', themeControlScript)
    .replace('/*__SHARED_STYLES__*/', sharedStyles)
  return decorateDocument(localizeImageHtml(html, locale), config, locale, '/tools/image-compress')
}

const createLocalizedPages = (
  config: SiteConfig,
  locale: Locale,
  templates: HtmlTemplates,
  includeTools = true
): App => {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>()

  app.get('/', (c) => {
    const runtimeConfig = withSearchVerification(config, c.env)
    return c.html(renderHome(templates.home, runtimeConfig, locale))
  })

  if (includeTools) {
    const imageCompressPage = renderImageCompress(templates.imageCompress, config, locale)
    // Register the exact image tool before the dynamic conversion route.
    app.get('/tools/image-compress', (c) => c.html(imageCompressPage))
    app.route('/tools', createToolsRoute(config, locale))
  }

  return app
}

export const createApp = (config: SiteConfig, templates: HtmlTemplates): App => {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>()

  app.route('/', llmsRoute)
  app.route('/', openapiRoute)
  app.route('/', skillsRoute)
  app.route('/', createRobotsRoute(config))
  app.route('/', createSitemapRoute(config))
  app.route('/', createSeoAssetsRoute(config))

  for (const locale of config.enabledLocales) {
    app.route(localePrefix(locale), createLocalizedPages(config, locale, templates))
  }

  // The global edition preserves legacy unprefixed tools. The CN edition emits
  // only its root homepage plus explicit /zh routes to avoid duplicate pages.
  app.route('/', createLocalizedPages(
    config,
    config.defaultLocale,
    templates,
    config.edition === 'global'
  ))

  app.notFound((c) => {
    c.status(404)
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=3600')
    return c.body(llmsContent)
  })

  return app
}
