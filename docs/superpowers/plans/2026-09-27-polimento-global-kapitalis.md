# Polimento Global da Kapitalis — Plano de Implementação

> **Para agentes implementadores:** execute as tarefas por domínio, preservando as áreas protegidas e usando testes primeiro. Nenhuma tarefa cria commits; a integração e os commits locais são responsabilidade do agente principal.

**Objetivo:** concluir o polimento global solicitado na branch `experiment/financial-tools-ramp`, manter a linguagem visual atual da Kapitalis e validar a interação, responsividade, privacidade e temas no navegador.

**Arquitetura:** componentes independentes por domínio para avaliações, serviços e FAQ; o agente principal integra rings, geometria estável das ferramentas, tokens globais, continuidade entre seções, privacidade e footer. As referências foram inspecionadas no navegador; a implementação reproduz mecanismos observados, sem copiar código proprietário.

**Tecnologias:** React 19, TypeScript, CSS Modules, Vitest/Testing Library e Vite. Sem novas dependências.

**Especificação:** solicitação do usuário nesta conversa, fases 1–14.

## Restrições globais

- Permanecer na branch atual; não tocar em `main`, não fazer merge, PR ou push.
- Preservar os três commits da rodada anterior e todo trabalho válido.
- Não executar reset destrutivo nem modificar `.idea/`.
- Usar somente conteúdos e fatos já confirmados; não inventar serviços, promessas de privacidade ou comportamento fiscal.
- Honrar `prefers-reduced-motion`, teclado e touch; evitar deslocamento de layout em estados interativos.
- Atualizar primeiro o teste relevante e observar a falha antes da implementação.

## Arquivos e responsabilidades

- `src/calculators/taxSimulator/TaxSimulator.tsx` e CSS: física dos dois rings.
- `src/sections/ToolsSection.tsx` e CSS: link redundante e shell das ferramentas.
- `src/sections/ReviewsSection.tsx`, CSS e teste: motor contínuo compartilhado entre desktop e mobile.
- `src/sections/ServicesSection.tsx`, CSS e teste: três flip cards com conteúdo confirmado.
- `src/sections/FaqSection.tsx`, CSS e teste: lista de perguntas e painel de resposta de altura estável.
- `src/styles/tokens.css`, `src/styles/global.css` e componentes listados pelo pedido: tema global e superfícies.
- `src/components/SiteHeader.tsx`, `SiteFooter.tsx`, estilos e `BrandMark.tsx`: navegação, privacidade e proporção da marca.
- `src/pages/HomePage.tsx` e novo componente compartilhado: continuidade discreta entre seções.

## Foco de revisão

- Mobile estreito: conteúdo de reviews e FAQ não pode cortar texto nem criar overflow horizontal.
- Trocas rápidas entre cinco ferramentas: shell, compartilhamento, CTA e seção seguinte mantêm posição.
- Tema alternado durante interação: tooltip, ring, foco, campos, cards, rodapé e aviso continuam legíveis.
- Touch/teclado: reviews, cards de serviço e SVGs permanecem operáveis sem depender de hover.
- Persistência local: só preferências de tema e fechamento do aviso; valores das simulações nunca são gravados.

## Tarefas

1. **Rings e ferramentas complementares (agente principal):** testes de estados sem reflow; reproduzir no SVG a expansão suave de 1,5× e atenuação não ativa vistas na Ramp; reservar geometria comum para os cinco modos e remover “Conhecer as etapas do processo”.
2. **Avaliações (implementador delegado):** manter uma única faixa duplicada e transformada em todos os tamanhos; autoplay lento, drag/swipe, pausa durante manipulação e sem autoplay com movimento reduzido.
3. **Serviços (implementador delegado):** substituir tabs pelo fade fixo observado nos flip boxes da Marco; hover/focus/tap equivalentes e apenas três pilares confirmados.
4. **FAQ (implementador delegado):** perguntas com `aria-expanded` e resposta em painel substituível, geometria externa invariável e motion reduzido compatível.
5. **Tema, privacidade, footer e continuidade (agente principal):** tokens semânticos por `data-theme`; auditoria do armazenamento/rede antes de texto; aviso pequeno e detalhes acessíveis; FAQ na navegação; logo proporcional; separador/reveal compartilhado só em passagens adequadas.
6. **Integração e QA:** testes, lint, typecheck, build, detector visual uma vez, viewport/tema/overflow e interações reais; corrigir problemas observados.
7. **Git local:** commits coesos em português, sem push/merge/PR e com `.idea/` excluída.

## Critério de aceite

As fases 1–14 do pedido foram implementadas e verificadas no código e no navegador. O resultado final informa limites de inspeção, viewports e estados realmente testados, os hashes dos commits e o estado do branch. Nenhuma alegação de sucesso é feita sem saída verificável.
