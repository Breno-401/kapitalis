# Google Reviews mobile — Embla v8

Dependências exatas: `embla-carousel-react@8.6.0` e
`embla-carousel-auto-scroll@8.6.0`; o core resolvido também é `8.6.0`.
Imports ESM oficiais, sem CDN, patches de dependências ou plugin de build custom.

Referências oficiais consultadas:

- [Opções v8](https://www.embla-carousel.com/docs/v8/api/options)
- [Auto Scroll v8](https://www.embla-carousel.com/docs/v8/plugins/auto-scroll)
- [Exemplos v8](https://www.embla-carousel.com/docs/v8/examples/predefined)

## Integração

`ReviewsSection` renderiza `ReviewsMobileCarousel` somente em
`max-width: 700px`. Fora disso, renderiza o markup e motor desktop aprovado.
O componente mobile utiliza diretamente o hook oficial:

```ts
useEmblaCarousel({
  loop: true,
  dragFree: true,
  containScroll: false,
  align: 'start',
  container: '[data-review-rail]',
}, [AutoScroll({
  speed: 0.266,
  startDelay: 0,
  stopOnInteraction: false,
  stopOnMouseEnter: false,
  stopOnFocusIn: false,
  breakpoints: { '(prefers-reduced-motion: reduce)': { active: false } },
})])
```

O plugin é memoizado. O hook oficial destrói a instância no unmount; resize
interno e mudanças de preferência são tratados pela biblioteca. Ao trocar de
breakpoint, o componente mobile desmonta, e uma nova entrada monta uma instância
nova. Não há lifecycle, listeners de input, timers ou animação próprios.

A estrutura reutiliza os wrappers visuais existentes:

```text
trackFrame — viewport Embla, máscara, overflow hidden, largura integral
  track — somente layout do gutter original
    ul.trackRail.mobileRail — container Embla
      li.trackItem — ReviewCard real, key pelo id
      ... nove slides reais, sem sets adicionais
```

O selector oficial `container` aponta ao rail dentro do wrapper de layout.
Esse wrapper mantém o gutter, sem mudar a origem medida entre container e slides.
O viewport mantém `touch-action: pan-y pinch-zoom`; seu overflow e a máscara
recortam os cards na largura original. A margem final de 0.75rem do último slide
é lida pelo Embla para conservar também o espaçamento na passagem do loop.

Loop e reciclagem movem os mesmos nove slides; não criam reviews adicionais.
Drag, touch, detecção de eixo e momentum pertencem ao Embla. `dragFree` permite
soltar fora de snaps. Auto Scroll é o único dono do movimento automático:
`0.266` por atualização, aproximadamente 15.96 px/s a 60fps. Ao tocar, o plugin
para; ao soltar, aguarda a inércia nativa encerrar e retoma com startDelay zero.
O tempo da inércia não é substituído por timer nosso.

Cada `ReviewCard` mantém seu estado e eventos React originais, incluindo
expansão e fallback do avatar. Não existe sincronização de cópias, IDs duplicados
ou botões clonados. `ReviewCard.tsx`, conteúdo, avatares e CSS visual dos cards
permanecem intactos. Motion reduzido desativa somente Auto Scroll pela opção
oficial de breakpoint; a navegação manual permanece disponível.

## Remoção do motor anterior

Foram removidos o pacote antigo, adapter, tipos, licença e documentação exclusiva,
plugin custom do Vite e seus testes. Não há cloneNode, MutationObserver de
sincronização, física mobile manual, GSAP, captura de ponteiro ou RAF no componente.
Os mecanismos internos de observação/reciclagem do Embla permanecem oficiais.
Os dois sets e o motor custom do desktop continuam somente no ramo desktop.

## Testes da integração

O teste de integração usa o hook React e a factory Auto Scroll reais, substituindo
apenas o core para não testar física sobre dimensões zero do jsdom. Vitest faz
inline do pacote React para permitir essa substituição; o build usa somente o
plugin React padrão do Vite. São verificados: nove reviews em ordem, ausência de
sets mobile, configuração, expansão, rerender sem recriação, StrictMode, destroy,
breakpoint e ausência de inicialização no desktop.

## Validação local

- 148 testes passaram em 23 arquivos; 18 testes focados de Reviews passaram.
- Typecheck, lint, build e `git diff --check` aprovados.
- Build de produção inspecionado em Chromium com touch: 320×812, 375×812,
  390×844, 402×874 e 430×932.
- Autoplay inicial atravessou mais de dois cards em cada viewport, próximo de
  16 px/s. Um contato percorreu 100 larguras para a esquerda, inverteu sem soltar
  e percorreu 100 larguras de volta. Foram verificados checkpoints em 10, 20,
  50 e 100 larguras nos dois sentidos e bounds reais dos artigos em cada passo.
- O DOM manteve nove slides, loop ativo e IDs únicos. Nenhum vazio ou limite foi
  encontrado; somente os 36 px de espaçamento visual entre cards foram aceitos.
- Momentum, retomada oficial, nova interrupção, scroll vertical começando nos
  cards, expansão/recolhimento e drag subsequente passaram em todos os tamanhos.
- Mobile → desktop emitiu destroy da instância oficial, preservou os dois sets
  aprovados e aproximadamente 20 px/s. Desktop → mobile criou uma nova instância
  com nove slides; nenhuma instância destruída foi reutilizada.
- Doze comparações de estilos/imagens em dark/light (cinco tamanhos mobile e
  1440 px desktop) preservaram cards, tipografia, cores, seção, Google e CTA.
  Somente o sizing dos wrappers e o gap cíclico receberam os ajustes estruturais
  exigidos pelo Embla; `ReviewCard`, dados, máscaras e temas foram preservados.

**Validado em Chromium, aguardando iPhone físico.** Não houve teste físico em
iPhone ou execução em Safari/WebKit.

## Arquivos

- `package.json`, `package-lock.json`, `vite.config.ts`;
- `src/sections/ReviewsSection.tsx`, `src/sections/ReviewsSection.module.css`;
- novos `src/sections/ReviewsMobileCarousel.tsx`,
  `src/sections/ReviewsMobileCarousel.test.tsx`, `docs/reviews-mobile-embla.md`;
- removidos `build/broMarqueeReact.ts`, `build/broMarqueeReact.test.ts`,
  `src/sections/ReviewsBroMarquee.ts`, `src/sections/ReviewsBroMarquee.test.tsx`,
  `src/bro-marquee.d.ts`, `LICENSES/bro-marquee.txt`, `docs/bro-marquee.md`.
