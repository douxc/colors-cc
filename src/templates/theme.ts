export const themeInitScript = `
  (() => {
    try {
      const theme = localStorage.getItem('colors-cc-theme')
      if (theme === 'light' || theme === 'dark') {
        document.documentElement.dataset.theme = theme
        document.documentElement.style.colorScheme = theme
      }
    } catch {}
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
      const effectiveTheme = theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme
      if (themeColor) themeColor.setAttribute('content', effectiveTheme === 'dark' ? '#07080c' : '#f7f9fc')
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

      document.querySelectorAll('[data-theme-select]').forEach((select) => {
        select.value = theme
      })
      updateThemeColor(theme)
    }

    const initialTheme = storedTheme()
    applyTheme(initialTheme, false)

    document.querySelectorAll('[data-theme-select]').forEach((select) => {
      select.addEventListener('change', () => applyTheme(select.value, true))
    })

    systemTheme.addEventListener?.('change', () => {
      if (storedTheme() === 'system') updateThemeColor('system')
    })
  })()
`
