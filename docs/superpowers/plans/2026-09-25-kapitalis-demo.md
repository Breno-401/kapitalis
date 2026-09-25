# Demo premium da Kapitalis — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Construir uma home demonstrativa, responsiva e interativa que apresente a Kapitalis como infraestrutura de contabilidade e gestão financeira, usando navy/dourado e uma narrativa própria do fluxo até a decisão.

**Architecture:** Aplicação Vite de uma página com React e TypeScript. Dados verificáveis do negócio, dados demonstrativos e capítulos de storytelling ficam separados da apresentação. O motor de capítulos recebe texto e mídia substituível, observa estados de leitura com IntersectionObserver e usa conteúdo estático de fallback; o sistema financeiro ilustrativo é local, rotulado e não calcula resultados fiscais.

**Tech Stack:** Node 24.14 já instalado; npm 11; Vite + React + TypeScript; CSS Modules e CSS global para tokens; ESLint; Vitest + Testing Library + jsdom. Sem Tailwind, GSAP ou biblioteca de animação.

**Spec:** docs/superpowers/specs/2026-09-25-kapitalis-demo-design.md

## Global Constraints

- Trabalhar diretamente na branch main, sem criar branch ou PR.
- Usar Vite + React + TypeScript; CSS Modules e folhas globais de tokens.
- Manter navy #051529, variação navy #051428 e dourado #D4AF37 como cores originais; tokens adicionais são extensões propostas e passam por revisão de contraste.
- Sem Tailwind, GSAP, vídeo, canvas, imagens stock ou dependência de animação.
- Toda quantia, saldo, tarefa e estado no painel BPO é dado demonstrativo fictício; o aviso aparece dentro do painel durante toda a interação.
- Case e pessoa/equipe ficam fora da home sem conteúdo real autorizado.
- Prioridade visual: Hero; Problemas/contexto; Sistema Kapitalis/storytelling; BPO/Mesa de Controle; CTA final.
- Não publicar CNPJ, CRC, endereço detalhado, rating, contagem, case, pessoa ou credencial profissional antes da validação indicada na especificação.
- Preservar o logo existente sem redesenho. Usar somente o asset original encontrado no site.
- Commits em português; publicar commits de trabalho em origin/main.
- Executar instalação limpa, lint, testes, typecheck, build e verificações browser/responsividade pedidos pelo usuário.

## Review Focus

1. Janela estreita ou baixa (375×812, 390×844, 430×932 e 1366×768): conteúdo permanece legível e a página não ganha overflow horizontal.
2. IntersectionObserver ausente ou movimento reduzido: capítulos continuam em ordem, com texto e mídia acessíveis; movimento é removido sem esconder conteúdo.
3. Mídia editorial adicionada a StoryChapter: imagem exige texto alternativo e não fica presa ao diagrama atual nem ao estado de um capítulo anterior.
4. Troca de vista no BPO: o aviso de dados fictícios continua visível e nenhuma seleção parece cálculo ou integração real.
5. Contato externo: todos os CTAs usam a mesma fonte de contato publicada e um destino WhatsApp válido, sem âncora morta.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| index.html | Entrada Vite, metadados SEO e fallback estático sem JavaScript da narrativa |
| public/assets/kapitalis-logo-original.png | Cópia sem alteração do logo existente |
| public/favicon.png | Mesmo asset original reduzido pelo navegador; sem redesenho |
| public/robots.txt, public/sitemap.xml | SEO da única página da demo |
| src/main.tsx, src/App.tsx | Inicialização React e composição global |
| src/pages/HomePage.tsx | Ordem e landmarks das seções da home |
| src/styles/tokens.css, src/styles/global.css | Escala cromática, tipo, spacing, movimento, reset e regras globais |
| src/data/site.ts | Nome comercial, domínio configurável e contatos observados |
| src/data/services.ts | Pilares e serviços agrupados da auditoria |
| src/data/kapitalisStory.json | Fonte única de texto e descritores de mídia dos capítulos |
| src/story/types.ts | Contratos de capítulo e mídia |
| src/story/StorySection.tsx | Composição e lógica do motor, independente do conteúdo |
| src/story/StoryChapter.tsx | Capítulo semântico com texto e mídia |
| src/story/StoryMedia.tsx | Renderiza cena Kapitalis ou imagem editorial com alt |
| src/story/useActiveStoryChapter.ts | Estado ativo derivado de IntersectionObserver com fallback |
| src/story/renderStoryFallback.ts | Escapa e transforma os mesmos dados em HTML estático dentro de noscript |
| src/components/FutureProofBlocks.tsx | Blocos genéricos para conteúdo futuro de case e responsável, sem integrar à Home |
| src/data/demoFinance.ts | Dados fictícios do painel, nomeados como demonstrativos |
| src/components/SiteHeader.tsx, SiteHeader.module.css | Navegação, comportamento do menu e foco |
| src/components/SiteFooter.tsx, SiteFooter.module.css | Navegação secundária e contatos verificados |
| src/components/BrandMark.tsx | Uso responsivo do asset original |
| src/components/SectionHeading.tsx | Introduções editoriais consistentes |
| src/sections/*.tsx e *.module.css | Seções focadas; sem Home com conteúdo monolítico |
| src/test/setup.ts | Setup mínimo do ambiente Vitest |
| src/**/*.test.tsx | Testes de comportamento/semântica junto aos componentes |
| eslint.config.js, vite.config.ts, tsconfig*.json, package.json | Configuração, lint, testes, typecheck e comandos npm |

