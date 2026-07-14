export const themeInitScript = `
  (() => {
    const root = document.documentElement
    let theme = 'system'
    try {
      const storedTheme = localStorage.getItem('colors-cc-theme')
      if (storedTheme === 'light' || storedTheme === 'dark') {
        theme = storedTheme
      }
    } catch {}

    if (theme === 'system') {
      delete root.dataset.theme
      root.style.colorScheme = 'light dark'
    } else {
      root.dataset.theme = theme
      root.style.colorScheme = theme
    }

    root.dataset.themePreference = theme
    root.dataset.effectiveTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
  })()
`

export const themeControlScript = `
  (() => {
    const storageKey = 'colors-cc-theme'
    const themeColor = document.querySelector('meta[name="theme-color"]')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

    function storedTheme() {
      try {
        const value = localStorage.getItem(storageKey)
        return value === 'light' || value === 'dark' ? value : 'system'
      } catch {
        return 'system'
      }
    }

    function updateThemeColor(theme) {
      const effectiveTheme = resolveTheme(theme)
      if (themeColor) themeColor.setAttribute('content', effectiveTheme === 'dark' ? '#07080c' : '#f7f9fc')
    }

    function resolveTheme(theme) {
      return theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme
    }

    function updateThemeOptions(theme) {
      const effectiveTheme = resolveTheme(theme)
      document.documentElement.dataset.themePreference = theme
      document.documentElement.dataset.effectiveTheme = effectiveTheme

      document.querySelectorAll('[data-theme-option]').forEach((option) => {
        option.setAttribute('aria-pressed', String(option.dataset.themeOption === theme))
      })
    }

    function applyTheme(theme, persist) {
      if (theme === 'system') {
        delete document.documentElement.dataset.theme
        document.documentElement.style.colorScheme = 'light dark'
      } else {
        document.documentElement.dataset.theme = theme
        document.documentElement.style.colorScheme = theme
      }

      if (persist) {
        try {
          if (theme === 'system') localStorage.removeItem(storageKey)
          else localStorage.setItem(storageKey, theme)
        } catch {}
      }

      updateThemeOptions(theme)
      updateThemeColor(theme)
    }

    const initialTheme = storedTheme()
    applyTheme(initialTheme, false)

    document.querySelectorAll('[data-theme-option]').forEach((option) => {
      option.addEventListener('click', () => {
        const theme = option.dataset.themeOption
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
          applyTheme(theme, true)
        }
      })
    })

    systemTheme.addEventListener?.('change', () => {
      if (storedTheme() === 'system') applyTheme('system', false)
    })
  })()
`
