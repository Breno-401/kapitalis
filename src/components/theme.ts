export type SiteTheme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'kapitalis-theme'

export function getInitialTheme(): SiteTheme {
  let savedTheme: string | null = null
  let prefersLight = false

  try {
    savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  try {
    prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches ?? false
  } catch {
    // The dark palette remains the fallback when media queries are unavailable.
  }

  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return prefersLight ? 'light' : 'dark'
}