## Fase 1 — Bootstrap, tokens e assets

### Task 1: Bootstrap Vite + React + TypeScript

**Files:**
- Create: estrutura Vite com react-ts na raiz existente, sem alterar docs ou .git.
- Modify: package.json, tsconfig*.json, vite.config.ts, eslint.config.js.
- Create: src/styles/tokens.css, src/styles/global.css, src/test/setup.ts.
- Test: configuração Vitest em vite.config.ts ou vitest.config.ts.
- Asset: public/assets/kapitalis-logo-original.png e public/favicon.png.

**Interfaces:**
- Produces: scripts npm run dev, npm run lint, npm run typecheck, npm run test e npm run build.
- Produces: tokens para navy original #051529, navy original #051428, gold original #D4AF37, extensões claras/neutras/funcionais da especificação, spacing em múltiplos de 4 px, raios 8–20 px, movimento curto e breakpoints 600 px/900 px.
- Consumes: Node e npm já instalados. Vite atual documenta Node 20.19+ ou 22.12+; o ambiente observado é Node 24.14.

- [ ] **Step 1: Scaffold da base Vite.** Executar npm create vite@latest . -- --template react-ts --no-interactive; confirmar que os documentos existentes permanecem.
- [ ] **Step 2: Instalar dependências de execução e qualidade.** Executar npm install; adicionar somente vitest, @testing-library/react e jsdom como dependências de teste.
- [ ] **Step 3: Configurar lint, testes e typecheck.** Declarar os scripts: eslint ., vitest run e tsc -b --pretty false (exposto como npm run typecheck). Manter plugins ESLint que o template Vite já trouxe e configurar ambiente jsdom mais src/test/setup.ts em vite.config.ts usando vitest/config.
- [ ] **Step 4: Criar tokens e base CSS.** Implementar reset, tipografia de sistema, container fluido e os tokens da especificação; não aplicar ainda composição detalhada de seção.
- [ ] **Step 5: Adicionar logo/favicons sem tratamento destrutivo.** Copiar o asset original observado; manter a origem documentada no nome; não gerar variante ilustrada.
- [ ] **Step 6: Validar base.** Run: npm run lint; npm run typecheck; npm run test -- --passWithNoTests; npm run build. Expected: quatro comandos encerram com exit code 0; a opção de suite vazia só vale nesta task de configuração.
- [ ] **Step 7: Commit.** chore(site): inicializa Vite e tokens da Kapitalis.

## Fase 2 — Shell: header, navegação, footer e Home

### Task 2: Shell semântico e navegação acessível

**Files:**
- Create: src/components/SiteHeader.tsx, SiteHeader.module.css, SiteHeader.test.tsx.
- Create: src/components/SiteFooter.tsx, SiteFooter.module.css.
- Create: src/components/BrandMark.tsx, src/components/SectionHeading.tsx.
- Create: src/pages/HomePage.tsx, src/App.tsx, src/main.tsx.
- Create: src/data/site.ts.

