import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import styles from './PrivacyNotice.module.css'

export const PRIVACY_NOTICE_STORAGE_KEY = 'kapitalis-privacy-notice-dismissed'
export const OPEN_PRIVACY_DETAILS_EVENT = 'kapitalis:open-privacy-details'

function wasNoticeDismissed() {
  try {
    return window.localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function PrivacyNotice() {
  const [dismissed, setDismissed] = useState(wasNoticeDismissed)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  function openDetails() {
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    setDetailsOpen(true)
  }

  function closeDetails() {
    setDetailsOpen(false)
    window.setTimeout(() => returnFocusRef.current?.focus(), 0)
  }

  function dismissNotice() {
    setDismissed(true)
    try {
      window.localStorage.setItem(PRIVACY_NOTICE_STORAGE_KEY, 'true')
    } catch {
      // The notice can still be dismissed for the current page when storage is unavailable.
    }
  }

  useEffect(() => {
    function handleOpen() {
      openDetails()
    }
    window.addEventListener(OPEN_PRIVACY_DETAILS_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_PRIVACY_DETAILS_EVENT, handleOpen)
  }, [])

  useEffect(() => {
    if (!detailsOpen) return
    closeButtonRef.current?.focus()
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDetails()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [detailsOpen])

  return (
    <>
      {!dismissed && (
        <aside className={styles.notice} aria-label="Aviso de privacidade" data-privacy-notice>
          <div className={styles.noticeCopy}>
            <strong>Privacidade</strong>
            <p>
              Os dados informados nas simulações são processados no seu navegador e só entram na URL se você escolher compartilhar.
            </p>
          </div>
          <div className={styles.noticeActions}>
            <button className={styles.learnMore} onClick={openDetails} type="button">
              Saiba mais
            </button>
            <button className={styles.dismiss} onClick={dismissNotice} type="button">
              Entendi
            </button>
          </div>
        </aside>
      )}

      <section
          aria-labelledby="privacy-details-title"
          aria-modal="false"
          className={styles.details}
          data-privacy-details
          hidden={!detailsOpen}
          id="privacidade"
          role="dialog"
          tabIndex={-1}
        >
          <div className={styles.detailsHeading}>
            <h2 id="privacy-details-title">Privacidade e uso de dados</h2>
            <button
              aria-label="Fechar detalhes de privacidade"
              className={styles.close}
              onClick={closeDetails}
              ref={closeButtonRef}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
          </div>
          <div className={styles.detailsBody}>
            <p>
              As ferramentas servem para simulações de referência e para iniciar uma conversa com a Kapitalis. Os valores digitados são processados no navegador, não são enviados a um servidor da Kapitalis e não são gravados no armazenamento local.
            </p>
            <p>
              Os campos necessários só entram na URL quando você escolhe compartilhar ou copiar o link. As ferramentas não pedem nome, e-mail ou telefone.
            </p>
            <p>
              A versão atual não usa cookies, pixels ou analytics. A preferência de tema e o fechamento deste aviso ficam no armazenamento local do navegador; esses itens não incluem valores das simulações.
            </p>
            <p>
              Os links de WhatsApp, Google, Instagram e Facebook só abrem quando você os aciona; o tratamento após sair do site segue as práticas de cada serviço.
            </p>
            <p>
              Para falar com a Kapitalis: <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
      </section>
    </>
  )
}
