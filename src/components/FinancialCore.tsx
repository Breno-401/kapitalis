import type { StoryChapterId } from '../story/types'
import { site } from '../data/site'
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
    point: { x: 320, y: 146 },
    path: 'M 320 146 A 174 174 0 0 1 494 320',
    labelPosition: { x: 320, y: 198 },
    textAnchor: 'middle',
  },
  {
    label: 'Compromissos',
    text: 'COMPROMISSOS',
    order: 1,
    point: { x: 494, y: 320 },
    path: 'M 494 320 A 174 174 0 0 1 146 320',
    labelPosition: { x: 501, y: 354 },
    textAnchor: 'start',
  },
  {
    label: 'Previsibilidade',
    text: 'PREVISIBILIDADE',
    order: 2,
    point: { x: 146, y: 320 },
    path: 'M 146 320 A 174 174 0 0 1 320 146',
    labelPosition: { x: 128, y: 354 },
    textAnchor: 'end',
  },
] as const

export function FinancialCore({
  state,
  revealed = false,
}: FinancialCoreProps) {
  return (
    <div
      className={styles.core}
      data-financial-core
      data-state={state}
      data-revealed={revealed}
    >
      <svg
        className={styles.artwork}
        aria-hidden="true"
        viewBox="0 0 640 640"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={`${styles.orbit} ${styles.outerOrbit}`}
          cx="320"
          cy="320"
          r="262"
          data-orbit-ring="outer"
          data-active={state === 'organizacao' || state === 'decisao'}
        />
        <circle
          className={`${styles.orbit} ${styles.innerOrbit}`}
          cx="320"
          cy="320"
          r="174"
          data-ring="organization"
          data-orbit-ring="organization"
          data-active={state === 'organizacao' || state === 'decisao'}
        />
        <circle
          className={`${styles.orbit} ${styles.processOrbit}`}
          cx="320"
          cy="320"
          r="120"
          data-orbit-ring="process"
          data-active={state === 'organizacao' || state === 'decisao'}
        />

        {sources.map(({ id, x, y }, order) => {
          const decisionSource = id === 'notas' || id === 'folha'
          const pulseActive = state === 'entradas' ||
            (state === 'decisao' && decisionSource)

          return (
            <g className={styles.connection} data-source-order={order} key={id}>
              <path
                d={`M ${x} ${y} L 320 320`}
                data-flow="source-to-core"
                data-source={id}
                data-direction="inward"
                data-active={state === 'entradas' || state === 'organizacao' || state === 'decisao'}
                data-decision-flow={state === 'decisao' && decisionSource}
                id={`kapitalis-source-flow-${id}`}
                pathLength="1"
              />
              {pulseActive ? (
                <circle className={styles.flowPulse} data-source-pulse={id} r="3">
                  <animateMotion
                    begin={`${order * 0.72}s`}
                    dur={state === 'decisao' ? '7s' : '9s'}
                    calcMode="linear"
                    repeatCount="indefinite"
                  >
                    <mpath href={`#kapitalis-source-flow-${id}`} />
                  </animateMotion>
                </circle>
              ) : null}
            </g>
          )
        })}

        <g className={styles.organizationFlows}>
          <path
            className={styles.organizationFlow}
            d="M 218 320 L 268 320"
            data-flow="organization"
            data-direction="inward"
            data-active={state === 'organizacao'}
            id="kapitalis-organization-flow-inward"
            pathLength="1"
          />
          <path
            className={styles.organizationFlow}
            d="M 372 320 L 422 320"
            data-flow="organization"
            data-direction="outward"
            data-active={state === 'organizacao'}
            id="kapitalis-organization-flow-outward"
            pathLength="1"
          />
          {state === 'organizacao' ? (
            <>
              <circle className={styles.flowPulse} data-organization-pulse="inward" r="2.8">
                <animateMotion dur="6s" calcMode="linear" repeatCount="indefinite">
                  <mpath href="#kapitalis-organization-flow-inward" />
                </animateMotion>
              </circle>
              <circle className={styles.flowPulse} data-organization-pulse="outward" r="2.8">
                <animateMotion begin="0.9s" dur="6s" calcMode="linear" repeatCount="indefinite">
                  <mpath href="#kapitalis-organization-flow-outward" />
                </animateMotion>
              </circle>
            </>
          ) : null}
        </g>

        <path
          className={`${styles.signalPath} ${styles.signalDecisionRoute}`}
          data-financial-signal="decision-route"
          data-active={state === 'decisao'}
          d="M 320 432 C 312 476 328 536 320 584"
          id="kapitalis-decision-route"
          pathLength="1"
        />
        {state === 'decisao' ? (
          <circle className={styles.flowPulse} data-decision-pulse r="3">
            <animateMotion dur="8s" calcMode="linear" repeatCount="indefinite">
              <mpath href="#kapitalis-decision-route" />
            </animateMotion>
          </circle>
        ) : null}
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
                data-orbit-flow="clockwise"
                d={path}
                id={`kapitalis-insight-flow-${order}`}
                pathLength="1"
              />
              {state === 'visibilidade' ? (
                <circle
                  className={styles.visibilityPulse}
                  data-insight-pulse={label}
                  r="3.2"
                >
                  <animateMotion
                    begin={`${order * 0.28}s`}
                    dur="18s"
                    calcMode="linear"
                    repeatCount="indefinite"
                  >
                    <mpath href={`#kapitalis-insight-flow-${order}`} />
                  </animateMotion>
                </circle>
              ) : null}
            </g>
          ))}
        </g>

        {sources.map(({ id, label, x, y }) => (
          <g
            className={styles.node}
            data-financial-node={label}
            data-source-active={state === 'entradas'}
            data-decision-source={state === 'decisao' && (id === 'notas' || id === 'folha')}
            data-source={id}
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

        <g className={styles.organizationNodes} aria-label="Rotinas de organização">
          <g
            className={styles.organizationNode}
            data-organization-node
            data-active={state === 'organizacao'}
            transform="translate(200 320)"
          >
            <circle className={styles.organizationNodeRing} r="16" />
            <circle className={styles.organizationNodeDot} r="3" />
            <text className={styles.organizationNodeLabel} textAnchor="middle" y="38">Conciliação</text>
          </g>
          <g
            className={styles.organizationNode}
            data-organization-node
            data-active={state === 'organizacao'}
            transform="translate(440 320)"
          >
            <circle className={styles.organizationNodeRing} r="16" />
            <circle className={styles.organizationNodeDot} r="3" />
            <text className={styles.organizationNodeLabel} textAnchor="middle" y="38">Fechamento</text>
          </g>
        </g>

        <g className={styles.center} data-financial-node="Kapitalis">
          <circle className={styles.centerHalo} cx="320" cy="320" r="82" />
          <circle className={styles.centerRing} cx="320" cy="320" r="61" />
          <circle className={styles.centerDisc} cx="320" cy="320" r="52" />
          <BrandMark
            className={styles.centerLogo}
            x="284"
            y="284"
            width="72"
            height="72"
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
          <rect x="250" y="590" width="140" height="34" rx="17" />
        </g>
      </svg>
      <a
        className={styles.nextStepLink}
        data-next-step-link
        href={site.whatsappUrl}
        rel="noopener noreferrer"
        target="_blank"
        aria-label="Próximo passo (abre em nova aba)"
        tabIndex={state === 'decisao' ? 0 : -1}
        aria-hidden={state !== 'decisao'}
      >
        Próximo passo
      </a>
    </div>
  )
}
