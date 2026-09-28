# Narrativa final da Kapitalis — Plano de implementação

> **Para agentes de implementação:** o plano será executado por etapas na sessão atual, com testes antes de cada alteração funcional.

**Objetivo:** completar a narrativa visual do Sistema Kapitalis com as três imagens fornecidas, relações animadas entre dados e decisão, CTAs funcionais, identidade consistente e QA responsivo/acessível.

**Arquitetura:** estender o scrollytelling e `FinancialCore` existentes, mantendo o layout sticky e o diagrama. Os capítulos recebem mídia declarativa; `StoryMedia` usa um frame editorial compartilhado. Serviços, reviews, simuladores e processo permanecem preservados, com correções pontuais no tema, privacidade, marca e divisórias.

**Stack:** React 19, TypeScript, CSS Modules, SVG, Vitest, Testing Library e Vite.

**Especificação:** anexo do usuário `C:\Users\breno\.codex\attachments\2bdec903-2ed2-45b1-92a4-0c159fbdee1a\Texto colado.txt`, com complemento visual de contraste recebido na conversa. Usar os anexos fornecidos por conteúdo: escritório vazio, atendimento presencial e arte “Como podemos ajudar?”.

## Restrições globais

- Permanecer em `experiment/financial-tools-ramp`; não tocar em `main`, `.idea/`, nem fazer merge, PR ou push.
- Preservar a composição, os quatro capítulos, a logo central e a estrutura sticky do Hero.
- Usar somente as três imagens anexadas; não inventar imagem, nome de pessoa, depoimento, métrica ou dado comercial.
- `prefers-reduced-motion` deve deixar mídia e informação visíveis sem deslocamento obrigatório nem loops.
- CTA Hero e CTA “Próximo passo” abrem `https://wa.me/5527998829289` em nova aba com `rel="noopener noreferrer"`.
- FAQ continua próxima do fechamento comercial; tema global existente controla todas as superfícies.
- Rodar `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check` antes dos commits locais.

## Foco de revisão

- Mídia ausente, lenta ou em proporção vertical: frame não colapsa; imagem mantém contexto e alt factual.
- Capítulos inativos e tema claro: órbitas, nós, labels e caminhos continuam distinguíveis.
- Mudanças rápidas de capítulo: animações reiniciam sem persistir estado de outro capítulo ou gerar loop infinito.
- Movimento reduzido: todos os nós, textos, fotos, CTAs e linhas continuam visíveis e usáveis.
- Mobile estreito e teclado: sem overflow; links reais focáveis; banner não cobre a navegação da seção.

---

### Tarefa 1: Mídia editorial e capítulos

**Arquivos:** `src/data/kapitalisStory.json`, `src/story/types.ts`, `src/story/StoryChapter.tsx`, `src/story/StoryMedia.tsx`, `src/story/StorySection.module.css`, `src/story/StorySection.test.tsx`, `src/story/StoryMedia.test.tsx`, criar três PNGs em `public/editorial/`.

- [x] Testar os três `src` e alt texts factuais, caption de Entradas e Decisão, arte Organização íntegra e ausência de fotografia em Visibilidade.
- [x] Confirmar falha dos testes antes da alteração.
- [x] Copiar PNGs anexados para nomes sem ambiguidade: `escritorio-entradas.png`, `arte-organizacao-servicos.png`, `atendimento-decisao.png`.
- [x] Declarar `media` opcional no tipo de capítulo e renderizar `StoryMedia` no mesmo frame depois dos tópicos.
- [x] Aplicar frame 16:10 sem reflow, `object-fit: cover` nas fotos com foco ajustado, `contain` na arte, caption factual e reveal por `clip-path`, opacity, 8–12 px e blur mínimo.
- [x] Testar modo reduzido com imagem sempre visível e sem transform.

### Tarefa 2: Fluxos do diagrama, nó de marca e CTA próximo passo

**Arquivos:** `src/components/FinancialCore.tsx`, `src/components/FinancialCore.module.css`, `src/components/FinancialCore.test.tsx`, `src/components/BrandMark.tsx`.

- [x] Testar nós `Conciliação` e `Fechamento`, linhas núcleo→nó no capítulo Organização, origem→núcleo para Folha/Notas em Decisão e link WhatsApp acessível.
- [x] Confirmar falha dos testes.
- [x] Adicionar os dois nós intermediários e linhas SVG com desenho/pulsos sequenciais de execução única; ativar folhas/notas e convergir para o CTA em Decisão.
- [x] Sequenciar os três caminhos de Visibilidade já existentes com pontos de chegada e labels; não criar loop contínuo.
- [x] Dar realce microscópico ao núcleo após entradas e corrigir a viewBox da marca para mostrar o selo completo, removendo clip-path.
- [x] Trocar o texto decorativo do SVG por âncora HTML posicionada sobre a saída visual, estender a linha central e aplicar estado de CTA premium.
- [x] Desabilitar movimento espacial em `prefers-reduced-motion` sem ocultar os elementos.

