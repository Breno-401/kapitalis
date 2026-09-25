# Especificação visual e de experiência — demo Kapitalis

**Data:** 25 de setembro de 2026
**Estado:** direção e especificação aprovadas pelo cliente; ajustes de mídia substituível, motor reutilizável e prioridade de esforço incorporados para o plano técnico.

## Objetivo

Criar uma home demonstrativa, apresentável em uma reunião comercial da Breno Web com a Kapitalis. A página deve tornar visível a relação entre contabilidade, operação financeira e decisão empresarial. A demo prioriza direção visual, narrativa, responsividade e interações; não pretende substituir o site todo nem publicar conteúdo ainda não validado pelo cliente.

**Promessa de experiência:** dados de fontes diferentes entram; a Kapitalis organiza rotinas e obrigações; informação financeira ganha forma; o empresário consegue conversar sobre decisões com mais clareza.

**Público:** empresários que precisam de contabilidade, gestão financeira ou orientação tributária e querem entender melhor a operação.

**Critério de sucesso:** em uma call, a pessoa reconhece a marca Kapitalis, entende o que o escritório organiza, percorre uma demonstração visual convincente de BPO e consegue iniciar contato sem encontrar métricas, cases ou credenciais inventadas.

## Auditoria da presença atual

### Identidade e informação reaproveitáveis

- Nome de apresentação usado no site: **Kapitalis Contabilidade & BPO Financeiro**.
- Marca existente: selo circular raster com lettering, caduceu, dourado e navy. Será usado sem redesenho. O arquivo tem ruído/artefatos visuais no fundo; limitar seu tamanho e não ampliá-lo como textura ou imagem de hero. Uma variante vetorial ou transparente deve ser solicitada à Kapitalis para produção final.
- Cores CSS encontradas ao vivo no site: navy **#051529**, variação profunda **#051428** e dourado **#D4AF37**. O site também usa superfícies brancas e cinzas. A página consultada usa Inter no corpo e uma pilha serifada no H1.
- Contato publicado diretamente no site: telefone **+55 27 99882-9289**, WhatsApp **https://wa.me/5527998829289**, e-mail **alexsander@kapitaliscontabilidade.com.br**, Instagram **@Kapitalis_contabilidade**, Facebook **AlexsanderCarrara**. O site também aponta para avaliações no Google, sem exibir nota ou contagem verificável.
- Localidade publicada: **Vila Velha — ES**. Usar apenas a localidade até confirmação do endereço completo.
- Escopo encontrado: abertura de empresa e regularização; contabilidade mensal para Simples Nacional, Lucro Presumido e Lucro Real; BPO Financeiro (contas a pagar/receber, conciliação, fluxo de caixa e relatórios); departamento pessoal e folha; planejamento tributário; IRPF; MEI; consultoria empresarial, indicadores e precificação.
- Ferramentas presentes: Simulador Tributário 360º e calculadoras de pró-labore, custo CLT, rescisão, hora extra, Simples Nacional e Fator R. Não reutilizar fórmula nem resultado sem validação contábil.
- Páginas no sitemap observado: início, guia do empreendedor, blog, BPO Financeiro, certificado digital e política de privacidade. A nova demo cobre a home; não promete migração dessas páginas.

### Descartado

- Composição, navegação, hierarquia, cards, espaçamento, hero e arquitetura visual do site atual.
- Imagens genéricas de escritório, claims de “excelência” não demonstrados, texto promocional genérico e conteúdo de blog sem validação editorial.
- Favicon Vite atual, que responde com HTML da aplicação e não é um ícone válido.
- A nota, a quantidade ou citações de avaliações; o site oferece somente um link para avaliações.
- Qualquer métrica de clientes, economia, faturamento, crescimento ou resultado.

### Confirmações pendentes do cliente

