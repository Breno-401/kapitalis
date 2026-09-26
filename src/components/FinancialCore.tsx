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

const insights = [
  {
    label: 'Fluxo de caixa',
    text: 'FLUXO DE CAIXA',
    order: 0,
    point: { x: 320, y: 157 },
    path: 'M 320 269 L 320 163',
    labelPosition: { x: 320, y: 198 },
    textAnchor: 'middle',
  },
  {
    label: 'Compromissos',
    text: 'COMPROMISSOS',
    order: 1,
    point: { x: 483, y: 320 },
    path: 'M 371 320 L 477 320',
    labelPosition: { x: 501, y: 354 },
    textAnchor: 'start',
  },
  {
    label: 'Previsibilidade',
    text: 'PREVISIBILIDADE',
    order: 2,
    point: { x: 157, y: 320 },
    path: 'M 269 320 L 163 320',
    labelPosition: { x: 128, y: 354 },
    textAnchor: 'end',
  },
] as const

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
          className={`${styles.signalPath} ${styles.signalDecision}`}
          data-financial-signal="decision"
          d="M 210 456 L 282 456 L 300 438 L 340 438 L 358 456 L 430 456"
        />
        <path
          className={`${styles.signalPath} ${styles.signalDecisionLink}`}
          data-financial-signal="decision-link"
          data-active={state === 'decisao'}
          d="M 320 438 L 320 466"
        />
        <g className={styles.insightFlows}>
          {insights.map(({ label, order, path }) => (
            <g
              className={styles.insight}
              data-active={state === 'visibilidade'}
              data-insight-order={order}
              key={label}
            >
              <path
                className={styles.insightFlow}
                data-active={state === 'visibilidade'}
                data-insight-flow={label}
                d={path}
                pathLength="1"
              />
            </g>
          ))}
        </g>

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
            <text
              className={styles.nodeLabel}
              data-source-emphasis={state === 'visibilidade' ? 'muted' : 'primary'}
              data-source-label={label}
              textAnchor="middle"
              y="49"
            >
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
          {insights.map(({ label, order, point, text, labelPosition, textAnchor }) => (
            <g
              className={styles.insight}
              data-active={state === 'visibilidade'}
              data-insight-order={order}
              key={label}
            >
              <circle
                className={styles.visibilityPoint}
                cx={point.x}
                cy={point.y}
                data-active={state === 'visibilidade'}
                data-insight-point={label}
                r="5"
              />
              <text
                className={styles.insightLabel}
                data-financial-insight={label}
                data-insight-active={state === 'visibilidade'}
                data-insight-order={order}
                textAnchor={textAnchor}
                x={labelPosition.x}
                y={labelPosition.y}
              >
                {text}
              </text>
            </g>
          ))}
        </g>

        <g className={styles.decisionOutput} data-output="next-step" data-active={state === 'decisao'}>
          <rect x="250" y="466" width="140" height="34" rx="17" />
          <text textAnchor="middle" x="320" y="487">PRÓXIMO PASSO</text>
        </g>
      </svg>
    </figure>
  )
}
