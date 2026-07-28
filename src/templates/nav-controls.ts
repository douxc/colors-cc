import { commonMessages } from '../i18n'
import { localizedPath, type Locale, type SiteConfig } from '../site'

const escapeAttribute = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const sunIcon = `
  <svg
    class="theme-option-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="3.5"></circle>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
    <path d="M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42"></path>
    <path d="M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path>
  </svg>
`

const moonIcon = `
  <svg
    class="theme-option-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z"></path>
  </svg>
`

const systemIcon = `
  <svg
    class="theme-option-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="3" y="4" width="18" height="13" rx="2.5"></rect>
    <path d="M8 21h8M12 17v4"></path>
  </svg>
`

const languageOption = (
  optionLocale: Locale,
  currentLocale: Locale,
  path: string,
  label: string,
  shortLabel: string
): string => `
  <a
    class="nav-switch-option language-option"
    href="${localizedPath(optionLocale, path)}"
    lang="${optionLocale === 'zh' ? 'zh-CN' : 'en'}"
    aria-label="${escapeAttribute(label)}"
    ${optionLocale === currentLocale ? 'aria-current="page"' : ''}
  >${shortLabel}</a>
`

const themeOption = (
  value: 'light' | 'dark' | 'system',
  label: string,
  content: string
): string => `
  <button
    class="nav-switch-option theme-option theme-option-${value}"
    type="button"
    data-theme-option="${value}"
    aria-label="${escapeAttribute(label)}"
    aria-pressed="false"
    title="${escapeAttribute(label)}"
  >${content}</button>
`

export const renderNavUtilityControlItems = (
  config: SiteConfig,
  locale: Locale,
  path: string
): string => {
  const messages = commonMessages[locale]
  const languageControl = config.enabledLocales.length > 1
    ? `<div class="nav-preference-control language-control">
      <div class="nav-segmented" role="group" aria-label="${escapeAttribute(messages.languageControlLabel)}">
        ${languageOption('zh', locale, path, messages.simplifiedChineseLabel, '简')}
        ${languageOption('en', locale, path, messages.englishLabel, 'EN')}
      </div>
    </div>`
    : ''

  return `
    ${languageControl}
    <div class="nav-preference-control theme-control">
      <div class="nav-segmented" role="group" aria-label="${escapeAttribute(messages.themeControlLabel)}">
        ${themeOption('light', messages.lightThemeLabel, sunIcon)}
        ${themeOption('dark', messages.darkThemeLabel, moonIcon)}
        ${themeOption('system', messages.systemThemeLabel, systemIcon)}
      </div>
    </div>
  `
}