**Interfaces:**
- Consumes: tokens e logo da Task 1.
- Produces: SiteHeader, SiteFooter e HomePage com main, header, nav e footer; anchors #inicio, #contexto, #sistema, #servicos, #bpo, #processo, #conteudo e #contato.
- Produces: site.ts com nome comercial, telefone E.164, URL wa.me, e-mail, Instagram, Facebook, URL Google observada e localidade; não incluir CNPJ/CRC/endereço de rua.

- [ ] **Step 1: Escrever testes RED para o menu.** Criar mobile_menu_opens_and_closes_with_escape_and_returns_focus e navigation_links_target_existing_sections.
- [ ] **Step 2: Executar teste focado.** Run: npm run test -- src/components/SiteHeader.test.tsx. Expected: FAIL porque SiteHeader e comportamento ainda não existem.
- [ ] **Step 3: Implementar header/footer/HomePage.** Header desktop com anchors e CTA; menu mobile com botão aria-expanded/controls, fecha com Escape e seleção de link e retorna foco ao acionador.
- [ ] **Step 4: Rodar testes GREEN e regressão.** Run: npm run test -- src/components/SiteHeader.test.tsx; depois npm run test. Expected: PASS.
- [ ] **Step 5: Verificar landmarks e âncoras.** Testar um header, um main, um footer, uma H1 e o contrato dos hrefs no menu. A existência de cada destino será verificada depois que todas as seções estiverem montadas na Task 11.
- [ ] **Step 6: Validar lint/typecheck.** Run: npm run lint; npm run typecheck. Expected: exit code 0.
- [ ] **Step 7: Commit.** feat(site): cria shell acessível da home.

## Fase 3 — Hero (momento essencial 1/5)

### Task 3: Hero navy e console conceitual

**Files:**
- Create: src/sections/HeroSection.tsx, HeroSection.module.css, HeroSection.test.tsx.
- Create: src/components/FinancialConsole.tsx, FinancialConsole.module.css.
- Create: src/data/demoFinance.ts.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Consumes: BrandMark, site.ts, tokens.
- Produces: HeroSection com headline, subheadline, CTA WhatsApp e CTA #sistema.
- Produces: FinancialConsole recebe demoFinance.ts; todos os valores/estados pertencem a dados fictícios e levam aviso persistente “AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS”.

- [ ] **Step 1: Escrever testes RED.** Criar hero_primary_contact_targets_published_whatsapp e hero_financial_values_are_labeled_demonstrative; afirmar href wa.me/5527998829289, id destino #sistema e texto do aviso visível.
- [ ] **Step 2: Executar testes focados.** Run: npm run test -- src/sections/HeroSection.test.tsx. Expected: FAIL por falta de seção/console.
- [ ] **Step 3: Implementar a estrutura semântica.** Headline aprovada como direção temporária: “Seus números sob controle. Suas decisões com mais clareza.” UI mostra vencimentos, conciliação/fechamento e fluxo ilustrativo; evitar métrica comercial.
- [ ] **Step 4: Implementar CSS do hero navy.** Marca clara, composição split desktop, console compacta, superfícies internas navy, ouro apenas para estado; em mobile headline/CTA precedem UI.
- [ ] **Step 5: Acrescentar primeira camada de motion CSS.** Reveal pequeno por opacity/translate, respeitando prefers-reduced-motion e mantendo conteúdo presente sem classe de animação.
- [ ] **Step 6: Rodar teste focado e suite.** Run: npm run test -- src/sections/HeroSection.test.tsx; npm run test. Expected: PASS.
- [ ] **Step 7: Validar e commit.** Run: npm run lint; npm run typecheck; depois feat(site): cria hero financeiro demonstrativo.

## Fase 4 — Problemas/contexto (momento essencial 2/5)

### Task 4: Seção editorial do empresário

**Files:**
- Create: src/sections/ProblemSection.tsx, ProblemSection.module.css, ProblemSection.test.tsx.
- Create: src/sections/TrustStrip.tsx, TrustStrip.module.css.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Consumes: tokens e SectionHeading.
- Produces: perguntas curtas sobre caixa, sobra, obrigações e previsibilidade; TrustStrip mostra apenas serviço/localidade e link Google se origem válida estiver na fonte site.ts.

