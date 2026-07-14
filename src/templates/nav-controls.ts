import { commonMessages } from '../i18n'
import { alternateLocale, localizedPath, type Locale } from '../site'

const escapeAttribute = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const languageIcon = `
  <svg
    class="nav-control-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"></path>
  </svg>
`

const themeIcons = `
  <span class="theme-icon-stack" aria-hidden="true">
    <svg
      class="theme-icon theme-icon-sun"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3.5"></circle>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path>
      <path d="M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42"></path>
      <path d="M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path>
    </svg>
    <svg
      class="theme-icon theme-icon-moon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z"></path>
    </svg>
  </span>
`

export const renderNavUtilityControlItems = (locale: Locale, path: string): string => {
  const messages = commonMessages[locale]
  const targetLocale = alternateLocale(locale)
  const languageSwitchUrl = localizedPath(targetLocale, path)
  const languageLabel = escapeAttribute(messages.switchLanguage)
  const languageBadge = targetLocale === 'zh' ? '中' : 'EN'
  const themeToggleLabel = escapeAttribute(messages.themeToggleLabel)
  const lightThemeLabel = escapeAttribute(messages.switchToLightTheme)
  const darkThemeLabel = escapeAttribute(messages.switchToDarkTheme)

  return `
    <a
      class="nav-icon-button language-switch"
      href="${languageSwitchUrl}"
      aria-label="${languageLabel}"
      title="${languageLabel}"
    >
      ${languageIcon}
      <span class="language-badge" aria-hidden="true">${languageBadge}</span>
    </a>
    <button
      class="nav-icon-button theme-toggle"
      type="button"
      data-theme-toggle
      data-label-light="${lightThemeLabel}"
      data-label-dark="${darkThemeLabel}"
      aria-label="${themeToggleLabel}"
      aria-pressed="false"
      title="${darkThemeLabel}"
    >
      ${themeIcons}
    </button>
  `
}
