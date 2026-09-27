import { createPortal } from 'react-dom'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import styles from './InteractiveBreakdownRing.module.css'

export type BreakdownSegment = {
  key: string
  label: string
  fullName: string
  value: number
  description: string
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })
const radius = 68
const circumference = 2 * Math.PI * radius

export function InteractiveBreakdownRing({ segments, centerLabel = 'Distribuição' }: { segments: BreakdownSegment[]; centerLabel?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [position, setPosition] = useState({ left: 8, top: 8 })
  const rootRef = useRef<HTMLDivElement>(null)
  const active = hovered ?? focused ?? selected
  const drawable = segments.filter((segment) => segment.value > 0)
  const total = drawable.reduce((sum, segment) => sum + segment.value, 0)
  const gap = drawable.length > 1 ? 6 : 0
  const available = Math.max(circumference - gap * drawable.length, 0)
  const arcs = drawable.reduce<{
    offset: number
    arcs: Array<BreakdownSegment & { length: number; offset: number }>
  }>((current, segment) => {
    const length = total ? segment.value / total * available : 0
    return {
      offset: current.offset + length + gap,
      arcs: [...current.arcs, { ...segment, length, offset: current.offset }],
    }
  }, { offset: 0, arcs: [] }).arcs

  useEffect(() => {
    if (!selected) return
    function clearOnOutsidePointer(event: globalThis.PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setSelected(null)
    }
    document.addEventListener('pointerdown', clearOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', clearOnOutsidePointer)
  }, [selected])

  function updatePosition(target: Element, clientX: number, clientY: number) {
    const bounds = target.getBoundingClientRect()
    const x = clientX || bounds.left + bounds.width / 2
    const y = clientY || bounds.top + bounds.height / 2
    setPosition({ left: Math.max(8, Math.min(x + 14, window.innerWidth - 296)), top: Math.max(8, Math.min(y + 14, window.innerHeight - 160)) })
  }

  function pointerEnter(event: PointerEvent<SVGCircleElement>, segmentKey: string) {
    setHovered(segmentKey)
    updatePosition(event.currentTarget, event.clientX, event.clientY)
  }

  function keyDown(event: KeyboardEvent<SVGCircleElement | HTMLButtonElement>, index: number) {
    if (event.key === 'Escape') { setSelected(null); setFocused(null); setHovered(null); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(drawable[index]?.key ?? null); return }
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const next = (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + drawable.length) % drawable.length
    document.querySelector<HTMLElement>(`[data-breakdown-index="${next}"]`)?.focus()
  }

  if (!drawable.length || !total) return <p className={styles.empty}>O gráfico aparece quando há valores calculados.</p>

  const selectedSegment = [...drawable, ...segments].find((segment) => segment.key === active)
  const activeValue = selectedSegment?.value ?? 0

  return (
    <div ref={rootRef} className={styles.layout} onPointerLeave={() => setHovered(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null) }}>
      <div className={styles.chart} data-has-active={Boolean(active)}>
        <svg viewBox="0 0 180 180" role="group" aria-label="Gráfico interativo de composição" onClick={() => { setSelected(null); setFocused(null); setHovered(null) }}>
          <circle className={styles.track} cx="90" cy="90" r={radius} aria-hidden="true" />
          {arcs.map((arc, index) => {
            const dimmed = Boolean(active && active !== arc.key)
            const ariaLabel = `${arc.label}, ${money.format(arc.value)}, ${percent.format(arc.value / total)}`
            return (
              <g key={arc.key} data-segment-group={arc.key} data-active={active === arc.key} data-dimmed={dimmed}>
                <circle
                  className={styles.segment}
                  cx="90" cy="90" r={radius}
                  strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                  strokeDashoffset={-arc.offset}
                  transform="rotate(-90 90 90)"
                  data-segment={arc.key}
                  data-index={index}
                  data-breakdown-index={index}
                  role="button"
                  tabIndex={0}
                  aria-label={ariaLabel}
                  aria-pressed={selected === arc.key}
                  aria-describedby={active === arc.key ? `breakdown-${arc.key}-tooltip` : undefined}
                  onPointerEnter={(event) => pointerEnter(event, arc.key)}
                  onPointerMove={(event) => updatePosition(event.currentTarget, event.clientX, event.clientY)}
                  onFocus={(event) => { setFocused(arc.key); updatePosition(event.currentTarget, 0, 0) }}
                  onBlur={() => setFocused(null)}
                  onClick={(event) => { event.stopPropagation(); setSelected((current) => current === arc.key ? null : arc.key); updatePosition(event.currentTarget, event.clientX, event.clientY) }}
                  onKeyDown={(event) => keyDown(event, index)}
                />
                <circle
                  className={styles.hitArea}
                  cx="90" cy="90" r={radius}
                  strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                  strokeDashoffset={-arc.offset}
                  transform="rotate(-90 90 90)"
                  stroke="transparent"
                  strokeWidth="30"
                  pointerEvents="stroke"
                  data-hit-area={arc.key}
                  aria-hidden="true"
                  onPointerEnter={(event) => pointerEnter(event, arc.key)}
                  onPointerMove={(event) => updatePosition(event.currentTarget, event.clientX, event.clientY)}
                  onClick={(event) => { event.stopPropagation(); setSelected((current) => current === arc.key ? null : arc.key); updatePosition(event.currentTarget, event.clientX, event.clientY) }}
                />
              </g>
            )
          })}
        </svg>
        <div className={styles.center} aria-hidden="true">
          <span>{centerLabel}</span>
          <strong>{active ? percent.format(activeValue / total) : money.format(total)}</strong>
        </div>
      </div>
      <div className={styles.legend}>
        {drawable.map((segment, index) => {
          const activeState = active === segment.key
          const tooltipId = `breakdown-${segment.key}-tooltip`
          return (
            <button
              className={styles.legendItem}
              key={segment.key}
              type="button"
              data-segment={segment.key}
              data-active={activeState}
              aria-label={`${segment.label}: ${money.format(segment.value)}, ${percent.format(segment.value / total)}`}
              aria-pressed={selected === segment.key}
              aria-describedby={activeState ? tooltipId : undefined}
              data-breakdown-index={index}
              onPointerEnter={(event) => { setHovered(segment.key); updatePosition(event.currentTarget, event.clientX, event.clientY) }}
              onPointerMove={(event) => updatePosition(event.currentTarget, event.clientX, event.clientY)}
              onFocus={(event) => { setFocused(segment.key); updatePosition(event.currentTarget, 0, 0) }}
              onBlur={() => setFocused(null)}
              onClick={(event) => { setSelected((current) => current === segment.key ? null : segment.key); updatePosition(event.currentTarget, event.clientX, event.clientY) }}
              onKeyDown={(event) => keyDown(event, index)}
            >
              <span className={styles.dot} data-index={index} aria-hidden="true" />
              <span>{segment.label}</span><strong>{money.format(segment.value)}</strong>
            </button>
          )
        })}
      </div>
      {selectedSegment && createPortal(
        <div className={styles.tooltip} id={`breakdown-${selectedSegment.key}-tooltip`} role="tooltip" style={{ position: 'fixed', left: `${position.left}px`, top: `${position.top}px` }}>
          <strong>{selectedSegment.label}</strong>
          <span>{selectedSegment.fullName}</span>
          <b>{money.format(selectedSegment.value)}</b>
          <span>{percent.format(selectedSegment.value / total)} do total exibido</span>
          <p>{selectedSegment.description}</p>
        </div>,
        document.body,
      )}
    </div>
  )
}
