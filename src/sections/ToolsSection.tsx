import { toolGroups } from '../data/tools'
import styles from './ToolsSection.module.css'

export function ToolsSection() {
  return (
    <section
      className={styles.section}
      id="conteudo"
      aria-labelledby="tools-title"
    >
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>Ferramentas</p>
        <div className={styles.heading}>
          <h2 id="tools-title">Ferramentas para decisões mais claras.</h2>
          <div className={styles.intro}>
            <p>
              As sete ferramentas continuam disponíveis no site oficial. Abra o
              painel indicado e escolha a calculadora; os resultados são
              calculados lá, sem fórmulas demonstrativas nesta página.
            </p>
            <p className={styles.routeNote}>
              Os painéis publicados não têm uma URL própria por ferramenta.
            </p>
          </div>
        </div>

        <div className={styles.groups}>
          {toolGroups.map((group, groupIndex) => (
            <section
              className={styles.group}
              key={group.id}
              aria-labelledby={`${group.id}-title`}
            >
              <div className={styles.groupHeader}>
                <span aria-hidden="true" className={styles.groupIndex}>
                  0{groupIndex + 1}
                </span>
                <div>
                  <h3 id={`${group.id}-title`}>{group.name}</h3>
                  <p>{group.description}</p>
                </div>
              </div>

              <ol className={styles.toolList}>
                {group.tools.map((tool, toolIndex) => (
                  <li
                    className={styles.toolItem}
                    data-tool-card
                    key={tool.id}
                  >
                    <a
                      className={styles.toolLink}
                      href={tool.destination.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${tool.name} no site oficial`}
                    >
                      <span className={styles.toolIndex} aria-hidden="true">
                        {String(toolIndex + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.toolCopy}>
                        <h4 className={styles.toolName}>{tool.name}</h4>
                        <span className={styles.toolDescription}>
                          {tool.description}
                        </span>
                        <span className={styles.destinationNote}>
                          {tool.destination.note}
                        </span>
                      </span>
                      <span className={styles.toolArrow} aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
