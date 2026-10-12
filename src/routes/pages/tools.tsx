import { Hono } from 'hono'
import type { Locale, SiteConfig } from '../../site'
import { createColorNamesRoute } from './color-names'
import { createConverterRoute } from './converter'
import { createFluidRoute } from './fluid'
import { createPaletteRoute } from './palette'

export const createToolsRoute = (config: SiteConfig, locale: Locale): Hono => {
  const app = new Hono()
  app.route('/', createPaletteRoute(config, locale))
  app.route('/', createColorNamesRoute(config, locale))
  app.route('/', createFluidRoute(config, locale))
  app.route('/', createConverterRoute(config, locale))
  return app
}
