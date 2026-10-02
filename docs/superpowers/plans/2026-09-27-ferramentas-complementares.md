# Plano de Simulador 360º e Ferramentas Complementares

> **Para agentes de implementação:** usar `superpowers:executing-plans` para executar tarefa por tarefa. Os passos usam caixas de seleção para rastreamento.

**Objetivo:** concluir o Simulador Tributário 360º, substituir o catálogo antigo por cinco modos de Ferramentas Complementares com motores extraídos do bundle público e encerrar a página com FAQ acessível.

**Arquitetura:** manter os motores puros separados da interface. Reutilizar um shell de calculadora, as ações de compartilhamento, o CTA de especialista e um anel interativo comum. A ferramenta ativa e seus inputs ficam serializados na URL sem dados pessoais.

**Tecnologia:** React 19, TypeScript 6, CSS Modules, Vitest e Vite; sem novas dependências.

**Especificação:** mensagem do usuário anexada em `C:\Users\breno\.codex\attachments\d59436f5-4dc7-4af1-856e-ec86f65e4db4\Texto colado.txt`, mais correções diretas no histórico desta tarefa.

## Restrições globais

- Permanecer em `experiment/financial-tools-ramp`; não alterar `main`, não fazer merge nem abrir PR.
- Preservar as alterações locais existentes e o `.idea/` não rastreado.
- Não alterar fórmulas do Simulador 360º durante a lapidação visual.
- Implementar os cinco motores com as operações, condicionais, defaults e limites observados em `C:\Users\breno\Desktop\index-F8pnt5bY.js`; não copiar código do bundle.
- Apresentar os resultados como estimativas simplificadas, sem prometer enquadramento, economia ou valor definitivo.
- Reutilizar o shell, o chart interativo, as ações de compartilhar/copiar e o CTA, sem expandir o escopo para outras seções da página.
- Commits de checkpoint em português; nenhuma criação de branch.

## Foco de revisão

- Inputs monetários vazios, zero, negativos, inválidos e com centavos: não produzir resultados fora das condições legadas.
- Número de sócios e meses trabalhados decimais: preservar a conversão `parseInt` e defaults do legado.
- Pró-labore que excede lucro e rescisão em múltiplos de 12 meses: preservar `Math.max(0, ...)` e `meses % 12 || 12`.
- Hora extra vazia, zero, negativa, jornada zero e percentual 50/100: preservar defaults e limites legados.
- Fator R em 27,999…%, 28% e acima: comparar o valor não arredondado com 28% e arredondar somente o rótulo.

---

### Tarefa 1: Lapidação e checkpoint do Simulador 360º

**Arquivos:** `src/calculators/taxSimulator/TaxSimulator.tsx`, `TaxSimulator.module.css`, `src/sections/ToolsSection.test.tsx`.

- [x] Adicionar testes para espessura visual constante, ring anual relevante, ausência de `Informe os dados` em card já calculado, posição inferior do compartilhamento e estado independente da cópia.
- [x] Confirmar os testes falhando antes das alterações.
- [x] Ajustar visual dos rings sem tocar nos motores; conservar hit area transparente existente e strokes constantes em hover/focus.
- [x] Fazer o formulário esticar até a altura do dashboard e ancorar o compartilhamento no fundo por flex layout; botões lado a lado com quebra apenas quando faltar largura.
- [x] Manter “Copiar link” estável e exibir confirmação independente por 1,8 s; reiniciar o timer em cliques repetidos.
- [x] Testar os três regimes, rings mensal/anual, tooltip, legenda, comparação, copiar e CTA no navegador; medir caixas dos botões antes/depois.
- [x] Rodar os testes relacionados e `git diff --check`.
- [x] Commit: `feat: lapidar o Simulador Tributário 360º`.

### Tarefa 2: Shell reutilizável e motores legados

**Arquivos:** `src/calculators/taxSimulator/TaxSimulator.tsx`, novos módulos em `src/calculators/complementary/`, seus testes e componentes compartilhados.

