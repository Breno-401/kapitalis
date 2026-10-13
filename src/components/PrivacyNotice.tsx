import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import {
  getStoredConsentChoice,
  updateConsentChoice,
  type ConsentChoice,
} from '../privacy/googleConsent'
import styles from './PrivacyNotice.module.css'

export const OPEN_PRIVACY_DETAILS_EVENT = 'kapitalis:open-privacy-details'

export function PrivacyNotice() {
  const [consentChoice, setConsentChoice] = useState<ConsentChoice | null>(getStoredConsentChoice)
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

  function chooseConsent(choice: ConsentChoice) {
    updateConsentChoice(choice)
    setConsentChoice(choice)
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
      {consentChoice === null && (
        <aside className={styles.notice} aria-label="Aviso de privacidade" data-privacy-notice>
          <div className={styles.noticeCopy}>
            <strong>Privacidade</strong>
            <p>
              Este site usa Google Tag Manager e Google Ads. Escolha se permite o uso de dados para medição e publicidade. Valores das simulações não são enviados ao dataLayer.
            </p>
          </div>
          <div className={styles.noticeActions}>
            <button className={styles.learnMore} onClick={openDetails} type="button">
              Saiba mais
            </button>
            <button onClick={() => chooseConsent('denied')} type="button">
              Rejeitar todos
            </button>
            <button className={styles.accept} onClick={() => chooseConsent('granted')} type="button">
              Aceitar todos
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
              As ferramentas servem para simulações de referência e para iniciar uma conversa com a Kapitalis. Os valores digitados são processados no navegador, não são enviados a um servidor da Kapitalis nem incluídos no dataLayer das tags.
            </p>
            <p>
              Os campos necessários só entram na URL quando você escolhe compartilhar ou copiar o link. As ferramentas não pedem nome, e-mail ou telefone.
            </p>
            <p>
              O site usa Google Tag Manager e Google Ads. O Consent Mode v2 começa com ad_storage, analytics_storage, ad_user_data e ad_personalization negados. Se você aceitar, os quatro estados serão liberados; se rejeitar, permanecerão negados. A escolha fica salva neste navegador e pode ser alterada abaixo.
            </p>
            <p>
              As tags são carregadas mesmo com os estados negados; nesse estado, podem enviar ao Google sinais de medição sem cookies, conforme o Consent Mode. A escolha controla o armazenamento e o uso de dados pelas tags.
            </p>
            <p>
              Os links de WhatsApp, Google, Instagram e Facebook só abrem quando você os aciona; o tratamento após sair do site segue as práticas de cada serviço.
            </p>
            <div className={styles.preferenceControls}>
              <strong>Preferências de rastreamento</strong>
              <p aria-live="polite">
                {consentChoice === null
                  ? 'Você ainda não escolheu.'
                  : consentChoice === 'granted'
                    ? 'Sua escolha atual: aceitou todos os estados.'
                    : 'Sua escolha atual: rejeitou todos os estados.'}
              </p>
              <div className={styles.noticeActions}>
                <button onClick={() => chooseConsent('denied')} type="button">
                  Rejeitar todos
                </button>
                <button className={styles.accept} onClick={() => chooseConsent('granted')} type="button">
                  Aceitar todos
                </button>
              </div>
            </div>
            <p>
              Para falar com a Kapitalis: <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
      </section>
    </>
  )
}
