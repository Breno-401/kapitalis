# Motion global da landing — 02/10/2026

Branch: `experiment/kapitalis-process-editorial`.
Base: `0abb94f30f32927cc209c833f37f580c38b20d90`.

## Mecanismo e reaproveitamento

`src/motion/landingReveal.ts` é a única abstração nova de entrada. Usa um
IntersectionObserver compartilhado, chamado por `useLayoutEffect` em HomePage,
e atributos de DOM. Não usa estado por frame nem dependências adicionais.

Foram reaproveitados os marcadores `data-entry` do Hero, SectionHeading, os
frames editoriais com overflow/clipping e a estrutura existente dos componentes.
As entradas antigas e mais longas do Hero e a entrada de mídia ligada ao capítulo
ativo foram consolidadas em `src/styles/motion.css`. Atmosfera, indicador de
scroll, diagramas, carousel, flip, hover, calculadoras e Processo mantêm seus
mecanismos próprios.

O observer usa `threshold: 0.08` e `rootMargin: "0px 0px -10% 0px"`.
Grupos de texto compartilham o alvo; cards empilhados são observados
individualmente. Cada alvo é desregistrado ao entrar. Quando não há pendências,
o observer é desconectado. A volta no scroll não rearma entradas.

## Linguagem e timings

Easing comum: `cubic-bezier(.16, 1, .3, 1)`.

| Elemento | Atraso | Duração | Entrada |
| --- | ---: | ---: | --- |
| Navbar | 0ms | 400ms | opacity + 8px |
| Eyebrow do Hero | 100ms | 400ms | opacity + 16px |
| Linhas da headline | 150 / 210ms | 500ms | opacity + 16px |
| Descrição do Hero | 250ms | 450ms | opacity + 16px |
| CTAs do Hero | 320ms | 430ms | opacity + 16px |
| Diagrama do Hero | 250ms | 550ms | opacity + 16px + scale .985 |
| Retrato do Hero | 300ms | 500ms | opacity + 16px + scale .985 |
| Indicador SCROLL | 500ms | 400ms | opacity + 16px |
| Texto de seção | passos de 70ms | 650ms | opacity + 22px |
| Cards de Serviços | 140 / 225 / 310ms | 680ms | opacity + 24px + scale .985 |
| Mídia/retrato | passos de 70ms | 720ms | opacity + 16px + scale .985 |
| Imagens editoriais | 140ms | 720ms | frame fade/16px + imagem 1.025 → 1 |
| Footer/grupos discretos | passos de 70ms | 550ms | opacity + 12px |

O Hero está estabelecido em aproximadamente 900ms. Não há entrada de letras
individuais. Os três cards assentam com 85ms entre eles no desktop. No mobile,
cada card desperta ao se aproximar, com 70ms de atraso, 14px e 600ms.
Texto usa 14px/600ms; mídia usa 12px/650ms. O Hero usa 12px e a navbar 6px.
A centralização horizontal original do indicador SCROLL é preservada durante
a animação e depois dela.

Sistema 01–04: eyebrow, título, descrição e tópicos em sequência; mídia com
entrada única. O reveal não remonta nem reinicia o diagrama interno.
Reviews: intro, prova Google e frame do track; o motor do track não foi alterado.
BPO: copy seguida do workspace inteiro. Ferramentas: título, inputs/seletor e
dashboard como agrupamentos, sem animar valores após interação. Processo:
somente a introdução recebe o reveal global; hooks e CSS internos ficam intactos.
FAQ: título e perguntas com passos de 70ms; accordion preservado. CTA final:
copy em sequência curta e retrato com micro-scale. Footer: grupos, sem entrada
individual de links. WhatsApp mantém o pulso existente.

## First paint, fallback e reduced motion

O markup e o CSS padrão são visíveis. Somente a inicialização bem-sucedida arma
`pending`/`visible`, de forma síncrona antes do primeiro paint do conteúdo React.
Não há efeito tardio que mostre, esconda e volte a mostrar o conteúdo. A animação
usa preenchimento `backwards`, sem manter transformações após terminar.

Se IntersectionObserver estiver ausente ou sua configuração falhar, os estados
são removidos e o conteúdo fica visível. O projeto já depende de JS para montar
React; esta camada não adiciona ocultação permanente ao fallback.

Com `prefers-reduced-motion: reduce`, o controller não arma as entradas e o CSS
não aplica a camada de movimento. Uma mudança de preferência durante a sessão
conclui todos os alvos e desconecta o observer. Foco de teclado em um alvo pendente
também o torna visível imediatamente.