- [ ] **Step 1: Escrever teste RED.** Criar problem_section_renders_editorial_questions_without_fake_proof; afirmar heading de seção, quatro prompts semânticos e ausência de valores de avaliações/números comerciais.
- [ ] **Step 2: Rodar teste focado.** Run: npm run test -- src/sections/ProblemSection.test.tsx. Expected: FAIL por ausência da seção.
- [ ] **Step 3: Implementar perguntas e faixa de contexto.** Sem “por que escolher”, cards uniformes, estatísticas, cases ou citações.
- [ ] **Step 4: Implementar seção clara e transição de ritmo.** Hierarquia em pergunta tipográfica, regra divisória e pequenos estados de resposta; nenhuma interação obrigatória para acessar o texto.
- [ ] **Step 5: Rodar teste e suite.** Run: npm run test -- src/sections/ProblemSection.test.tsx; npm run test. Expected: PASS.
- [ ] **Step 6: Lint/typecheck e commit.** feat(site): apresenta contexto financeiro do empresário.

## Fase 5 — Sistema Kapitalis / storytelling (momento essencial 3/5)

### Task 5: Motor genérico de capítulos e mídias substituíveis

**Files:**
- Create: src/story/types.ts, StorySection.tsx, StoryChapter.tsx, StoryMedia.tsx, useActiveStoryChapter.ts.
- Create: src/story/StorySection.module.css, renderStoryFallback.ts, src/data/kapitalisStory.json.
- Create: src/story/StorySection.test.tsx, StoryMedia.test.tsx, useActiveStoryChapter.test.ts, renderStoryFallback.test.ts.
- Modify: vite.config.ts com transformIndexHtml; index.html com marcador dentro de noscript.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Produces: StoryMedia union: { kind: "diagram"; scene: "sources" | "organized" | "information" | "decision" } ou { kind: "image"; src: string; alt: string; objectPosition?: string }.
- Produces: StoryChapter { id: string; eyebrow: string; title: string; body: string; media: StoryMedia }.
- Produces: StorySection recebe readonly StoryChapter[] e monta HTML semântico; useActiveStoryChapter recebe chaptersRef e retorna string ou null; renderStoryFallback recebe os mesmos capítulos e retorna HTML escapado.
- Consumes: capítulos atuais em data separada da mecânica. A mesma estrutura suporta histórias futuras de origem/crescimento/atuação/resultado e case/problema/intervenção/resultado.

- [ ] **Step 1: Escrever testes RED para conteúdo, mídia, estado e fallback.** Criar story_chapters_render_in_order, image_media_renders_alt_text, diagram_scene_changes_with_chapter_data, observer_selects_current_chapter e fallback_escapes_and_renders_each_chapter; validar ausência de mídia vazia e escape de texto/alt.
- [ ] **Step 2: Executar testes focados.** Run: npm run test -- src/story. Expected: FAIL pelas interfaces ausentes.
- [ ] **Step 3: Implementar tipos e fonte de capítulos.** Manter os quatro capítulos atuais em kapitalisStory.json, fora do motor: fontes → organização → informação útil → decisão.
- [ ] **Step 4: Implementar StoryMedia.** Cena demonstrativa renderiza SVG/CSS próprio; mídia image renderiza picture/img responsiva, alt obrigatório e object-position opcional. Nenhuma dependência de foto de cliente.
- [ ] **Step 5: Implementar StoryChapter e StorySection.** Desktop mantém composição sticky por capítulo; mudança de cena usa opacity/transform breves. Texto, mídia e modelos futuros não ficam presos a dados financeiros.
- [ ] **Step 6: Implementar estado ativo com IntersectionObserver.** Se API não existir, todos capítulos continuam em sequência estática e o capítulo permanece sem highlight interativo. Não ler window.scrollY a cada frame.
- [ ] **Step 7: Gerar fallback sem JavaScript da mesma fonte.** Implementar renderStoryFallback(chapters) com escaping de texto, alt, src e cenas; adicionar um plugin transformIndexHtml em vite.config.ts que injeta o retorno no marcador index.html, dentro de noscript. Cada capítulo mostra texto e mídia/diagrama 2D em fluxo vertical, sem imagem stock.
- [ ] **Step 8: Implementar mobile e movimento reduzido.** Desligar sticky/progressão visual em <=599 px; exibir mídia junto a cada texto. Reduced-motion remove transições e mantém leitura/ordem completas.
- [ ] **Step 9: Rodar RED/GREEN e suite.** Run: npm run test -- src/story; npm run test; npm run build. Expected: PASS; dist/index.html contém os quatro capítulos, cenas demonstrativas e conteúdo escapado do mesmo JSON.
- [ ] **Step 10: Commit.** feat(site): cria storytelling Kapitalis com mídia substituível.

