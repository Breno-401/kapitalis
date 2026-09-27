import { useState } from 'react'
import { calculateTaxSimulation, type TaxSimulationInput, type RegimeResult } from './engine'
import { createSimulationUrl, readSharedSimulation } from './sharing'
import styles from './TaxSimulator.module.css'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 })

function ResultRing({ result, monthlyRevenue }: { result: RegimeResult; monthlyRevenue: string }) {
  const share = result.status === 'ready' && Number(monthlyRevenue) > 0 ? Math.min(result.effectiveRate, 1) : 0
  const circumference = 2 * Math.PI * 74
  const monthlyCents = Number(monthlyRevenue) * 100

  return (
    <div className={styles.ringBlock}>
      <div className={styles.ring}>
        <svg viewBox="0 0 190 190" role="img" aria-label={result.status === 'ready' ? `DAS estimado: ${percent.format(result.effectiveRate)} da receita mensal` : 'Composição indisponível'}>
          <circle className={styles.ringTrack} cx="95" cy="95" r="74" />
          <circle className={styles.ringProgress} cx="95" cy="95" r="74" strokeDasharray={`${share * circumference} ${circumference}`} />
        </svg>
        <div className={styles.ringCenter} aria-hidden="true">
          <span>Alíquota efetiva</span>
          <strong>{result.status === 'ready' ? percent.format(result.effectiveRate) : '—'}</strong>
        </div>
      </div>
      <div className={styles.legend}>
        <div><span className={styles.legendDot} data-kind="tax" />DAS estimado<strong>{result.status === 'ready' ? money.format(result.monthlyCents / 100) : '—'}</strong></div>
        <div><span className={styles.legendDot} data-kind="remaining" />Receita após este DAS<strong>{result.status === 'ready' ? money.format((monthlyCents - result.monthlyCents) / 100) : '—'}</strong></div>
        <p>Antes de custos e de outros tributos eventualmente aplicáveis.</p>
      </div>
    </div>
  )
}

function RegimeRow({ name, result }: { name: string; result: RegimeResult }) {
  const value = result.status === 'ready'
    ? money.format(result.monthlyCents / 100)
    : result.status === 'invalid' ? 'Dados incompletos' : 'Pendente de validação'
  return (
    <li className={styles.regimeRow} data-ready={result.status === 'ready'}>
      <span className={styles.regimeName}>{name}</span>
      <span className={styles.regimeValue}>{value}</span>
      <small>{result.status === 'ready' ? 'DAS mensal estimado' : result.reason}</small>
    </li>
  )
}

