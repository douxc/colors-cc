import { Hono } from 'hono'
import { PUBLIC_COLOR_API_CONTRACT } from './contracts/colors-api'
import { localizeHomeHtml, localizeImageHtml } from './i18n'
import llmsRoute, { llmsContent } from './routes/docs/llms'
import openapiRoute from './routes/docs/openapi'
import skillsRoute from './routes/docs/skills'
import { createToolsRoute } from './routes/pages/tools'
import { createRobotsRoute } from './routes/seo/robots'
import { createSitemapRoute } from './routes/seo/sitemap'
import {
  htmlLang,
  localePrefix,
  localizedUrl,
  renderAlternateLinks,
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
  const canonicalUrl = localizedUrl(config.origin, locale, path)
  const canonical = `<link rel="canonical" href="${canonicalUrl}">\n  ${renderAlternateLinks(path)}`
  return prefixInternalLinks(html, locale)
    .replace(/<html lang="[^"]+">/, `<html lang="${htmlLang(locale)}">`)
    .replace(/<link rel="canonical" href="[^"]+"\s*\/?>/, canonical)
    .replace(/<meta property="og:url" content="[^"]+"\s*\/?>/, `<meta property="og:url" content="${canonicalUrl}">`)
    .replace('"url": "https://colors-cc.top/"', `"url": "${canonicalUrl}"`)
    .replace('__NAV_UTILITY_CONTROLS__', renderNavUtilityControlItems(locale, path))
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
  templates: HtmlTemplates
): App => {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>()
  const homePage = renderHome(templates.home, config, locale)
  const imageCompressPage = renderImageCompress(templates.imageCompress, config, locale)

  app.get('/', (c) => c.html(homePage))

  // Register the exact image tool before the dynamic conversion route.
  app.get('/tools/image-compress', (c) => c.html(imageCompressPage))
  app.route('/tools', createToolsRoute(config, locale))

  return app
}

export const createApp = (config: SiteConfig, templates: HtmlTemplates): App => {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>()

  app.route('/', llmsRoute)
  app.route('/', openapiRoute)
  app.route('/', skillsRoute)
  app.route('/', createRobotsRoute(config))
  app.route('/', createSitemapRoute(config))

  app.route('/en', createLocalizedPages(config, 'en', templates))
  app.route('/zh', createLocalizedPages(config, 'zh', templates))

  // Preserve existing unprefixed URLs using the deployment's default language.
  app.route('/', createLocalizedPages(config, config.defaultLocale, templates))

  app.notFound((c) => {
    c.status(404)
    c.header('Content-Type', 'text/plain; charset=utf-8')
    c.header('Cache-Control', 'public, max-age=3600')
    return c.body(llmsContent)
  })

  return app
}
