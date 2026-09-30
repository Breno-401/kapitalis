import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import styles from './WhatsAppFloating.module.css'

export function WhatsAppFloating() {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(
    () => document.documentElement.dataset.mobileMenuOpen === 'true',
  )
  const [isInFooter, setIsInFooter] = useState(false)
  const [isOverlappingAction, setIsOverlappingAction] = useState(false)
  const isHidden = isMobileMenuOpen || isInFooter || isOverlappingAction

  useEffect(() => {
    function handleMenuState(event: Event) {
      setIsMobileMenuOpen((event as CustomEvent<boolean>).detail)
    }

    window.addEventListener('kapitalis:mobile-menu-state', handleMenuState)
    return () =>
      window.removeEventListener('kapitalis:mobile-menu-state', handleMenuState)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const footer = document.getElementById('contato')
    if (!footer) return

    const observer = new IntersectionObserver(
      (entries) => setIsInFooter(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.01 },
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frame = 0

    function updateOverlap() {
      frame = 0
      const floatingRect = buttonRef.current?.getBoundingClientRect()
      if (!floatingRect) return

      const overlapsAction = Array.from(
        document.querySelectorAll<HTMLElement>(
          'h1, h2, h3, p, li, a[href], button, input, select, textarea, [data-review-card], [data-tool-card], [data-whatsapp-avoid]',
        ),
      ).some((element) => {
        if (element === buttonRef.current) return false
        const rect = element.getBoundingClientRect()
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          floatingRect.right > rect.left &&
          floatingRect.left < rect.right &&
          floatingRect.bottom > rect.top &&
          floatingRect.top < rect.bottom
        )
      })
      setIsOverlappingAction((current) =>
        current === overlapsAction ? current : overlapsAction,
      )
    }

    function scheduleOverlapCheck() {
      if (frame) return
      frame = window.requestAnimationFrame(updateOverlap)
    }

    scheduleOverlapCheck()
    window.addEventListener('scroll', scheduleOverlapCheck, { passive: true })
    window.addEventListener('resize', scheduleOverlapCheck)
    return () => {
      window.removeEventListener('scroll', scheduleOverlapCheck)
      window.removeEventListener('resize', scheduleOverlapCheck)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <a
      ref={buttonRef}
      className={styles.button}
      href={site.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Kapitalis pelo WhatsApp (abre em nova aba)"
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : 0}
      data-hidden={isHidden}
      data-whatsapp-floating
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
        <path
          fill="currentColor"
          d="M16 3.1A12.7 12.7 0 0 0 5.1 22.3L3.4 28.5l6.4-1.7A12.7 12.7 0 1 0 16 3.1Zm0 23.1c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.8 1 1-3.7-.2-.4A10.5 10.5 0 1 1 16 26.2Zm5.8-7.9c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-2.5-1.6 9.3 9.3 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6l-.9-2.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.3a11 11 0 0 0 4.2 3.7c.6.3 1.1.5 1.4.6.6.2 1.2.2 1.6.1.5-.1 1.8-.7 2-1.4s.3-1.3.2-1.4-.3-.3-.6-.4Z"
        />
      </svg>
    </a>
  )
}
