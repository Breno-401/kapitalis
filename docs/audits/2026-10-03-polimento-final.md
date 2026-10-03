# Polimento final da Kapitalis — 03/10/2026

Rodada de auditoria Impeccable e correções pontuais, executada somente pelo agente principal. Identidade, copy, composição, cálculos, reviews, diagramas e motores existentes preservados.

## 1. Branch e HEAD inicial

- Origem: `experiment/kapitalis-bpo-compact`.
- HEAD inicial: `ef8a396ebc06b8f87681e42fb8e512b9f41be582`.
- Trabalho: `experiment/kapitalis-final-polish`, criada exatamente desse commit.
- Os itens não rastreados `.idea/` e `docs/superpowers/plans/2026-09-29-kapitalis-visual-correction.md` já existiam. Não foram alterados nem incluídos no commit.
- Sem alterações na main, merge, PR ou subagentes.

## 2. Auditoria e problemas encontrados

O sistema visual existente é coerente com o projeto. A inspeção cobriu Hero, capítulos 01–04, Reviews, Serviços, BPO, calculadoras, Processo, FAQ, CTA final, footer, navbar, WhatsApp e divisores. Não surgiu evidência que justificasse redesenhar geometria, cards, grids, fotos ou espaçamentos aprovados.

Foram encontrados **12 grupos de problemas reais: 9 corrigidos e 3 pendentes**. A contagem agrupa ocorrências com a mesma causa; não conta cada botão ou tag como um defeito separado.

| # | Prioridade | Evidência / impacto | Resultado |
|---|---|---|---|
| 1 | P1 | No light, fundos de hover dos CTAs usam o acento textual escuro com texto navy: contraste de 2,82–3,60:1. | Corrigido em Hero, navbar, CTA final e CTAs das ferramentas. |
| 2 | P1 | O botão Entendi usa navy sobre dourado escuro no estado padrão light: 3,60:1. | Corrigido somente no light; padrão dark preservado. |
| 3 | P1 | Texto auxiliar light `#687889` sobre papel `#f3f1ea`: 4,01:1; sobre `#e9e3d6`: 3,54:1. | Reutilizado o navy secundário já existente `#435263`. |
| 4 | P2 | Calculadoras saltam de H2 para H4 e H5. | H3 nos subtítulos, preservando exatamente o styling e a copy. |
| 5 | P2 | Retrato do CTA final carregado antecipadamente, sem dimensões intrínsecas. | Dimensões reais, lazy loading e decoding async. |
| 6 | P2 | Canonical ausente. | Incluída a URL já configurada em `src/data/site.ts`. |
| 7 | P2 | Robots meta e arquivo robots.txt ausentes. | Incluídos para produção. |
| 8 | P2 | Sitemap ausente. | Gerada somente a home canônica, sem anchors ou URLs inventadas. |
| 9 | P2 | Metadata de compartilhamento ausente. | OG e Twitter usando a marca original existente. |
| 10 | P2 | Favicon de 1536×1024, não quadrado, com 2.564.419 bytes. | Pendente: exportação adequada da marca aprovada. |
| 11 | P2 | O HTML entregue contém o root vazio; conteúdo principal aparece após executar React. | Pendente: avaliar prerender/SSR em rodada específica. |
| 12 | P2 | Assets originais pesados: logo 2,56 MB, retrato Hero 1,73 MB, escritório 1,17 MB; favicon duplica os bytes do logo em outra URL. | Pendente: otimização com revisão visual dos assets. |

P0: 0; P1: 3; P2: 9; P3: 0. Não foram criados problemas cosméticos para aumentar a quantidade de alterações.

Avaliação indicativa após as correções: acessibilidade 3/4, performance 3/4, responsividade 3/4, temas 4/4, integridade da implementação 4/4: **17/20**. Não equivale a certificação WCAG ou medição de Web Vitals em produção.

## 3. Alterações realmente aplicadas

Os três ajustes de maior impacto visual foram:

1. Hover dos CTAs com dourado claro da paleta existente: navy sobre `#e8d58f`, **12,52:1**. Um token de preenchimento evita confundir o acento usado em texto com o fundo de botões.
2. Textos auxiliares light com a cor secundária existente: **7,08:1** sobre o papel principal e **6,25:1** sobre a superfície `#e9e3d6`.
3. Botão Entendi light com dourado original no estado padrão e dourado claro no hover. O foco permanece explícito.

Também foram corrigidos os headings das calculadoras, a estratégia de carregamento do retrato final e os metadados/arquivos de launch. Nenhuma fórmula, regra tributária ou rotina de cálculo foi alterada.

## 4. Itens deliberadamente não alterados

- Favicon e mídia original: sem recorte, troca de formato, compressão ou geração de nova arte nesta rodada.
- Conteúdo inicial sem JavaScript: a solução exige uma decisão de renderização/build fora do polimento de baixo risco. O DOM após React contém as seções, headings e links esperados.
- Navbar, Hero, Sistema, Reviews, BPO e Processo mantêm seus motores e composição aprovados. A única alteração no CSS do Hero/navbar é o fundo do hover com contraste inadequado no light.
- Fades das fotos, divisores dourados, console compacto, pulso WhatsApp, duração das entradas e fluxo mobile preservados.
- A animação global de reduced motion de `0.01ms` já existente foi mantida como fallback; componentes e hooks possuem alternativas estáticas específicas.
- O detector Impeccable retornou um aviso `layout-transition` na calculadora tributária. A ocorrência é `transition: stroke-width` em um SVG, não animação de largura do layout. É uma transição curta acionada por interação, já existente; não foi tratada como defeito novo nem removida.
- Não foram adicionados DESIGN.md/PRODUCT.md, dependências, fontes ou motores de animação.

## 5. Arquivos modificados

- `index.html`: canonical, robots e metadata social.
- `public/robots.txt` e `public/sitemap.xml`: artefatos de produção.
- `src/styles/tokens.css`: token de hover de preenchimento e contraste dos textos auxiliares light.
- `src/components/PrivacyNotice.module.css`: contraste do botão light.
- `src/components/SiteHeader.module.css`: contraste dos hovers de CTA.
- `src/sections/HeroSection.module.css`: contraste do hover do CTA.
- `src/sections/FinalCtaSection.module.css`: contraste do hover do CTA.
- `src/sections/FinalCtaSection.tsx`: dimensões e carregamento da foto.
- `src/calculators/shared/FinancialToolShell.module.css`: contraste do hover de CTA.
- `src/calculators/taxSimulator/TaxSimulator.tsx` e `.module.css`: headings sem mudança visual.
- `src/calculators/complementary/ComplementarySimulator.tsx` e `.module.css`: heading sem mudança visual.
- Este relatório.

## 6. Validação dark/light

Inspeção visual de desktop e mobile, com conferência de estilos computados e estados no navegador. Conteúdo, superfícies, fotos, divisores, diagramas e hierarquia visual preservados. O hover do CTA Hero light foi exercitado com ponteiro e confirmou `rgb(232, 213, 143)` no fundo, `rgb(5, 21, 41)` no texto.

Validação no servidor de desenvolvimento e no build servido pelo Vite preview. Sem erros/warnings de console no preview observado. As capturas de desktop foram redimensionadas pelo navegador integrado; a análise de medidas usa também geometria do DOM, sem alegar precisão óptica de 2 px a partir dessas capturas.

## 7. Viewports testadas

| Viewport | Dark: overflow horizontal | Light: overflow horizontal |
|---|---|---|
| 390×844 | Ausente | Ausente |
| 402×874 | Ausente | Ausente |
| 430×932 | Ausente | Ausente |
| 1024×768 | Ausente | Ausente |
| 1366×768 | Ausente | Ausente |
| 1440×900 | Ausente | Ausente |
| 1600×900 | Ausente | Ausente |
| 1920×1080 | Ausente | Ausente |

