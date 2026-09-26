import { useId, useState } from 'react'
import { calculateFactorR } from '../calculators/factorR'
import { toolGroups, type BusinessTool, type ToolField } from '../data/tools'
import styles from './ToolsSection.module.css'

const allTools = toolGroups.flatMap((group) => group.tools)
const initialTool = allTools[0]!

function getToolGroupName(tool: BusinessTool): string {
  return toolGroups.find((group) => group.tools.some(({ id }) => id === tool.id))?.name ?? ''
}

function ToolInput({
  field,
  inputId,
  value,
  onChange,
}: {
  field: ToolField
  inputId: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.fieldLabel}>{field.label}</span>
      {field.type === 'select' ? (
        <select
          className={styles.fieldControl}
          id={inputId}
          value={value || field.options?.[0] || ''}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <span className={styles.inputFrame}>
          {field.unit && <span aria-hidden="true" className={styles.inputUnit}>{field.unit}</span>}
          <input
            className={styles.fieldControl}
            id={inputId}
            type="number"
            min="0"
            step={field.step ?? 'any'}
            inputMode="decimal"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </span>
      )}
    </label>
  )
}

function ToolResult({ tool, values }: { tool: BusinessTool; values: Record<string, string> }) {
  if (tool.calculation === 'verified-factor-r') {
    const result = calculateFactorR(values.revenue ?? '', values.payroll ?? '')

    return (
      <div className={styles.result}>
        <div className={styles.resultReading} role="status" aria-live="polite">
          <span className={styles.resultLabel}>Fator R · razão folha / receita</span>
          <strong className={styles.resultValue}>{result?.percentageLabel ?? '—'}</strong>
          <p className={styles.resultStatus} data-attained={result?.thresholdReached ?? false}>
            {result
              ? result.thresholdReached
                ? 'Parâmetro de 28% atingido'
                : 'Abaixo do parâmetro de 28%'
              : 'Informe a receita e a folha dos últimos 12 meses.'}
          </p>
        </div>
        <p className={styles.resultNote}>
          A regra depende da atividade e do período de apuração. Esta leitura mostra a proporção; não confirma enquadramento nem calcula imposto.
        </p>
        <a
          className={styles.legalLink}
          href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Base legal: art. 18, §§ 5-J, 5-K e 5-M da LC 123/2006
        </a>
      </div>
    )
  }

  return (
    <div className={styles.pendingResult} role="status" aria-live="polite">
      <div>
        <span className={styles.pendingMark} aria-hidden="true" />
        <p className={styles.pendingTitle}>Fórmula aguardando validação</p>
        <p className={styles.pendingCopy}>
          Os campos foram organizados a partir da ferramenta publicada. O resultado fica bloqueado até a regra de cálculo ser confirmada.
        </p>
      </div>
      <button className={styles.pendingButton} type="button" disabled>
        Resultado indisponível
      </button>
    </div>
  )
}

export function ToolsSection() {
  const [selectedTool, setSelectedTool] = useState<BusinessTool>(initialTool)
  const [values, setValues] = useState<Record<string, string>>({})
  const sectionId = useId()
  const headingId = `${sectionId}-panel-heading`

  function selectTool(tool: BusinessTool) {
    setSelectedTool(tool)
    setValues({})
  }

  function updateField(fieldId: string, value: string) {
    setValues((currentValues) => ({ ...currentValues, [fieldId]: value }))
  }

  return (
    <section
      className={styles.section}
      id="conteudo"
      aria-labelledby="tools-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.heading}>
          <h2 id="tools-title">Ferramentas para decisões mais claras.</h2>
          <p className={styles.intro}>
            Um só espaço para explorar as ferramentas da Kapitalis. A prévia só apresenta resultados quando a fórmula foi confirmada.
          </p>
        </div>

        <div className={styles.workspace}>
          <nav className={styles.catalog} aria-label="Escolha uma ferramenta">
            {toolGroups.map((group) => (
              <section
                className={styles.group}
                key={group.id}
                aria-labelledby={`${sectionId}-${group.id}`}
              >
                <h3 className={styles.groupTitle} id={`${sectionId}-${group.id}`}>
                  {group.name}
                </h3>
                <p className={styles.groupDescription}>{group.description}</p>
                <ol className={styles.toolList}>
                  {group.tools.map((tool, index) => (
                    <li className={styles.toolItem} key={tool.id}>
                      <button
                        aria-pressed={selectedTool.id === tool.id}
                        className={styles.toolButton}
                        onClick={() => selectTool(tool)}
                        type="button"
                      >
                        <span className={styles.toolIndex} aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.toolName}>{tool.name}</span>
                        <span
                          className={styles.toolStatus}
                          data-verified={tool.calculation === 'verified-factor-r'}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </nav>

          <section
            className={styles.toolPanel}
            aria-labelledby={headingId}
          >
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelCategory}>{getToolGroupName(selectedTool)}</p>
                <h3 id={headingId}>{selectedTool.name}</h3>
                <p className={styles.panelDescription}>{selectedTool.description}</p>
              </div>
              <span
                className={styles.validationState}
                data-verified={selectedTool.calculation === 'verified-factor-r'}
              >
                {selectedTool.calculation === 'verified-factor-r'
                  ? 'Razão verificada'
                  : 'Validação pendente'}
              </span>
            </div>

            <form className={styles.toolForm} onSubmit={(event) => event.preventDefault()}>
              <fieldset className={styles.fields}>
                <legend>Dados para explorar a ferramenta</legend>
                {selectedTool.fields.map((field) => (
                  <ToolInput
                    field={field}
                    inputId={`${sectionId}-${selectedTool.id}-${field.id}`}
                    key={field.id}
                    value={values[field.id] ?? ''}
                    onChange={(value) => updateField(field.id, value)}
                  />
                ))}
              </fieldset>
            </form>

            <ToolResult tool={selectedTool} values={values} />
          </section>
        </div>
      </div>
    </section>
  )
}