### Tarefa 3: Hero, trilho, FAQ e remoção da faixa

**Arquivos:** `src/sections/HeroSection.module.css`, `src/sections/HeroSection.test.tsx`, `src/sections/TrustStrip.tsx`, `src/sections/TrustStrip.module.css`, `src/pages/HomePage.tsx`.

- [x] Testar href, nova aba e rel do CTA principal do Hero.
- [x] Confirmar os contratos de interação/semântica pelos testes disponíveis.
- [x] Dar elevação, gold shift, sombra curta, seta móvel 1–2 px, active microscópico e focus-visible sem mudar dimensões do CTA.
- [x] Remover `TrustStrip` da página e os arquivos exclusivos.
- [x] Confirmar por DOM/browse que FAQ permanece no fim da jornada, entre Processo e CTA/Contato.

### Tarefa 4: Marca, privacidade, tema e divisórias

**Arquivos:** `src/components/SiteHeader.tsx`, `src/components/SiteHeader.module.css`, `src/components/SiteFooter.tsx`, `src/components/SiteFooter.module.css`, `src/components/SiteFooter.test.tsx`, `src/components/PrivacyNotice.tsx`, `src/components/PrivacyNotice.module.css`, `src/components/PrivacyNotice.test.tsx`, `src/components/SectionTransition.tsx`, `src/components/SectionTransition.module.css`, `src/components/SectionTransition.test.tsx`, `src/calculators/shared/ShareActions.module.css`, CSS dos dois simuladores e `src/styles/tokens.css`.

- [x] Testar marca completa e igual entre header/footer, aviso da primeira visita e persistência do fechamento, dois micropontos por divisor e legibilidade dos estados dos simuladores.
- [x] Confirmar falha antes das mudanças.
- [x] Reutilizar o mesmo BrandMark/viewBox no header, centro e footer; ajustar o lockup do footer para selo + “Kapitalis”.
- [x] Expandir discretamente o banner fixo inferior com copy especificada e layout desktop/mobile; manter apenas preferência de fechamento.
- [x] Animar dois micropontos até o marcador uma vez por entrada no viewport; no modo reduzido, exibir o divisor diretamente.
- [x] Revalidar cores, valores, placeholder, seletores, resultados, comparativo, ring, tooltip, compartilhamento, estados vazios e tema claro/escuro com tokens existentes.

### Tarefa 5: QA integrado e fechamento local

**Arquivos:** adicionar/ajustar testes nas áreas acima; `docs/superpowers/plans/2026-09-27-narrativa-final-kapitalis.md`.

- [x] Verificar os quatro capítulos por conteúdo, estado dos nós, linhas, fotos e CTA no navegador.
- [ ] Abrir a aplicação e percorrer todos os estados em desktop/mobile e ambos os temas; a sessão permitiu clique e teclado, mas não emulação touch confiável.
- [ ] Testar larguras 320, 375, 390, 430, 768, 1024, 1366, 1440, 1536, 1920; `scrollWidth === clientWidth` em todas.
- [ ] Validar claro/escuro em 390, 1366, 1440 e 1920; testar reduced motion.
- [x] Rodar os cinco gates globais descritos nas restrições e o detector Impeccable uma única vez após a UI.
- [x] Revisar diff, preservar `.idea/`, criar commits locais em português, conferir branch/HEAD e ausência de push.

Commits locais desta rodada:

- `a040c39` `feat: amplia narrativa e contraste do sistema`
- `9e94ecc` `feat: refina continuidade, avaliações e privacidade`
- `5f052b7` `fix: reforça interação e tema das ferramentas`

Branch verificada: `experiment/financial-tools-ramp`. O ref de `main` permaneceu inalterado; nenhum push foi executado.

#### Limites da validação manual desta sessão

- A automação do navegador aceitou a solicitação de viewport, mas as capturas permaneceram em 1234×713. Portanto, as larguras pedidas, o teste de `scrollWidth === clientWidth` em cada uma e as bounding boxes reais não foram verificadas visualmente nesta sessão.
- DevTools não ficou disponível; a auditoria de privacidade foi estática no código entregue. Não foi possível registrar Network/Sources nem fazer inspeção DOM/CSS das referências externas.
- Os temas e os quatro capítulos foram vistos na viewport disponível. Testes automatizados cobrem o engine de avaliações, FAQ, shells e modo reduzido; isso não substitui emulação touch nem a inspeção nos tamanhos acima.