## Fase 6 — Serviços editoriais

### Task 6: Três pilares de serviço

**Files:**
- Create: src/data/services.ts.
- Create: src/sections/ServicesSection.tsx, ServicesSection.module.css, ServicesSection.test.tsx.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Produces: grupos Contabilidade, BPO Financeiro e Tributário e empresarial, cada um com id, título, descrição breve e lista de atividades verificadas.
- Consumes: serviços da auditoria. O BPO permanece listado, mas o visualizador financeiro vive na seção própria.

- [ ] **Step 1: Escrever teste RED.** Criar services_show_three_audited_pillars; afirmar três headings e atividades conhecidas sem criar itens com texto genérico.
- [ ] **Step 2: Executar teste focado.** Run: npm run test -- src/sections/ServicesSection.test.tsx. Expected: FAIL porque data/seção não existem.
- [ ] **Step 3: Implementar services.ts e seção.** Agrupar abertura/contabilidade/DP/IR/MEI; BPO; planejamento/consultoria/indicadores conforme auditoria, com redação curta.
- [ ] **Step 4: Implementar layout editorial claro.** Um pilar em destaque e os demais em composição tipográfica, sem oito cards iguais.
- [ ] **Step 5: Rodar suite, lint e typecheck.** Run: npm run test; npm run lint; npm run typecheck. Expected: exit code 0.
- [ ] **Step 6: Commit.** feat(site): organiza serviços em três pilares.

## Fase 7 — BPO / Mesa de Controle (momento essencial 4/5)

### Task 7: Console BPO interativa e explícita

**Files:**
- Create: src/sections/BpoSection.tsx, BpoSection.module.css, BpoSection.test.tsx.
- Modify: src/components/FinancialConsole.tsx, FinancialConsole.module.css, src/data/demoFinance.ts.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Produces: controles “Pagamentos”, “Recebimentos” e “Fechamento”; botão selecionado expõe aria-pressed; painel de conteúdo tem rótulo e estado correspondentes.
- Consumes: DEMO_FINANCE_STATE tipado, contendo somente registros estáticos demonstrativos.

- [ ] **Step 1: Escrever testes RED.** Criar bpo_view_switches_operational_records e bpo_disclaimer_stays_visible_across_views; afirmar estado inicial, mudança de lista/estado e aviso persistente.
- [ ] **Step 2: Executar teste focado.** Run: npm run test -- src/sections/BpoSection.test.tsx. Expected: FAIL porque controles/seção não existem.
- [ ] **Step 3: Implementar estados acessíveis.** Alternar o conteúdo sem troca de URL; botões continuam operáveis por teclado; seleção não altera totals com base em inputs.
- [ ] **Step 4: Implementar composição navy distinta do Hero.** Mostrar rotina de pagamento, recebimento, caixa e fechamento como informação; ouro marca ativo/progresso, verde discreto concluído, vermelho somente alerta explícito.
- [ ] **Step 5: Garantir aviso não é condicional à vista.** O rótulo “AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS” permanece no DOM/visível em todos os estados.
- [ ] **Step 6: Rodar testes focados e suite.** Run: npm run test -- src/sections/BpoSection.test.tsx; npm run test. Expected: PASS.
- [ ] **Step 7: Lint/typecheck e commit.** feat(site): cria mesa de controle demonstrativa do BPO.

## Fase 8 — Processo e conteúdo/ferramentas secundários

### Task 8: Metodologia concisa e entrada para ferramentas

