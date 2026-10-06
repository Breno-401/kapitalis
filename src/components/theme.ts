export type SiteTheme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'kapitalis-theme'

export function getInitialTheme(): SiteTheme {
  let savedTheme: string | null = null

  try {
    savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return 'light'
}