## Validação de movimento no navegador

Foram observados refresh, progressão de opacidade/deslocamento/scale durante
a entrada, scroll e volta no scroll. Screenshots foram usadas como apoio;
a validação incluiu amostras intermediárias das animações reais no navegador.

| Viewport | Tema | Verificação |
| --- | --- | --- |
| 390×844 | Claro | Hero e scroll contínuo até o footer; cards empilhados |
| 402×874 | Escuro | Hero, cards empilhados, volta no scroll e indicador centrado |
| 1366×768 | Claro | Refresh/Hero e entrada de Serviços |
| 1440×900 | Escuro e claro | Landing inteira, retorno, imagens, Serviços e troca de tema |
| 1600×900 | Claro | Refresh/Hero e entrada de Serviços |
| 1920×1080 | Claro | Refresh/Hero e entrada de Serviços |

Na travessia completa em 1440×900, todos os 73 alvos terminaram revelados,
sem pendências no final. No retorno, cards e imagens permaneceram completos,
com opacity 1 e sem nova animação. A navbar também não repetiu sua entrada.
No mobile, foram observados primeiro card visível e seguintes pendentes,
seguido da entrada dos demais conforme o scroll. Não foi observado overflow
horizontal nos viewports conferidos.

Uma amostra final do Hero confirmou: navbar primeiro, eyebrow depois,
headline em duas linhas, descrição/CTAs, retrato/diagrama e SCROLL.
Por volta de 300ms, opacidades intermediárias eram ~.93/.83 nas linhas,
~.75 na descrição, ~.25 nos CTAs e ~.41 no retrato; todos estavam completos
na amostra de aproximadamente 900ms. Esses tempos são amostras de observação,
não uma medição de FPS.

Reduced motion foi conferido em 402×874 e 1440×900 por uma página temporária
que forçou as condições JS e CSS reais: 73 alvos visíveis, zero pendências e
zero animações de entrada. Flip e FAQ continuaram operáveis. O fallback sem
IntersectionObserver também mostrou os 73 alvos sem ocultação. A página
temporária foi removida antes do build/commit.

Limitação: o navegador integrado não oferece emulação nativa de
`prefers-reduced-motion`. A verificação visual usou substituição controlada
das consultas nessa página de QA, acompanhada de testes unitários da preferência
inicial e da mudança em tempo de execução; não foi uma alteração do sistema
operacional nem uma validação nativa dessa preferência no navegador.

O build de produção também foi aberto no navegador via Vite preview:
Hero com estados/opacidades intermediários, Serviços com atrasos de
140/225/310ms e nenhum erro de runtime registrado nessa conferência.

## Checks e arquivos

`npm run typecheck`, `npm run lint`, `npm run build` e `git diff --check` passaram.
Testes focados: 107 testes em 15 arquivos passaram, cobrindo controller, landing,
Hero, Sistema/mídia, navbar, footer, Reviews, Serviços, BPO, ferramentas,
Processo, FAQ e CTA final. Detector Impeccable: nenhum apontamento.

O teste antigo de tamanho da marca do FinancialCore esperava 72px, embora o
HEAD já usasse 76px. A falha foi reproduzida no código original e a expectativa
foi atualizada para 76px; o diagrama não foi redimensionado. O header interno
do Processo recebeu `role="presentation"` para não disputar o landmark banner
com a navbar; composição e lógica editorial foram preservadas.

Arquivos desta rodada:

- `src/motion/landingReveal.ts`
- `src/motion/landingReveal.test.ts`
- `src/styles/motion.css`
- `src/main.tsx`
- `src/pages/HomePage.tsx`
- `src/components/FinancialCore.tsx`
- `src/components/FinancialCore.test.tsx`
- `src/components/SectionHeading.tsx`
- `src/components/SiteHeader.tsx`
- `src/components/SiteFooter.tsx`
- `src/sections/HeroSection.tsx`
- `src/sections/HeroSection.module.css`
- `src/story/StoryChapter.tsx`
- `src/story/StoryMedia.tsx`
- `src/story/StorySection.module.css`
- `src/sections/ReviewsSection.tsx`
- `src/sections/ServicesSection.tsx`
- `src/sections/BpoSection.tsx`
- `src/sections/ToolsSection.tsx`
- `src/calculators/shared/FinancialToolShell.tsx`
- `src/sections/ProcessSection.tsx`
- `src/sections/FaqSection.tsx`
- `src/sections/FinalCtaSection.tsx`
- `docs/motion-global-validation.md`