export function TaxSimulator({ headingId }: { headingId: string }) {
  const [input, setInput] = useState<TaxSimulationInput>(() => readSharedSimulation(window.location.search))
  const [copyState, setCopyState] = useState('')
  const result = calculateTaxSimulation(input)
  const shareUrl = createSimulationUrl(input, window.location)

  function update<K extends keyof TaxSimulationInput>(key: K, value: TaxSimulationInput[K]) {
    setInput((current) => ({ ...current, [key]: value }))
    setCopyState('')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyState('Link copiado')
    } catch {
      setCopyState('Não foi possível copiar. Selecione o link acima.')
    }
  }

  return (
    <section className={styles.shell} data-theme-surface="dark" aria-labelledby={headingId}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Ferramenta financeira / 01 · referência 2026</p>
          <h3 id={headingId}>Simulador Tributário 360º</h3>
          <p>Explore a carga do Simples com premissas explícitas. Os demais regimes aguardam dados para uma comparação responsável.</p>
        </div>
        <span className={styles.statusPill}>Em validação pela Kapitalis</span>
      </div>

      <div className={styles.columns}>
        <form className={styles.inputs} onSubmit={(event) => event.preventDefault()}>
          <div className={styles.columnHeading}><span>01 / Configuração</span><h4>Dados da operação</h4></div>
          <p className={styles.help}>Informe o mês que deseja simular e a receita acumulada nos 12 meses anteriores. Não usamos faturamento anual previsto como substituto do RBT12.</p>
          <label className={styles.field}>
            <span>Receita bruta do mês</span>
            <div className={styles.moneyInput}><span aria-hidden="true">R$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={input.monthlyRevenue} onChange={(event) => update('monthlyRevenue', event.target.value)} /></div>
          </label>
          <label className={styles.field}>
            <span>RBT12 — receita dos 12 meses anteriores</span>
            <div className={styles.moneyInput}><span aria-hidden="true">R$</span><input type="number" min="0" step="0.01" inputMode="decimal" value={input.rbt12} onChange={(event) => update('rbt12', event.target.value)} /></div>
          </label>
          <label className={styles.field}>
            <span>Atividade e anexo</span>
            <select value={input.activity} onChange={(event) => update('activity', event.target.value as TaxSimulationInput['activity'])}>
              <option value="">Selecione o enquadramento</option>
              <option value="commerce">Revenda de mercadorias · Anexo I</option>
              <option value="industry">Indústria · Anexo II</option>
              <option value="services-iii">Serviços · Anexo III confirmado</option>
              <option value="services-unconfirmed">Serviços · anexo ainda não confirmado</option>
            </select>
          </label>
          <label className={styles.confirmation}>
            <input type="checkbox" checked={input.ordinarySimplesScenario} onChange={(event) => update('ordinarySimplesScenario', event.target.checked)} />
            <span>Para este cenário, considero a empresa optante e elegível ao Simples Nacional e a receita comum, sem segregações, substituição tributária, incidência monofásica, exportação ou retenção.</span>
          </label>
          <p className={styles.inputFootnote}>Atividade, anexo e tratamento da receita precisam ser confirmados pela contabilidade antes de qualquer uso fiscal.</p>
        </form>

        <div className={styles.dashboard}>
          <div className={styles.columnHeading}><span>02 / Resultado vivo</span><h4>Carga tributária estimada</h4></div>
          <div className={styles.heroMetric} role="status" aria-live="polite">
            <span>Simples Nacional · DAS do mês</span>
            <strong>{result.simples.status === 'ready' ? money.format(result.simples.monthlyCents / 100) : '—'}</strong>
            <p>{result.simples.status === 'ready' ? `${result.simples.band}ª faixa · cálculo pela alíquota efetiva` : result.simples.reason}</p>
          </div>
          <div className={styles.annualMetric}>
            <span>Projeção anual, se os 12 meses forem iguais</span>
            <strong>{result.simples.status === 'ready' ? money.format(result.simples.annualCents / 100) : '—'}</strong>
          </div>
          <ResultRing result={result.simples} monthlyRevenue={input.monthlyRevenue} />
          <div className={styles.comparison}>
            <h5>Regimes nesta simulação</h5>
            <ol>
              <RegimeRow name="Simples Nacional" result={result.simples} />
              <RegimeRow name="Lucro Presumido" result={result.presumido} />
              <RegimeRow name="Lucro Real" result={result.real} />
            </ol>
          </div>
          <div className={styles.interpretation}>
            <span>Menor carga estimada nesta simulação</span>
            <strong>Comparação indisponível</strong>
            <p>Os três regimes ainda não têm cargas completas e comparáveis. A escolha depende de análise contábil da Kapitalis.</p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.sources}>
          <span>Critério verificável</span>
          <a href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm" target="_blank" rel="noopener noreferrer">LC 123/2006 · art. 18 e Anexos I–III</a>
          <a href="https://www8.receita.fazenda.gov.br/simplesnacional/arquivos/manual/manual_pgdas-d_2018_v4.pdf" target="_blank" rel="noopener noreferrer">Manual PGDAS-D · item 8.1</a>
        </div>
        <div className={styles.share}>
          <label htmlFor="tax-simulation-link">Compartilhar esta simulação</label>
          <div><input id="tax-simulation-link" readOnly value={shareUrl} onFocus={(event) => event.target.select()} /><button type="button" onClick={copyLink}>Copiar link da simulação</button></div>
          <span aria-live="polite">{copyState || 'O link contém apenas os dados desta simulação.'}</span>
        </div>
      </div>
    </section>
  )
}
