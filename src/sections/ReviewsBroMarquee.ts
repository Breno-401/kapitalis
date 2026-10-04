import BroInfiniteMarquee from '@bro-design/bro-marquee/dist/bro-marquee.min.js?react'

/** UI/lifecycle adapter only. broMarquee owns every transform and input event. */
export function installReviewsBroMarquee(track: HTMLElement, rail: HTMLElement) {
  const list = rail.querySelector<HTMLElement>('[bro-marquee-element="list"]')!
  const originals = Array.from(list.children) as HTMLElement[]
  const instance = new BroInfiniteMarquee(track)
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  function syncMotionPreference() {
    // The upstream attribute parser treats zero as a fallback; set its parsed
    // speed configuration to zero so native drag/inertia still remain available.
    instance.c.spd = instance.c.spdM = reducedMotion?.matches ? 0 : 0.26672
  }
  syncMotionPreference()
  reducedMotion?.addEventListener?.('change', syncMotionPreference)

  // cloneNode does not carry React handlers/state. React handles clicks through
  // the track ancestor; mirror its rendered text/avatar into official copies.
  const copies = Array.from(list.children).filter(item => !originals.includes(item as HTMLElement)) as HTMLElement[]
  copies.forEach((copy, index) => {
    copy.querySelectorAll<HTMLElement>('[id]').forEach(node => {
      const originalId = node.id
      node.id = `bro-copy-${index}-${originalId}`
      copy.querySelectorAll<HTMLElement>('[aria-controls]').forEach(control => {
        if (control.getAttribute('aria-controls') === originalId) control.setAttribute('aria-controls', node.id)
      })
    })
    copy.querySelectorAll<HTMLElement>('button, a, [tabindex]').forEach(control => { control.tabIndex = -1 })
  })
  function syncCopies() {
    for (const copy of copies) {
      const original = originals.find(item => item.dataset.reviewId === copy.dataset.reviewId)!
      const sourceArticle = original.querySelector('article')!
      copy.querySelector('article')!.setAttribute('data-expanded', sourceArticle.getAttribute('data-expanded')!)
      copy.querySelector('blockquote p')!.textContent = original.querySelector('blockquote p')!.textContent
      const button = copy.querySelector('button')
      const sourceButton = original.querySelector('button')
      if (button && sourceButton) {
        button.textContent = sourceButton.textContent
        button.setAttribute('aria-expanded', sourceButton.getAttribute('aria-expanded')!)
      }
      const avatar = copy.querySelector('article > div:last-child > :first-child')!
      const sourceAvatar = original.querySelector('article > div:last-child > :first-child')!
      if (avatar.tagName !== sourceAvatar.tagName) avatar.replaceWith(sourceAvatar.cloneNode(true))
    }
  }
  const observer = new MutationObserver(syncCopies)
  originals.forEach(original => observer.observe(original, { childList: true, subtree: true, attributes: true, characterData: true }))
  syncCopies()
  return () => {
    observer.disconnect()
    reducedMotion?.removeEventListener?.('change', syncMotionPreference)
    instance.destroy()
  }
}