Todos passaram pela conferência de viewport efetiva, largura do documento e largura das principais seções. A inspeção visual detalhada e de controles concentrou-se em 390×844 e 1440×900. É emulação de viewport no navegador integrado, sem aparelho físico.

## 8. Performance e motion

- Nenhuma dependência, fonte, script de terceiro, engine ou listener novo.
- Reveal mantém um único IntersectionObserver e fallback visível; movimento reduzido interrompe entradas.
- Reviews continuam usando transform por requestAnimationFrame, sem setState por frame, com pausa fora da viewport/página oculta e em reduced motion. Drag finaliza sem deixar o estado ativo.
- Hero mantém carregamento prioritário sem lazy; conteúdo abaixo da dobra mantém lazy apropriado. O retrato final agora reserva proporção antes de carregar.
- Sem downloads de fontes duplicadas: a stack existente usa Georgia e fontes de sistema, com Inter como primeira opção local.
- Build: JS 356,83 kB / gzip 106,80 kB; CSS 140,48 kB / gzip 24,90 kB. As imagens originais são o principal ponto para uma rodada futura.
- Não foram medidos LCP, INP, CLS de campo ou frames em dispositivos físicos; ausência de overflow não comprova Web Vitals.

## 9. Acessibilidade e interações

- Um H1 principal; headings das ferramentas em ordem lógica, com tipografia inalterada.
- Skip link e focus-visible preservados; anchors internos têm destino existente.
- Menu móvel: abrir, trocar tema, fechar com Escape e retorno de foco ao acionador conferidos.
- FAQ: seleção de resposta, aria-expanded e aria-controls conferidos; comportamento de painel único preservado.
- BPO: Recebimentos selecionado por clique; ArrowRight seleciona Fechamento. Sem alterações no console.
- Serviços: abertura do card e aria-expanded conferidos no build; conteúdo e links mantidos.
- Reviews: drag com ponteiro sintetizado conferido; `touch-action: pan-y` e tratamento de cancelamento presentes. Não houve teste com toque físico ou eventos touch sintetizados.
- Imagens relevantes têm alt; retrato final decorativo mantém alt vazio e ancestral aria-hidden.
- Links externos em nova aba possuem noopener noreferrer. Telefone/e-mail não foram acionados.
- Reduced motion conferido em CSS/hooks e testes existentes; preferência de mídia não foi emulada nesta sessão.

## 10. Testes e verificação

- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm run build`: aprovado.
- `npm test -- --maxWorkers=1`: **22 arquivos, 145 testes aprovados**.
- `git diff --check`: aprovado.
- Detector Impeccable executado uma vez sobre os arquivos alterados; único aviso analisado no item 4.
- Preflight do HTML construído: domínio alinhado com `site.websiteUrl`, canonical único, title único, metadata sem duplicatas, OG/Twitter, idioma, robots e sitemap válidos, caminhos de assets existentes, nenhuma URL localhost nos artefatos de SEO.
- HTTP do preview: home, robots, sitemap, favicon, marca social e retrato final retornam 200 com MIME correspondente.
- URLs externas configuradas de domínio, WhatsApp, Google, Instagram e Facebook responderam 200. Isso confirma resposta HTTP, não o comportamento de contas/login ou a entrega de mensagens; Facebook/WhatsApp fazem seus redirecionamentos normais.

## 11–13. Commit, HEAD final e push

Entrega em um único commit: `polimenta acabamento geral da landing`.

Destino exclusivo: `origin/experiment/kapitalis-final-polish`. Hash final e confirmação do push são apresentados na resposta de entrega, após verificar o remoto, pois não é possível gravar o hash do próprio commit dentro deste arquivo sem alterar esse hash. Sem PR, merge ou deploy.

## 14. SEO técnico e social / launch

- Title e description existentes preservados; nenhum texto comercial foi alterado por SEO.
- Domínio confirmado no projeto: `https://kapitaliscontabilidade.com.br/`, também respondeu HTTP 200. Canonical/og:url/sitemap usam exatamente essa origem.
- Robots de produção: `index,follow`, `User-agent: *`, `Allow: /`, referência ao sitemap real. Sitemap contém apenas a home, sem lastmod inventado ou URLs de calculadoras/anchors.
- `lang="pt-BR"`, viewport e landmarks main/nav/footer existentes preservados.
- OG: title, description, type website, URL, site_name, locale pt_BR, imagem, MIME, dimensões e alt.
- Imagem social reutilizada: `/assets/kapitalis-logo-original.png`, PNG real de **1536×1024**, 2.564.419 bytes. Foi visualmente inspecionada e representa a marca; não foi criada arte OG nova. O tamanho merece exportação futura mais leve.
- Twitter: summary_large_image, title, description, imagem e alt; sem inventar usuário/conta social.
- Favicon funciona no preview, mas precisa de exportação quadrada leve para launch.
- Sem anchors quebrados ou links externos inseguros encontrados. Sem metadata duplicada.
- Os novos caminhos OG/robots/sitemap foram validados no build local. A disponibilidade desses novos arquivos e o preview social no domínio público precisam ser conferidos **após um deploy autorizado**; o domínio atual não recebeu esta branch.
- Previews públicos devem receber política noindex no ambiente de hospedagem; os arquivos adicionados aqui representam produção. Não foi configurada hospedagem nem publicado preview remoto.
- Prerender/SSR continua sendo uma pendência para entregar conteúdo importante também no HTML inicial sem JavaScript.

## 15. Breno Web Library

Consulta realizada antes da implementação, no checkout existente `breno-web-library`.

| Componente / motor / padrão consultado | Uso nesta rodada | Motivo |
|---|---|---|
| Reveal / RevealGroup | Sem importação | Kapitalis já tem um observer compartilhado, markup visível por padrão, foco que revela conteúdo e transforms preservados. Trocar por wrappers/observers individuais aumentaria a implementação. |
| TextAnimate vendored / SplitText adaptado | Sem importação | TextAnimate requer motion/Tailwind; SplitText segmenta palavras e muda a entrada aprovada. Não há benefício nesta rodada. |
| SectionTransition | Sem importação | O fio dourado local e suas transições já são específicos da identidade e estão aprovados. |
| MagneticTarget | Sem importação | Adicionaria um comportamento que não corrige defeito observado. |
| PremiumAction | Sem importação | Botões existentes já têm semântica, foco e microinterações. O problema real foi resolvido nos tokens, sem substituir componentes. |
| PointerSurface / InteractiveSurface | Sem importação | Ponteiro do Hero já possui implementação específica; tilt, glow e cursor customizado não são necessários. |
| PremiumNavigation / FloatingPillNav | Sem importação | Navbar local aprovada; a documentação confirma que FloatingPillNav foi extraída da própria Kapitalis. Reimportá-la seria uma migração circular sem benefício. |
| FooterComposition / MediaFrame / MediaStage | Sem importação | Footer, recortes e fades locais já atendem à composição; abstrações não simplificariam as correções feitas. |
| Accessibility foundation | Referência | Skip link, foco nativo, semântica e reduced motion locais já possuem os contratos adequados. Mantidos. |
| Performance foundation | Referência | Usada para delimitar evidências e pendências; não confundir inspeção local com métricas de campo. |
| SEO launch.ts, metadata/produção, receita production-seo-basic e templates | Reuso dos helpers de produção | `renderRobotsTxt`, `renderSitemapXml` e `validateProductionSeo` foram executados diretamente da library para gerar/validar os artefatos estáticos e conferir o build. |

Nenhuma dependência ou importação de runtime da library foi adicionada. A Kapitalis continua funcionando e construindo de forma independente. Não foi criado um novo motor de SEO, reveal, cursor ou animação.
