import { useEffect, useRef, useState } from 'react'
import styles from './ShareActions.module.css'

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      className={`${styles.action} ${styles.copyButton}`}
      type="button"
      aria-label="Copiar link"
      data-copied={copied}
      onClick={onClick}
    >
      <span data-copy-label="default">Copiar link</span>
      <span className={styles.copyCheck} aria-hidden="true">
        <svg viewBox="0 0 16 16" focusable="false"><path d="m3.25 8.25 3 3 6.5-6.5" /></svg>
      </span>
    </button>
  )
}

export function ShareActions({ url, title, text }: { url: string; title: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<number | null>(null)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    if (!shareOpen) return
    function closeOnOutside(event: PointerEvent) {
      if (!controlsRef.current?.contains(event.target as Node)) setShareOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setShareOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [shareOpen])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      setCopied(true)
      setFeedback('Link copiado')
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null
        setCopied(false)
        setFeedback('')
      }, 1800)
      setShareOpen(false)
    } catch {
      setFeedback('Não foi possível copiar o link.')
    }
  }

  async function share() {
    if (typeof navigator.share !== 'function') {
      setShareOpen((open) => !open)
      return
    }
    try {
      await navigator.share({ title, text, url })
      setShareOpen(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareOpen(true)
    }
  }

  return (
    <div className={styles.share} aria-label="Deseja compartilhar esta simulação?">
      <p>Deseja compartilhar esta simulação?</p>
      <div className={styles.controls} ref={controlsRef}>
        <button className={`${styles.action} ${styles.shareButton}`} type="button" onClick={share} aria-expanded={shareOpen}>
          Compartilhar
        </button>
        <CopyButton copied={copied} onClick={copyLink} />
        {shareOpen && (
          <div className={styles.popover} role="group" aria-label="Opções de compartilhamento">
            <a className={styles.action} href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Compartilhar no WhatsApp
            </a>
            <CopyButton copied={copied} onClick={copyLink} />
          </div>
        )}
      </div>
      <span className={styles.screenReaderOnly} aria-live="polite">{feedback}</span>
      <span className={styles.feedback} aria-hidden="true" data-visible={Boolean(feedback)}>{feedback}</span>
    </div>
  )
}
