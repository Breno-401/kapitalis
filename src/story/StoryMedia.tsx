import styles from './StorySection.module.css'
import type { StoryMedia as StoryMediaData } from './types'

type StoryMediaProps = {
  media: StoryMediaData
  revealed?: boolean
}

const sceneNames = {
  sources: 'Fontes financeiras',
  organized: 'Rotinas organizadas',
  information: 'Informação do período',
  decision: 'Decisão informada',
} as const

export function StoryMedia({ media, revealed = true }: StoryMediaProps) {
  if (media.kind === 'image') {
    return (
      <figure
        className={styles.mediaFrame}
        data-story-media
        data-reveal="image"
        data-reveal-step="2"
        data-revealed={revealed}
        data-fit={media.fit ?? 'cover'}
      >
        <picture className={styles.mediaPicture}>
          <img
            className={styles.mediaImage}
            src={media.src}
            alt={media.alt}
            loading="lazy"
            decoding="async"
            width="960"
            height="600"
            style={
              media.objectPosition
                ? { objectPosition: media.objectPosition }
                : undefined
            }
          />
        </picture>
        {media.caption ? (
          <figcaption className={styles.mediaCaption}>{media.caption}</figcaption>
        ) : null}
      </figure>
    )
  }

  return (
    <div
      className={styles.diagram}
      data-reveal="media"
      data-reveal-step="2"
      data-scene={media.scene}
      role="img"
      aria-label={sceneNames[media.scene]}
    >
      {media.scene === 'sources' ? <SourcesScene /> : null}
      {media.scene === 'organized' ? <OrganizedScene /> : null}
      {media.scene === 'information' ? <InformationScene /> : null}
      {media.scene === 'decision' ? <DecisionScene /> : null}
    </div>
  )
}

function SourcesScene() {
  return (
    <div className={styles.sceneCanvas} aria-hidden="true">
      <p className={styles.sceneLabel}>Fontes que se encontram</p>
      <svg className={styles.connections} viewBox="0 0 400 340" fill="none">
        <path d="M92 76 180 150M306 76l-86 74M96 260l84-87m122 87-90-87" />
        <circle cx="200" cy="165" r="56" />
      </svg>
      <span className={`${styles.sourceNode} ${styles.sourceBank}`}>BANCO</span>
      <span className={`${styles.sourceNode} ${styles.sourceSales}`}>VENDAS</span>
      <span className={`${styles.sourceNode} ${styles.sourcePayables}`}>PAGAMENTOS</span>
      <span className={`${styles.sourceNode} ${styles.sourceReceivables}`}>RECEBIMENTOS</span>
      <span className={styles.sourceCenter}>Kapitalis</span>
      <p className={styles.sceneCaption}>Uma visão que começa na rotina.</p>
    </div>
  )
}

function OrganizedScene() {
  return (
    <div className={styles.sceneCanvas} aria-hidden="true">
      <p className={styles.sceneLabel}>Rotinas em acompanhamento</p>
      <div className={styles.workflow}>
        {[
          ['01', 'Pagar', 'Vencimentos organizados'],
          ['02', 'Receber', 'Entradas acompanhadas'],
          ['03', 'Conciliar', 'Movimentos conferidos'],
        ].map(([number, title, note]) => (
          <div className={styles.workflowRow} key={number}>
            <span className={styles.workflowNumber}>{number}</span>
            <span className={styles.workflowText}>
              <strong>{title}</strong>
              <small>{note}</small>
            </span>
            <span className={styles.workflowMark} />
          </div>
        ))}
      </div>
      <p className={styles.sceneCaption}>Cada rotina encontra seu lugar.</p>
    </div>
  )
}

function InformationScene() {
  return (
    <div className={styles.sceneCanvas} aria-hidden="true">
      <p className={styles.sceneLabel}>Leitura do período</p>
      <div className={styles.informationSheet}>
        <div className={styles.informationHeader}>
          <span>VISÃO FINANCEIRA</span>
          <span>PERÍODO ATUAL</span>
        </div>
        <div className={styles.informationLine}>
          <span>Entradas</span>
          <i className={styles.lineLong} />
        </div>
        <div className={styles.informationLine}>
          <span>Compromissos</span>
          <i className={styles.lineMedium} />
        </div>
        <div className={styles.informationLine}>
          <span>Disponibilidade</span>
          <i className={styles.lineShort} />
        </div>
        <div className={styles.periodRule} />
        <div className={styles.periodTrack}>
          <span>INÍCIO</span>
          <i />
          <span>ACOMPANHAMENTO</span>
          <i />
          <span>FECHAMENTO</span>
        </div>
      </div>
      <p className={styles.sceneCaption}>Informação útil para acompanhar o mês.</p>
    </div>
  )
}

function DecisionScene() {
  return (
    <div className={styles.sceneCanvas} aria-hidden="true">
      <p className={styles.sceneLabel}>Da informação ao próximo passo</p>
      <div className={styles.decisionFlow}>
        <div className={styles.decisionNode}>
          <span>INFORMAÇÃO</span>
          <strong>Organizada</strong>
        </div>
        <svg aria-hidden="true" viewBox="0 0 56 24" fill="none">
          <path d="M2 12h48m-9-9 9 9-9 9" />
        </svg>
        <div className={styles.decisionNode}>
          <span>DECISÃO</span>
          <strong>Com contexto</strong>
        </div>
      </div>
      <ul className={styles.decisionPoints}>
        <li>Clareza</li>
        <li>Prioridade</li>
        <li>Próximo passo</li>
      </ul>
    </div>
  )
}