1. CNPJ **61.214.153/0001-26**: consta no site, mas precisa de confirmação antes de aparecer na demo ou em dados estruturados.
2. Nome civil e credencial do responsável contábil: o site mostra “Alexsander Carrara” e “CRC ES-024423/O2”; o registro público consultado indica “Alexsander Carrara da Silva” e “ES-024423/O”. Confirmar nome legal e inscrição vigente. Não publicar nome/CRC até resolver a divergência.
3. Endereço completo e autorização para publicá-lo.
4. Qual e-mail é o canal comercial atual: a página ao vivo consultada é consistente com o endereço kapitaliscontabilidade.com.br, mas um resultado indexado exibiu um endereço antigo em outro domínio.
5. Processo real de onboarding/atendimento, sequência de fechamento e escopo exato do BPO.
6. Avaliações Google (URL correta, nota/contagem atual e permissão para uso de citações), clientes, logos e cases autorizados.
7. Biografia, responsabilidades, equipe e fotografia original de quem representa o escritório.
8. Se política de privacidade, analytics, pixels e consentimento do site atual continuam válidos para a nova presença.
9. Redirecionamentos, domínio canônico e nomenclatura comercial/legal definitiva.

### Placeholders da demo

- Toda quantia, saldo, tarefa e estado no painel BPO é **dado demonstrativo fictício**, não resultado da Kapitalis. Mostrar esse aviso dentro do painel durante toda a interação.
- Headline e microcopy são direção editorial temporária, sujeita à aprovação do cliente.
- Etapas de processo são uma hipótese de apresentação baseada no briefing, aguardando validação operacional.
- Componente de case permanece implementado como estrutura reutilizável, porém não entra na home enquanto não houver um case autorizado.
- Componente para responsável/equipe permanece preparado, sem nome, credencial, foto ou biografia no conteúdo renderizado até confirmação.
- Conteúdo e ferramentas exibem apenas categorias encontradas. Não há cálculo real, fórmula fiscal, artigo inventado nem link para rota ausente.

## Direção aprovada

### “Mesa de Controle Financeira”

A identidade nasce da Kapitalis: navy e dourado são preservados e refinados em uma linguagem de organização, precisão e confiança. A página alterna navy institucional e superfícies off-white. O navy pode ocupar áreas extensas; o dourado é um código de estado e atenção, reservado a progresso, seleção, dado-chave e linhas de conexão. Não usar dourado como acabamento repetido, glow ou sinal genérico de luxo.

O hero pode usar navy profundo como plano dominante: marca clara, headline editorial, texto curto, CTA de alto contraste e console financeira própria. A console deve parecer uma representação operacional do serviço, não um dashboard SaaS genérico. Valores demo recebem rótulo ostensivo “AMBIENTE DEMONSTRATIVO · DADOS FICTÍCIOS”.

### Escala cromática inicial

Valores existentes observados no site: **navy #051529**, **navy profundo #051428**, **dourado #D4AF37**. Os demais valores abaixo são extensões propostas da paleta observada e podem ser afinados após revisão no browser; não substituem as cores de origem.

| Token | Valor proposto | Uso |
|---|---|---|
| Navy principal | #051529 | Marca, texto escuro e superfícies institucionais |
| Navy profundo | #03101E | Hero/CTA/footer em contraste alto |
| Navy de superfície | #0D2239 | Painéis sobre navy |
| Navy elevado | #183650 | Nível secundário de painel/contorno |
| Dourado principal | #D4AF37 | Cor original; progresso, estado selecionado e detalhe |
| Dourado suave | #E8D58F | Realce sobre navy, sem texto pequeno em fundo claro |
| Dourado translúcido | rgba(212,175,55,.16) | Fundo de marcador/linha de fluxo |
| Off-white | #F3F1EA | Seções e superfícies claras |
| Branco | #FFFFFF | Painéis e campos em área clara |
| Cinza de texto | #435263 | Texto secundário em fundo claro |
| Cinza de apoio | #87919B | Metadados, usando contraste validado |
| Borda clara | #D9DCD8 | Divisórias em papel |
| Borda escura | rgba(243,241,234,.16) | Divisórias sobre navy |
| Estado positivo | #7FA18A | Conciliação/rotina concluída |
| Estado atenção | #C69B55 | Vencimentos/atenção, sem imitar o dourado de marca em excesso |
| Estado crítico | #B77773 | Pendência crítica; sempre acompanhada por texto/ícone |

Dourado não será usado sozinho como texto de corpo sobre off-white: contraste insuficiente. Estados financeiros terão texto/ícone e não dependerão só de cor.

### Tipografia, grid e forma