- [x] Definir tipos comuns para modo, inputs textuais, resultado estimado, componentes do breakdown e descrição de tooltip.
- [x] Extrair um shell reutilizável para título, seleção Step 1, formulário Step 2, colunas simultâneas, compartilhamento inferior e CTA de especialista.
- [x] Extrair a interação ring ↔ legenda ↔ tooltip para componente genérico sem mudar os dois rings atuais.
- [x] Implementar e testar cada motor puro com os dados lidos no bundle:
  - Pró-labore: lucro mensal > 0; sócios `parseInt(...) || 1`; INSS 11% sobre pró-labore total; distribuível limitado a zero.
  - Custo CLT: FGTS 8%; INSS patronal 27,8% somente para regime `lucro`; provisões de 13º e férias + 1/3.
  - Rescisão: meses inteiros; 13º e férias proporcionais por `meses % 12 || 12`; aviso e multa FGTS de 40% somente na demissão sem justa causa; férias usam 1,3333.
  - Hora Extra: jornada default 220; adicional 50%/100%; DSR calculado como `extras / 25 * 5`; horas negativas inválidas.
  - Fator R: folha / receita × 100; atividade serializada, mas não participa do cálculo; limite compara razão bruta com 28%.
- [x] Preservar valores numéricos sem arredondamento interno e formatar moeda/percentual somente na apresentação.
- [x] Rodar testes dos motores e tipos.

### Tarefa 3: Cinco modos e compartilhamento restaurável

**Arquivos:** `src/sections/ToolsSection.tsx`, `src/sections/ToolsSection.module.css`, dados/componentes de ferramentas complementares e `sharing.ts` correspondente.

- [x] Substituir o catálogo por “Ferramentas Complementares”, subtítulo curto e cinco botões de modo no mesmo shell do Simulador 360º.
- [x] Implementar inputs legados, resultado principal, breakdown calculado, gráfico interativo quando os valores permitirem e microcopy de estimativa simplificada para cada modo.
- [x] Usar a infraestrutura de compartilhamento para serializar o modo e apenas seus inputs; restaurar seleção, campos e resultado ao abrir URL.
- [x] Manter CTA “Falar com um especialista” no rodapé geral e as ações de compartilhar na base da coluna esquerda.
- [x] Testar troca de modo, valores de referência e limites, URL round-trip, gráfico, acessibilidade e CTA.
- [x] Commit: `feat: adicionar Ferramentas Complementares`.

### Tarefa 4: Remover catálogo antigo e trocar Contexto por FAQ

**Arquivos:** `src/data/tools.ts`, `src/sections/ToolsSection.tsx`, `src/sections/ToolsSection.module.css`, `src/sections/ProblemSection.tsx` e seus arquivos de estilo/teste, `src/pages/HomePage.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, testes associados.

- [x] Remover os cards independentes Simples Nacional, Fator R, Pró-labore, Custo CLT, Rescisão e Hora Extra; Simples permanece apenas no Simulador 360º e Fator R apenas como modo complementar.
- [x] Remover dados, cálculo, CSS, testes e anchors antigos sem remover `#conteudo` nem outras seções do site.
- [x] Substituir a seção narrativa Contexto por “Dúvidas frequentes” perto do fim, usando as quatro perguntas fornecidas e respostas limitadas a informações existentes em serviços/processo.
- [x] Implementar accordion com botões, `aria-expanded`, `aria-controls`, foco visível e movimento reduzido; atualizar navegação para a nova âncora.
- [x] Testar teclado, expansão/recolhimento, links e ausência dos componentes antigos no DOM.
- [x] Commit: `feat: substituir Contexto por FAQ e remover catálogo antigo`.

### Tarefa 5: QA final, limpeza e checkpoint

**Arquivos:** somente arquivos necessários para corrigir falhas comprovadas pelo QA.

- [x] Remover CSS/estados/imports/testes antigos que permanecerem sem uso.
- [x] Rodar `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`.
- [x] Validar 320×812, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1536×864 e 1920×1080 nos temas claro/escuro; registrar `scrollWidth === clientWidth`.
- [x] Validar os três regimes, os dois rings, comparação, compartilhamento e CTA; validar cinco ferramentas, troca/inputs/resultados, gráficos, compartilhamento e restauração.
- [x] Fazer apenas correções necessárias; executar novamente os gates afetados e registrar os resultados.
- [x] Commit final: `test: validar ferramentas financeiras em telas e temas`.

