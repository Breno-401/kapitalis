export type ConsentChoice = 'granted' | 'denied'

export const TRACKING_CONSENT_STORAGE_KEY = 'kapitalis-tracking-consent'

type ConsentValues = {
  ad_storage: ConsentChoice
  analytics_storage: ConsentChoice
  ad_user_data: ConsentChoice
  ad_personalization: ConsentChoice
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const consentValues: Record<ConsentChoice, ConsentValues> = {
  granted: {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  },
  denied: {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  },
}

export function getStoredConsentChoice(): ConsentChoice | null {
  try {
    const choice = window.localStorage.getItem(TRACKING_CONSENT_STORAGE_KEY)
    return choice === 'granted' || choice === 'denied' ? choice : null
  } catch {
    return null
  }
}

export function updateConsentChoice(choice: ConsentChoice) {
  window.gtag?.('consent', 'update', consentValues[choice])

  try {
    window.localStorage.setItem(TRACKING_CONSENT_STORAGE_KEY, choice)
  } catch {
    // The current page still follows the choice when storage is unavailable.
  }
}