- Títulos editoriais em serifada de sistema (a presença atual já usa serif no H1) e interface em sans-serif de sistema priorizando Inter. Não carregar fonte externa no primeiro passe.
- Um container fluido com máximo aproximado de 1.280 px, grid de 12 colunas em desktop, gutters responsivos e alinhamento comum entre seções.
- Espaçamento baseado em múltiplos de 4 px; raios discretos de 8–20 px; linhas de 1 px. Superfícies serão separadas por ritmo, contraste e hierarquia, não por card repetido ou sombra generalizada.
- Tokens globais para cor, tipo, espaçamento, largura, raio, borda, sombra mínima, duração e easing.

## Arquitetura narrativa da home

1. **Header:** lockup original em versão clara/escura conforme a superfície; navegação por âncoras; CTA de contato discreto. Desktop compacto. Mobile com menu acessível de verdade.
2. **Hero navy:** headline-direção “Seus números sob controle. Suas decisões com mais clareza.”; subheadline de uma frase; CTA WhatsApp e âncora para conhecer o sistema; interface financeira compacta à direita. Altura responde ao conteúdo e à altura da janela, sem depender de um hero de 100vh.
3. **Faixa de contexto:** nomes de serviço e localidade, sem contagem ou alegação. Link para avaliações Google sem score, se a URL oficial continuar válida.
4. **Problemas do empresário:** composição editorial clara com perguntas reais sobre sobra, caixa, tributos, pagamentos e previsibilidade; sem “por que escolher” e sem oito cards uniformes.
5. **Sistema Kapitalis / storytelling assinatura:** quatro capítulos conectados: fontes financeiras → rotinas organizadas → informação útil → decisão. Um visual sticky acompanha o capítulo em desktop; texto e mídia mudam de maneira coordenada. A demo usa cenas 2D próprias, mas o motor aceita cada capítulo com mídia independente, inclusive fotografia editorial aprovada no futuro. O diagrama mostra fontes reais de trabalho e saídas coerentes com os serviços.
6. **Serviços:** três pilares editoriais: Contabilidade; BPO Financeiro; Tributário e empresarial. Cada pilar lista apenas atividades identificadas na auditoria.
7. **BPO / produto financeiro:** painel demonstrativo em navy com pagamentos, recebimentos, fluxo/compromissos e fechamento. Controles alternam a vista entre rotinas; nenhuma fórmula tributária ou integração real é sugerida.
8. **Processo:** cinco passos conceituais (entender operação, organizar dados, assumir rotinas, entregar informação, acompanhar decisões), identificados internamente como pendentes de validação.
9. **Case:** estrutura componente contexto → intervenção → resultado, não renderizada até obter dados e autorização reais.
10. **Quem acompanha:** slot de layout preparado para responsável/foto/história; seção só será renderizada após validação da pessoa e do material.
11. **Conteúdo/ferramentas:** entrada curta em categorias existentes (simuladores, rotina de empresa e departamento pessoal); direcionar apenas a rotas existentes ou contato, sem links mortos ou calculadoras fingidas.
12. **CTA final:** convite direto para conversar sobre a situação financeira atual, apontando ao WhatsApp real publicado.
13. **Footer:** navegação, serviços, localidade, telefone/WhatsApp, e-mail e redes atuais do site. Excluir CNPJ, CRC, endereço detalhado e política até validação.

## Hierarquia de esforço

O tempo visual e de interação concentra-se nos cinco momentos que sustentam a apresentação:

**Prioridade essencial:** Hero; Problemas/contexto; Sistema Kapitalis/storytelling; BPO/Mesa de Controle; CTA final. Esses momentos recebem as composições próprias, maior refinamento tipográfico e a revisão iterativa de movimento e responsividade.

**Suporte bem resolvido:** Header e footer (discretos, íntegros e acessíveis); serviços (editoriais); processo (simples); conteúdo/ferramentas (secundários). Não criar movimento ou painel decorativo só para preencher essas áreas.

**Preparado, não publicado:** case e pessoa/equipe. As estruturas ficam disponíveis para conteúdo aprovado, mas não são renderizadas sem material real. Se houver escolha entre acrescentar interação secundária e refinar Hero, Storytelling ou BPO, a prioridade é refinar esses três momentos.

## Interação por scroll e movimento

### Sistema Kapitalis: capítulos coordenados

