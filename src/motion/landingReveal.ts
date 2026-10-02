/** One observer for the landing. Default markup is visible; only successful
 * setup arms the entrances. Called in a layout effect, before the first paint. */
export function initLandingReveal(root: ParentNode): () => void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  if (reducedMotion?.matches || typeof IntersectionObserver !== 'function') return () => {}

  const pending = new Map<Element, HTMLElement[]>()
  let observer: IntersectionObserver | undefined

  function reveal(target: Element, immediate = false) {
    const members = pending.get(target)
    if (!members) return
    members.forEach(element => { element.dataset.revealState = immediate ? 'complete' : 'visible' })
    pending.delete(target)
    observer?.unobserve(target)
    if (!pending.size) observer?.disconnect()
  }

  function finishAnimation(event: Event) {
    const element = event.target
    if (!(element instanceof HTMLElement) || element.dataset.revealState !== 'visible') return
    // Ignore bubbling animation events from diagrams or the carousel.
    if ((event as AnimationEvent).animationName !== 'landing-enter') return
    element.dataset.revealState = 'complete'
  }

  function showAll() {
    if (!reducedMotion?.matches) return
    observer?.disconnect()
    pending.clear()
    elements.forEach(element => { element.dataset.revealState = 'complete' })
  }

  function onFocus(event: Event) {
    if (!(event.target instanceof Element)) return
    for (const target of pending.keys()) {
      if (target.contains(event.target)) reveal(target, true)
    }
  }

  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target) })
    }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' })

    elements.forEach(element => {
      if (element.hasAttribute('data-reveal-initial')) {
        element.dataset.revealState = 'visible'
        return
      }
      const target = element.closest('[data-reveal-group]') ?? element
      const members = pending.get(target) ?? []
      members.push(element)
      pending.set(target, members)
      element.dataset.revealState = 'pending'
    })
    pending.forEach((_, target) => observer!.observe(target))
  } catch {
    observer?.disconnect()
    elements.forEach(element => { delete element.dataset.revealState })
    return () => {}
  }

  root.addEventListener('animationend', finishAnimation)
  root.addEventListener('focusin', onFocus)
  reducedMotion?.addEventListener?.('change', showAll)

  return () => {
    observer?.disconnect()
    pending.clear()
    root.removeEventListener('animationend', finishAnimation)
    root.removeEventListener('focusin', onFocus)
    reducedMotion?.removeEventListener?.('change', showAll)
    elements.forEach(element => { delete element.dataset.revealState })
  }
}
