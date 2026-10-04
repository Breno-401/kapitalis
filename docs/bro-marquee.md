# Reviews mobile: broMarquee 1.0.1

Referência: https://marquee.bro-design.pro/ — pacote MIT
`@bro-design/bro-marquee@1.0.1`, instalado com versão exata no npm.

O pacote distribuído contém somente `package.json` e uma IIFE de navegador em
`dist/bro-marquee.min.js`. Expõe `window.BroInfiniteMarquee` (constructor),
`window.initBroMarquees` (inicialização global), e os métodos `start`, `stop` e
`forceStart`. Não contém export ESM nem método `destroy`.

`build/broMarqueeReact.ts` lê **esse arquivo instalado**, remove somente a IIFE e
a inicialização global, exporta o constructor e acrescenta descarte de recursos.
O import local `@bro-design/bro-marquee/dist/bro-marquee.min.js?react` é resolvido
pelo plugin no Vite e Vitest. Não há CDN, cópia independente do motor nem eval.
A licença acompanha o build em `assets/bro-marquee.LICENSE.txt`. Substituições incompatíveis falham
durante o build; testes comparam os métodos de física ao fonte original.

As alterações de lifecycle rastreiam identidades dos listeners, observer e
frames (inclusive inércia), cancelam o debounce de wheel, impedem continuação
de init assíncrono já destruído, removem os clones e restauram o style do wrapper.
Nenhum cálculo de posição, loop, velocidade, eixo ou inércia é substituído.

Em `max-width: 700px`, a região possui `bro-marquee-element="marquee"`, o rail é
`wrapper` e o único `ul` é `list`. React fornece nove `li`; o pacote acrescenta
uma cópia de cada um. Configuração real da 1.0.1:

- `bro-marquee-speed="0.26672"` e `bro-marquee-speed-mobile="0.26672"`;
- `bro-marquee-direction="left"`;
- `bro-marquee-clones="1"`;
- `bro-marquee-pause-on-hover="false"`.

O frame de referência oficial é 16.67 ms: `0.26672 × 1000 / 16.67 = 16 px/s`.
O pacote ajusta o movimento pelo tempo decorrido, normaliza a posição dentro da
largura da sequência e utiliza os clones para preencher a continuação. Drag,
touch, detecção horizontal/vertical, wheel e inércia seguem os defaults oficiais
(friction 0.95, minVel 0.1); não possuem atributos adicionais de configuração.
`bro-marquee-mask` não é lido pelo JavaScript 1.0.1; preservamos a máscara CSS.
O único ajuste estrutural de CSS é o gap final da lista, necessário para que
`list.scrollWidth / (clones + 1)` seja exatamente a largura de uma repetição.

`ReviewsBroMarquee.ts` é um adapter de DOM/lifecycle. O cleanup cobre StrictMode,
unmount e troca para desktop. A chave do rail distingue os dois DOMs; rerender
de expansão não recria o motor. O desktop conserva o motor anterior.

O capture de click do ancestral React alcança botões clonados e atualiza o Set
de expansão. MutationObserver dos itens reais sincroniza texto, botão e fallback
de avatar das cópias. Seus IDs e aria-controls são únicos, e os botões das cópias
não entram na ordem de Tab. O `aria-hidden` nativo permanece nos clones.
O adapter respeita reduced motion atribuindo zero à configuração de velocidade
já interpretada, pois o parser oficial trata o atributo zero como fallback.
Não instala handlers de drag/touch, pointer capture, RAF ou transform concorrente.

`ReviewsMobileMotion.ts` e seus testes foram excluídos; GSAP não tem outros usos
e foi removido das dependências. Testes de integração cobrem lista única,
configuração, rerender, StrictMode, cleanup, breakpoint, expansão e avatares.
Testes em navegador devem avaliar cobertura dos cards durante gestos, e não
somente valores de transform. Emulação de navegador não equivale a iPhone físico.

## Validação local desta integração

Suíte completa: 163 testes em 24 arquivos. Typecheck, lint, build e diff check
aprovados. O build também distribui o aviso MIT completo.

Chromium com touch, sobre o build de produção, em 320×812, 375×812, 390×844,
402×874 e 430×932: 40 swipes à esquerda, 80 à direita, 16 alternâncias, drag
contínuo por vários períodos, inércia e retorno do autoplay; depois expansão,
recolhimento e novo swipe. As posições reais dos artigos foram inspecionadas
durante cada movimento, aceitando somente o espaçamento de 36 px do design.
Nenhuma região vazia ou extremidade foi encontrada. Autoplay medido perto de
16 px/s; scroll vertical nativo permaneceu livre e expansão foi sincronizada.

Resize mobile → desktop descartou todos os frames e listeners da instância,
retornou aos dois sets aprovados e manteve aproximadamente 20 px/s. Resize de
volta criou uma única instância, com 18 itens e IDs únicos. Pausa offscreen e
retomada pelo IntersectionObserver oficial também foram verificadas.

Comparação de estilos computados dos cards, header, prova Google, máscara,
CTA e seção: preservados nos cinco tamanhos mobile e em 1440 px, nos dois temas.
As imagens foram inspecionadas; diferenças de sombras no início da sequência e
de captura/minificação não alteram o CSS visual aprovado. Não foi realizado
teste em Safari/WebKit ou iPhone físico.

## Arquivos desta alteração

- `package.json`, `package-lock.json`, `vite.config.ts`;
- `build/broMarqueeReact.ts`, `build/broMarqueeReact.test.ts`;
- `src/bro-marquee.d.ts`;
- `src/sections/ReviewsBroMarquee.ts`, `src/sections/ReviewsBroMarquee.test.tsx`;
- `src/sections/ReviewsSection.tsx`, `src/sections/ReviewsSection.module.css`,
  `src/sections/ReviewsSection.test.tsx`;
- `LICENSES/bro-marquee.txt`, `docs/bro-marquee.md`;
- removidos `src/sections/ReviewsMobileMotion.ts` e
  `src/sections/ReviewsMobileMotion.test.ts`.

`ReviewCard.tsx`, dados e avatares permanecem intactos.
