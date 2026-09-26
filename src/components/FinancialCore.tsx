import type { StoryChapterId } from '../story/types'
import { BrandMark } from './BrandMark'
import styles from './FinancialCore.module.css'

type FinancialCoreProps = {
  state: StoryChapterId
  revealed?: boolean
}

const sources = [
  { id: 'bancos', label: 'Bancos', x: 320, y: 74 },
  { id: 'vendas', label: 'Vendas', x: 545, y: 212 },
  { id: 'notas', label: 'Notas', x: 460, y: 474 },
  { id: 'folha', label: 'Folha', x: 180, y: 474 },
  { id: 'despesas', label: 'Despesas', x: 95, y: 212 },
]

export function FinancialCore({
  state,
  revealed = false,
}: FinancialCoreProps) {
  return (
    <figure
      aria-hidden="true"
      className={styles.core}
      data-financial-core
      data-state={state}
      data-revealed={revealed}
    >
      <svg
        className={styles.artwork}
        viewBox="0 0 640 640"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className={`${styles.orbit} ${styles.outerOrbit}`} cx="320" cy="320" r="262" />
        <circle
          className={`${styles.orbit} ${styles.innerOrbit}`}
          cx="320"
          cy="320"
          r="174"
          data-ring="organization"
          data-active={state === 'organizacao'}
        />

        {sources.map(({ id, x, y }) => (
          <g className={styles.connection} key={id}>
            <path
              d={`M ${x} ${y} L 320 320`}
              data-flow="source-to-core"
              data-active={state === 'entradas' || state === 'organizacao'}
            />
          </g>
        ))}

        <path
          className={`${styles.signalPath} ${styles.signalOrganized}`}
          data-flow="convergence"
          data-active={state === 'organizacao'}
          d="M126 320h74l30-32h180l30 32h74"
        />
        <path
          className={`${styles.signalPath} ${styles.signalVisible}`}
          d="M174 386h68l32-35h92l32 35h68"
        />
        <path
          className={`${styles.signalPath} ${styles.signalDecision}`}
          data-financial-signal="decision"
          d="M 210 456 L 282 456 L 300 438 L 340 438 L 358 456 L 430 456"
        />

        {sources.map(({ id, label, x, y }) => (
          <g
            className={styles.node}
            data-financial-node={label}
            data-source-active={state === 'entradas'}
            key={id}
            transform={`translate(${x} ${y})`}
          >
            <circle className={styles.nodeRing} r="22" />
            <circle className={styles.nodeDot} r="4" />
            <text className={styles.nodeLabel} data-source-label={label} textAnchor="middle" y="49">
              {label}
            </text>
          </g>
        ))}

        <g className={styles.center} data-financial-node="Kapitalis">
          <circle className={styles.centerHalo} cx="320" cy="320" r="82" />
          <circle className={styles.centerRing} cx="320" cy="320" r="61" />
          <circle className={styles.centerDisc} cx="320" cy="320" r="52" />
          <BrandMark
            className={styles.centerLogo}
            x="279"
            y="279"
            width="82"
            height="76"
          />
          <text className={styles.centerLabel} data-core-wordmark textAnchor="middle" x="320" y="407">
            Kapitalis
          </text>
        </g>

        <g className={styles.insights}>
          <circle className={styles.visibilityPoint} cx="320" cy="157" r="5" />
          <text className={styles.insightLabel} data-financial-insight="Fluxo de caixa" data-insight-active={state === 'visibilidade'} textAnchor="middle" x="320" y="198">
            FLUXO DE CAIXA
          </text>
          <circle className={styles.visibilityPoint} cx="483" cy="320" r="5" />
          <text className={styles.insightLabel} data-financial-insight="Compromissos" data-insight-active={state === 'visibilidade'} textAnchor="start" x="501" y="354">
            COMPROMISSOS
          </text>
          <circle className={styles.visibilityPoint} cx="320" cy="483" r="5" />
          <text className={styles.insightLabel} data-financial-insight="Indicadores" data-insight-active={state === 'visibilidade'} textAnchor="middle" x="320" y="457">
            INDICADORES
          </text>
          <circle className={styles.visibilityPoint} cx="157" cy="320" r="5" />
          <text className={styles.insightLabel} data-financial-insight="Previsibilidade" data-insight-active={state === 'visibilidade'} textAnchor="end" x="128" y="354">
            PREVISIBILIDADE
          </text>
        </g>

        <g className={styles.decisionOutput} data-output="next-step" data-active={state === 'decisao'}>
          <rect x="250" y="443" width="140" height="34" rx="17" />
          <text textAnchor="middle" x="320" y="464">PRÓXIMO PASSO</text>
        </g>
      </svg>
    </figure>
  )
}