**Files:**
- Create: src/sections/ProcessSection.tsx, ProcessSection.module.css, ProcessSection.test.tsx.
- Create: src/sections/ToolsSection.tsx, ToolsSection.module.css, ToolsSection.test.tsx.
- Create: src/components/FutureProofBlocks.tsx e FutureProofBlocks.test.tsx para case e pessoa, sem integração na Home.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Produces: cinco etapas do processo como dados identificados como conceituais; categorias de ferramentas limitadas às encontradas na auditoria.
- Produces: CaseStudyBlock(context, intervention, result) e ContactPersonBlock(name, role, biography, image, imageAlt) tipados para conteúdo futuro; ambos ficam fora da árvore HomePage até receber material autorizado.
- Consumes: âncoras de contato existentes. Rotas não migradas não são simuladas nem apontam a #.

- [ ] **Step 1: Escrever testes RED.** Criar process_renders_five_conceptual_steps, tools_link_only_to_existing_destinations e future_content_blocks_render_supplied_content; afirmar ordem de cinco passos, categorias existentes, ausência de href="#"/calculadoras fictícias, ausência de case/perfil na Home sem dados e renderização dos blocos somente quando receberem props de conteúdo.
- [ ] **Step 2: Rodar testes focados.** Run: npm run test -- src/sections/ProcessSection.test.tsx src/sections/ToolsSection.test.tsx src/components/FutureProofBlocks.test.tsx. Expected: FAIL porque os componentes não existem.
- [ ] **Step 3: Implementar processo em superfície clara.** Cinco números, uma linha de ritmo e descrição curta; sem sticky, animação ou confirmação falsa de método oficial.
- [ ] **Step 4: Implementar ferramentas em bloco secundário.** Apresentar Simulador Tributário, calculadoras citadas e guias por categoria; CTA conduz a contato até que os destinos internos sejam migrados.
- [ ] **Step 5: Implementar os blocos futuros reutilizáveis.** Blocos renderizam apenas dados passados por props, exigem alt para foto informativa e não são importados em HomePage sem autorização/material real.
- [ ] **Step 6: Rodar testes e suite.** Run: npm run test -- src/sections/ProcessSection.test.tsx src/sections/ToolsSection.test.tsx src/components/FutureProofBlocks.test.tsx; depois npm run test; npm run lint; npm run typecheck. Expected: exit code 0.
- [ ] **Step 7: Commit.** feat(site): adiciona processo e entrada para ferramentas.

## Fase 9 — CTA final (momento essencial 5/5)

### Task 9: Convite final e destino WhatsApp

**Files:**
- Create: src/sections/FinalCtaSection.tsx, FinalCtaSection.module.css, FinalCtaSection.test.tsx.
- Modify: src/pages/HomePage.tsx.

**Interfaces:**
- Consumes: site.ts.
- Produces: CTA final em navy com convite humano e WhatsApp atual; nenhum formulário sem backend.

- [ ] **Step 1: Escrever teste RED.** Criar final_cta_uses_published_whatsapp_and_descriptive_label; afirmar URL correta e nome acessível que descreve a conversa.
- [ ] **Step 2: Executar teste focado.** Run: npm run test -- src/sections/FinalCtaSection.test.tsx. Expected: FAIL porque seção não existe.
- [ ] **Step 3: Implementar composição e ação.** Usar cópia-direção “Quer enxergar melhor o financeiro da sua empresa?” ou equivalente conciso; abrir wa.me com target seguro e rel noopener noreferrer.
- [ ] **Step 4: Rodar teste, lint e typecheck.** Expected: PASS e exit code 0.
- [ ] **Step 5: Commit.** feat(site): cria CTA final para conversar com a Kapitalis.

## Fase 10 — Polimento visual, responsividade e SEO base

### Task 10: Segunda passada visual e metadados