Essa será a única sequência sticky de storytelling da home, agrupando o sistema e as quatro etapas. Em desktop, uma peça visual fixa na área central muda de estado quando o capítulo correspondente entra na região ativa. Fontes aparecem nas bordas, linhas conectam-se ao núcleo Kapitalis e o estado final organiza as saídas e destaca “decisão”. Movimento curto e funcional, ligado a organização e fluxo.

O motor de interação e o modelo de capítulos serão independentes. Conceitualmente, StorySection recebe capítulos; StoryChapter descreve identificador, texto e mídia; StoryMedia escolhe entre uma cena visual Kapitalis ou uma imagem editorial com texto alternativo; StoryProgress mantém somente o estado ativo necessário. Os nomes podem mudar na implementação, mas a fronteira deve ser preservada. Textos, imagens e diagramas ficam nos dados dos capítulos, nunca embutidos na lógica de progressão. Assim, uma narrativa futura de origem → crescimento → atuação → resultado ou de problema → intervenção → resultado troca os dados e as mídias sem reescrever sticky, progresso e transições.

Na demo, o adaptador visual usa cenas 2D próprias; uma mídia fotográfica será um tipo de conteúdo intercambiável, não uma exceção acoplada à cena financeira. O cliente ainda não forneceu fotos, portanto nenhuma foto de banco será usada.

Implementação prevista com estrutura semântica de capítulos e CSS para composição/clipping/escala discreta. JavaScript observa a entrada dos capítulos com IntersectionObserver e atualiza o capítulo ativo; não há leitura contínua do scroll, WebGL, canvas, vídeo, partículas, ou biblioteca grande de animação. Sem JavaScript, texto e mídia de cada capítulo ficam em sequência estática e legível. Mobile abandona sticky/scroll progressivo e apresenta capítulos verticais com a respectiva mídia junto ao texto.

### Sistema global

- Reveal: opacidade e deslocamento curto; aplicado somente a grupos de conteúdo.
- Hover: alteração de cor/borda/ícone e deslocamento pequeno; links continuam identificáveis sem hover.
- Menu, BPO e progressão dos capítulos: mudanças de estado explícitas, sem bounce ou parallax exagerado.
- Ponteiro customizado: não previsto; não melhora navegação contábil/financeira nem substitui cursores nativos.
- prefers-reduced-motion: desativa reveals e transições não essenciais; o conteúdo e os quatro estados continuam acessíveis sem movimento.
- Animações usam transform/opacity e são desativadas em touch quando o benefício depende de ponteiro.

## Responsividade e acessibilidade

- Mobile é uma composição própria em uma coluna: header/menu com alvo confortável; headline/CTA antes da peça de produto; painel financeiro reconfigurado; capítulos estáticos; serviços em blocos editoriais.
- Validar 375×812, 390×844, 430×932, 768×1024, 1366×768, 1440×900, 1536×864 e 1920×1080. Hero deve ajustar composição em telas desktop de pouca altura.
- Skip link, header/nav/main/footer semânticos, uma ordem H1–H2–H3, anchors reais, foco visível, contraste validado, texto alternativo para imagens informativas.
- Menu mobile: botão semântico com aria-expanded/controls, fecha por Escape e após selecionar âncora, foco devolvido ao acionador; nenhuma navegação fica disponível só por hover.
- Controles de BPO usam botões semânticos com estado selecionado anunciado; todo conteúdo das vistas tem equivalente legível para leitor de tela.

## SEO, dependências e desempenho

- Base: title, descrição, canonical configurável para o domínio aprovado, Open Graph, Twitter card, favicon real e headings semânticos. robots.txt e sitemap cobrem somente a home na demo.
- Não publicar dados estruturados fiscais ou profissionais até confirmar identidade legal, CNPJ e CRC. Organization/AccountingService só usa campos validados.
- Substituir o favicon Vite. Não redesenhar o logo; confirmar qualidade/transparência do original. Manter o asset original sem tratamento destrutivo.
- Stack: Vite + React + TypeScript; CSS Modules e folhas globais de tokens. SVG/CSS próprios para diagramas. Sem Tailwind, GSAP, vídeo, canvas, imagens stock ou dependência de animação.
- Baixo peso, sem fonte remota, sem recursos externos para a visualização financeira; imagens abaixo da dobra com carregamento tardio quando houver material real.
- Interações permanecem funcionais sem efeitos de hover e com movimento reduzido. Evitar listeners globais de scroll e trabalho por frame.

