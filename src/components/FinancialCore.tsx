import type { StoryChapterId } from '../story/types'
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
        <circle className={`${styles.orbit} ${styles.innerOrbit}`} cx="320" cy="320" r="174" />

        {sources.map(({ id, x, y }) => (
          <g className={styles.connection} key={id}>
            <path d={`M 320 320 L ${x} ${y}`} />
          </g>
        ))}

        <path
          className={`${styles.signalPath} ${styles.signalOrganized}`}
          d="M126 320h74l30-32h180l30 32h74"
        />
        <path
          className={`${styles.signalPath} ${styles.signalVisible}`}
          d="M174 386h68l32-35h92l32 35h68"
        />
        <path
          className={`${styles.signalPath} ${styles.signalDecision}`}
          d="M210 430h75l35-55 36 55h74"
        />

        {sources.map(({ id, label, x, y }) => (
          <g
            className={styles.node}
            data-financial-node={label}
            key={id}
            transform={`translate(${x} ${y})`}
          >
            <circle className={styles.nodeRing} r="22" />
            <circle className={styles.nodeDot} r="4" />
            <text className={styles.nodeLabel} textAnchor="middle" y="49">
              {label}
            </text>
          </g>
        ))}

        <g className={styles.center} data-financial-node="Kapitalis">
          <circle className={styles.centerHalo} cx="320" cy="320" r="82" />
          <circle className={styles.centerRing} cx="320" cy="320" r="61" />
          <circle className={styles.centerDisc} cx="320" cy="320" r="52" />
          <path className={styles.centerMark} d="M306 294v52m0-26 29-26m-29 26 30 26" />
          <text className={styles.centerLabel} textAnchor="middle" x="320" y="407">
            Kapitalis
          </text>
        </g>

        <circle className={styles.visibilityPoint} cx="320" cy="146" r="5" />
        <circle className={styles.visibilityPoint} cx="470" cy="233" r="5" />
        <circle className={styles.visibilityPoint} cx="470" cy="407" r="5" />
        <circle className={styles.visibilityPoint} cx="320" cy="494" r="5" />
        <circle className={styles.visibilityPoint} cx="170" cy="407" r="5" />
        <circle className={styles.visibilityPoint} cx="170" cy="233" r="5" />
      </svg>
    </figure>
  )
}