**Files:**
- Modify: src/sections/* e respectivos CSS Modules.
- Modify: src/components/SiteHeader.module.css, SiteFooter.module.css.
- Modify: src/styles/tokens.css, global.css.
- Modify: index.html.
- Create: public/robots.txt, public/sitemap.xml.

**Interfaces:**
- Consumes: todas as seções e tokens existentes.
- Produces: canonical configurável para https://kapitaliscontabilidade.com.br/ após validação de domínio; title, description, Open Graph title/description/url/type; Twitter card summary; favicon original; sitemap da home.
- Produces: nenhuma Organization/AccountingService JSON-LD enquanto dados legais/profissionais aguardam confirmação.

- [ ] **Step 1: Fazer revisão visual exclusiva.** Abrir navegador e revisar ritmo, espaçamento, alinhamento, tipografia, densidade, contraste, transições, repetição de cards, alturas e continuidade. Ajustar primeiro Hero, Problemas, Storytelling, BPO e CTA.
- [ ] **Step 2: Corrigir telas estreitas e desktop baixo.** Verificar 375×812, 390×844, 430×932, 768×1024, 1366×768, 1440×900, 1536×864 e 1920×1080; documentar quaisquer dimensões não exercitáveis pelo browser.
- [ ] **Step 3: Revisar motion/reduced motion.** Confirmar sem parallax excessivo, sem pointer falso, sem conteúdo dependente de hover; reduzir/transições removidas com prefers-reduced-motion.
- [ ] **Step 4: Testar interação por teclado.** Tab/Shift+Tab em ordem; Escape fecha menu e devolve foco; anchors funcionam; BPO muda vista; foco visível.
- [ ] **Step 5: Configurar SEO em index.html e public.** Canonical padrão informado em site.ts/HTML, mas tornar configurável; robots e sitemap somente para home. Se domínio www/não-www não for confirmado, manter a origem em um único token fácil de alterar e reportar pendência.
- [ ] **Step 6: Rever qualidade de assets, links e console.** Imagens têm dimensão explícita/lazy quando abaixo da dobra; validar links internos/externos, status de assets e logs sem erros.
- [ ] **Step 7: Rodar suite/lint/typecheck.** Run: npm run test; npm run lint; npm run typecheck. Expected: PASS/exit code 0.
- [ ] **Step 8: Commit.** fix(site): refina responsividade e acabamento da Kapitalis.

## Fase 11 — Verificação final de qualidade

### Task 11: Instalação limpa, build e checklist browser

**Files:**
- Modify: configurações e código somente se um defeito de verificação for reproduzido; manter testes primeiro para cada correção.
- Verify: package-lock.json cobre todas as dependências.

**Interfaces:**
- Consumes: home completa na Task 10.
- Produces: evidência de instalação limpa, lint, typecheck, testes, build, navegação, responsividade, teclado, reduced motion, links e console.

- [ ] **Step 1: Instalar de forma reproduzível.** Run: npm ci. Expected: instalação completa somente usando package-lock.json, exit code 0.
- [ ] **Step 2: Lint e types.** Run: npm run lint; npm run typecheck. Expected: ambos sem erros/warnings relevantes e exit code 0.
- [ ] **Step 3: Suite automatizada.** Run: npm run test. Expected: todas as suites e assertions passam.
- [ ] **Step 4: Build.** Run: npm run build. Expected: Vite produz dist sem erro; todo warning emitido é lido e explicado antes de seguir.
- [ ] **Step 5: Smoke test pelo preview.** Run: npm run preview -- --host 127.0.0.1. Validar home, caminhos de imagens, anchors e links; nenhum 404 de asset.
- [ ] **Step 6: Responsividade/interação com viewport browser.** Rever as oito dimensões especificadas, reduzir movimento, menu mobile, WhatsApp, estados BPO, capítulos e overflow horizontal.
- [ ] **Step 7: Inspecionar saída HTML sem JavaScript.** Confirmar que a seção noscript e os quatro textos/ordem dos capítulos estão presentes em dist/index.html.
- [ ] **Step 8: Registrar resultado e commit final.** Commit em português: chore(site): valida demo premium Kapitalis. Atualizar a lista de comandos e resultados no resumo final e publicar main.

## Método de execução

Execução Native (implementar task a task nesta sessão), na checkout existente em main. Essa é a leitura operacional da instrução explícita do cliente para trabalhar diretamente em main, sem criar branch. As interfaces visuais são sequenciais, com revisão em browser por fase; a independência de agente em cada bloco aumentaria conflitos e não substituiria a revisão final da experiência completa. Após a última task, fazer uma revisão final independente conforme o workflow de execução de planos, sem PR.

## Referências técnicas de bootstrap

- Guia oficial Vite: https://vite.dev/guide/ — template react-ts, uso de “.” na raiz e requisitos atuais de Node.
- TypeScript com React: https://react.dev/learn/typescript
- O ambiente auditado nesta sessão tem Node v24.14.1 e npm 11.11.0.
