// Shared markup helper for asserting on the language control in rendered pages.
// Lives outside the test files so both the site-wide and chrome-level suites can
// use it without one test file importing another.
export const languageControlBlock = (html: string): string => {
  const start = html.indexOf('<div class="nav-preference-control language-control">')
  if (start < 0) return ''
  const end = html.indexOf('theme-control', start)
  return html.slice(start, end < 0 ? undefined : end)
}