## Referências investigadas e decisões

- **Decimal** — hierarquia simples de headline/CTA com uma interface financeira de pequenas linhas operacionais. Reaproveitar clareza e a relação equilibrada de texto com UI; descartar ilustrações/paleta/claims próprios da Decimal.
- **Hiline** — DOM mostra seção de sistema com um grupo de oito imagens que converge para um centro via GSAP/ScrollTrigger. Bundle público observado: timeline com trigger da área antes da animação, scrub 3, scale final pequeno, rotações pré-computadas e stagger de 0,03 s; outra timeline espalha as peças. Reimplementar apenas o princípio de entradas que se conectam, com estados semânticos 2D e IntersectionObserver, sem código/arte GSAP.
- **Linear** — menus de produto observados no desktop (dropdown em colunas) e mobile (painel vertical), superfície e hierarquia precisas. Adaptar disciplina de tipografia, borda, foco e comportamento responsivo; não copiar navegação de produto SaaS.
- **Mercury** — hero observado com vídeo dentro de área sticky cuja posição de reprodução acompanha o scroll (o vídeo fica pausado); produto Mercury Books tem slides reais controlados por voltar/avançar, também reorganizados no mobile. Reaproveitar estados de produto e controles explícitos sem vídeo scrub nem assets da Mercury.
- **Cuberto** — hero observado com mídia em container recortado por border-radius/clip-path e escala, além de menu compacto no mobile. Reaproveitar somente transições pontuais e cuidado no recorte; sem cursor global, modal-showreel ou vídeo autoplay.
- **Alche Studio** — no desktop, DOM contém KV com três canvases e uma área de trabalho longa; ao rolar, a orientação da marca 3D muda e o visual imersivo persiste, enquanto a página passa a conteúdo. Isso confirma o princípio de revelar etapas com scroll, mas não oferece uma sequência simples de imagens/capítulos equivalente à proposta Kapitalis. O bundle index.astro_astro_type_script_index_0_lang.Cn_goiN_.js foi bloqueado ao abrir diretamente pelo navegador; a segunda página pública observada usa page.SNkKDTDH.js. Não alegar que a narrativa Kapitalis replica o motor do Alche. Caso uma reprodução fiel desse motor seja solicitada, serão necessários esses bundles. A viewport mobile não pôde ser confirmada porque o controle de viewport do navegador manteve 1280×720.

## Critérios de aceite da especificação

- Navy e dourado originais permanecem os tokens-mãe, com áreas claras para ritmo e acessibilidade.
- A assinatura de scroll corresponde ao fluxo entradas → organização → informação → decisão e tem fallback móvel estático.
- Todos os claims e contatos derivam do site auditado; pendências profissionais/legais permanecem omitidas ou marcadas no código.
- O painel BPO exibe de forma persistente que seus dados são demonstrativos.
- Case e biografia não aparecem como conteúdo real antes da validação.
- StorySection troca a mídia de um capítulo por imagem editorial aprovada sem alterar o motor de estado ou progressão.
- A mídia e o texto de cada capítulo permanecem legíveis com JavaScript desativado e em mobile sem sticky.
- O refinamento visual prioriza Hero, Problemas/contexto, Storytelling, BPO e CTA; as demais partes recebem apenas o esforço necessário ao seu papel.
- O plano técnico mantém o escopo em uma home, não em várias páginas.

## Fontes observadas

- Site Kapitalis: https://kapitaliscontabilidade.com.br/
- Decimal: https://www.decimal.com/
- Hiline: https://www.hiline.co/
- Hiline layer bundle: https://4tqfrd.csb.app/hiline-layer.js
- Linear: https://linear.app/
- Mercury: https://mercury.com/
- Mercury Books: https://mercury.com/books
- Cuberto: https://cuberto.com/
- Alche Studio: https://alche.studio/
- Ata pública do CRC-ES consultada para identificar a divergência: https://crc-es.org.br/wp-content/uploads/2025/07/ATA-DE-REGISTRO_503_-ASSINADA.pdf
