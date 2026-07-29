import { commonMessages } from '../i18n'
import {
  localePrefix,
  renderComplianceFooter,
  renderFeedbackLink,
  type Locale,
  type SiteConfig
} from '../site'
import { renderNavUtilityControlItems } from './nav-controls'

type SiteSection = 'generate' | 'prepare' | 'developers'

const currentSection = (path: string): SiteSection =>
  path === '/tools/image-compress' ? 'prepare' : 'generate'

const currentAttribute = (
  section: SiteSection,
  current: SiteSection
): string => section === current ? ' aria-current="page"' : ''

export const renderSiteNav = (
  config: SiteConfig,
  locale: Locale,
  path: string
): string => {
  const messages = commonMessages[locale]
  const prefix = localePrefix(locale)
  const section = currentSection(path)

  return `
    <header class="site-nav" data-site-chrome="navigation">
      <a href="${prefix}" class="brand" aria-label="${messages.homeLabel}">
        <span class="brand-mark" data-brand-mark="canvas-pair" aria-hidden="true">
          <span class="brand-mark-generate"></span>
          <span class="brand-mark-prepare"></span>
        </span>
        <span>colors-cc</span>
      </a>
      <details class="nav-menu" open>
        <summary
          class="nav-menu-toggle"
          aria-label="${messages.openNavigationMenu}"
          data-label-open="${messages.openNavigationMenu}"
          data-label-close="${messages.closeNavigationMenu}"
        >
          <span class="nav-menu-icon" aria-hidden="true"></span>
          <span class="sr-only">${messages.menu}</span>
        </summary>
        <div class="nav-menu-panel">
          <nav class="nav-links" aria-label="${messages.primaryNavigation}">
            <a class="nav-link" href="${prefix}#create"${currentAttribute('generate', section)}>${messages.generate}</a>
            <a class="nav-link" href="${prefix}/tools/image-compress"${currentAttribute('prepare', section)}>${messages.prepare}</a>
            <a class="nav-link" href="${prefix}#for-ai">${messages.developers}</a>
          </nav>
          <div class="nav-actions">
            <div class="nav-preferences" aria-label="${messages.preferences}">
              <div class="nav-utility-group">
                ${renderNavUtilityControlItems(config, locale, path)}
              </div>
            </div>
            <a class="button button-quiet button-small" href="/llms.txt">llms.txt</a>
          </div>
        </div>
      </details>
    </header>
  `
}

export const siteNavScript = `
  ;(() => {
    const compactNavigation = window.matchMedia('(max-width: 760px)')
    const menus = [...document.querySelectorAll('.nav-menu')]

    function updateMenuLabel(menu) {
      const toggle = menu.querySelector('.nav-menu-toggle')
      if (!toggle) return
      toggle.setAttribute(
        'aria-label',
        menu.open ? toggle.dataset.labelClose : toggle.dataset.labelOpen
      )
    }

    function applyNavigationMode(isCompact) {
      menus.forEach((menu) => {
        menu.open = !isCompact
        updateMenuLabel(menu)
      })
    }

    menus.forEach((menu) => {
      menu.addEventListener('toggle', () => updateMenuLabel(menu))
    })
    applyNavigationMode(compactNavigation.matches)
    compactNavigation.addEventListener?.('change', (event) => {
      applyNavigationMode(event.matches)
    })
  })()
`

export const renderSiteFooter = (
  config: SiteConfig,
  locale: Locale
): string => {
  const messages = commonMessages[locale]

  return `
    <footer class="site-footer" data-site-chrome="footer">
      <div class="site-footer-main">
        <span>${messages.footerTagline}</span>
        <nav class="footer-links" aria-label="${messages.footerNavigation}">
          <a href="https://github.com/douxc/colors-cc" target="_blank" rel="noopener">GitHub</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="/openapi.json">OpenAPI</a>
          <a href="/skills/colors-cc.md">${messages.agentSkill}</a>
          <a href="https://github.com/douxc/colors-cc/blob/main/LICENSE">GPL-3.0-or-later</a>
          <a href="https://github.com/douxc/colors-cc/blob/main/THIRD_PARTY_NOTICES.md">Third-party notices</a>
          ${renderFeedbackLink(config, locale)}
        </nav>
      </div>
      ${renderComplianceFooter(config)}
    </footer>
  `
}
