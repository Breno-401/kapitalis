# Auditoria do Simulador Tributário 360º e da calculadora Ramp

Data da investigação: 27/09/2026. Escopo: site público da Kapitalis, referência da Ramp e encaixe na demo local. Esta investigação não altera o motor nem a interface do produto.

## 1. Fontes, arquivos e arquitetura encontrada

- Site publicado: <https://kapitaliscontabilidade.com.br/>. O simulador fica em `section#simulador`; a seção separada de outras calculadoras fica em `section#calculadoras`.
- O HTML carrega o bundle Vite <https://kapitaliscontabilidade.com.br/assets/index-F8pnt5bY.js> e o CSS <https://kapitaliscontabilidade.com.br/assets/index-vIXmVrmv.css>. O bundle JS foi acessado e examinado; não há necessidade de pedir um chunk da Kapitalis.
- O código do simulador está no próprio bundle de aproximadamente 731 KB, sem source map anunciado. Os identificadores minificados relevantes são `aa` (ler moeda), `Po` (formatar BRL), `IC` (Simples), `DC` (Presumido), `MC` (Real), `LC`/`LF`/`FF` (formulários por regime), `$F` (comparativo), `BF` (seção 360º), `Jr` (casca de duas colunas) e `Lo` (painel de resultados). As fórmulas aparecem em sequência perto do byte 434 mil. A seção `calculadoras` usa outras funções, fora desta rodada.
- As funções `IC`, `DC` e `MC` são síncronas e só recebem os valores do formulário. Não há chamada de API no caminho de cálculo que foi localizado. O bundle inclui outros serviços para o restante do site; isso não implica dependência do simulador. O resultado muda ao alterar o input, sem botão Calcular.
- A demo deste repositório é diferente do site publicado: `src/sections/ToolsSection.tsx` mantém o simulador em estado `pending-validation` e apenas o Fator R tem resultado ativo. O repositório local não contém as fórmulas do site público.

## 2. Inventário completo dos inputs do simulador publicado

| Campo | Tipo e formato | Obrigatório / inicial | Validação observada | Uso |
| --- | --- | --- | --- | --- |
| Regime selecionado | Radio: `simples`, `presumido`, `real` | Sempre selecionado; `simples` inicialmente | Restringe-se às três opções | Escolhe qual formulário e breakdown detalhado exibir; **não** limita o comparativo, que calcula os três regimes. |
| Faturamento Anual Previsto | Texto com máscara BRL; dígitos são centavos (`12000000` → R$ 120.000,00) | Necessário para exibir resultados; vazio inicialmente | `onChange` remove tudo que não seja dígito; zero/vazio faz as funções retornarem `null`. Sem teto ou validação de elegibilidade de regime. | Entra nas três fórmulas como receita anual; dividido por 12 para receita mensal. |
| Atividade Principal | Select `comercio`, `servicos`, `industria`; rótulos Comércio, Serviços Gerais e Indústria | Valor inicial `servicos` | Apenas as três opções | Muda a taxa simplificada do Simples e as bases presumidas de IRPJ/CSLL; não afeta Lucro Real. Oculto quando Real está selecionado, mas mantido no estado e usado no comparativo. |
| Margem de Lucro Real Estimada (%) | `input type=number`, `min=0`, `max=100` | Inicial `15` na seção 360º | O motor usa `parseFloat(valor) || 0`; não rejeita 150, negativos ou valores não finitos por validação de domínio. `min`/`max` são atributos HTML, não barreiras da fórmula. | Multiplica a receita mensal para obter lucro usado em IRPJ e CSLL do Real. Oculto nos demais regimes, mas sempre usado no comparativo. |

Não existem campos de folha, pró-labore, CNAE, município, ISS, ICMS, despesas, créditos tributários, receita dos últimos 12 meses ou receita do mês corrente nesse simulador. Os campos de outras calculadoras em `#calculadoras` são independentes. Ao carregar, o formulário de Simples mostra faturamento e atividade; a margem aparece somente na aba Real. O botão `Limpar` está presente em cada formulário. As três ações de resultado são `Salvar`, `Share` e `Imprimir`.

## 3. Outputs e apresentação atuais

O site calcula **Simples Nacional, Lucro Presumido e Lucro Real** simultaneamente quando há receita positiva. A coluna direita mostra apenas o regime selecionado: imposto mensal estimado em destaque, alíquota efetiva, imposto anual e linhas de composição. Abaixo, o comparativo apresenta custo anual e mensal dos três, diferença mensal contra o menor e destaca o primeiro menor valor encontrado. Empates favorecem a ordem Simples → Presumido → Real. A interface chama esse regime de `Recomendado`, `MAIS VANTAJOSO` e `Melhor opção tributária`, embora o rodapé reconheça que a escolha exige análise contábil.

| Regime | Linhas do painel detalhado |
| --- | --- |
| Simples | Faturamento mensal médio, imposto anual total, `Imposto Federal (Aprox.)`, `Imposto Estadual (Aprox.)`, `Imposto Municipal (Aprox.)`. Estas três parcelas são percentuais inventariados do total calculado; não vêm de uma tabela de partilha. |
| Presumido | Margem presumida exibida como `32%` para serviços e `8%` para os demais, imposto anual, IRPJ, CSLL, PIS, COFINS. A exibição omite que a base de CSLL não-serviços usada na fórmula é 12%. |
| Real | Lucro líquido declarado como percentual da receita, imposto anual, IRPJ, CSLL, PIS, COFINS. |

O comparativo não inclui subtotais federal/estadual/municipal, encargos, diferença anual explícita ou gráfico. `Lo` tem suporte genérico a barras visuais (`comparisons`), mas os três formulários tributários não lhe passam dados de barras. O valor principal usa animação numérica; numa captura imediata após digitar, pode aparecer o número intermediário antes de estabilizar. Os casos abaixo usam o valor estabilizado do comparativo.

## 4. Fórmulas executadas no site publicado

Convenções: `A` = faturamento anual numérico lido por `aa`; `M = A / 12`; `P = (parseFloat(margem) || 0) / 100`. Valores numéricos internos são `Number` JavaScript, sem arredondamento fiscal intermediário. A exibição usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` e a taxa efetiva usa `toFixed(2)`.

### `IC` — Simples Nacional

```text
r = 6% serviços, 4% comércio, 4,5% indústria
se A > 180.000: r += 1,5 ponto percentual
se A > 360.000: r += 2 pontos percentuais
se A > 720.000: r += 2,5 pontos percentuais
anual = A × r
mensal = anual / 12
taxa efetiva exibida = r × 100, com 2 casas
breakdown mensal = 60% federal + 25% estadual + 15% municipal
```

Não há tabelas oficiais de Anexos, parcelas a deduzir, Fator R, RBT12, repartição real do DAS, teto de R$ 4,8 milhões ou sublimite de ICMS/ISS nesta função.

### `DC` — Lucro Presumido

```text
base_IRPJ = M × (32% se serviços, senão 8%)
base_CSLL = M × (32% se serviços, senão 12%)
IRPJ = 15% × base_IRPJ + 10% × max(base_IRPJ − 20.000, 0)
CSLL = 9% × base_CSLL
PIS = 0,65% × M
COFINS = 3% × M
mensal = IRPJ + CSLL + PIS + COFINS
anual = mensal × 12
taxa efetiva = mensal / M × 100
```

O limiar de adicional de IRPJ é aplicado à média mensal. O site não calcula trimestre real, ISS, ICMS, IPI, contribuições sobre folha ou condições setoriais. Também não aplica o acréscimo de presunção vigente em 2026 para a parcela de receita acima de R$ 5 milhões.

### `MC` — Lucro Real

```text
lucro = M × P
IRPJ = 15% × max(lucro, 0) + 10% × max(lucro − 20.000, 0)
CSLL = 9% × max(lucro, 0)
PIS = 1,65% × M
COFINS = 7,6% × M
mensal = IRPJ + CSLL + PIS + COFINS
anual = mensal × 12
taxa efetiva = mensal / M × 100
```

Não considera créditos de PIS/COFINS, ajustes do lucro fiscal, perdas, tributos estaduais/municipais ou despesas/encargos informados separadamente. O campo margem pode superar 100% e produzir resultados sem erro; isso foi reproduzido no site.

## 5. Constantes, faixas e arredondamento

- Receita: divisões fixas por 12; não há série mensal.
- Simples: taxas base 4%, 4,5%, 6%; limiares estritos `>` em 180 mil, 360 mil e 720 mil; acréscimos 1,5, 2 e 2,5 pontos; composição fixa 60/25/15.
- Presumido: bases de IRPJ 8%/32%; CSLL 12%/32%; IRPJ 15% + adicional 10% acima de R$ 20 mil de base mensal; CSLL 9%; PIS 0,65%; COFINS 3%.
- Real: margem inicial de 15%; IRPJ 15% + adicional 10% acima de R$ 20 mil de lucro mensal; CSLL 9%; PIS 1,65%; COFINS 7,6%.
- `annualTax` é o resultado numérico anual da função; no Simples equivale a `A × r`, nos demais a `monthlyTax × 12`. Nenhum valor é arredondado a centavos antes da formatação visual. A taxa efetiva retornada é uma **string**, já arredondada a duas casas.

## 6. Casos de caracterização capturados no navegador

Receita e margem são os valores informados. A atividade e margem ocultas continuam guardadas no estado comum. Os montantes abaixo são o texto apresentado no comparativo publicado; não são valores fiscais homologados.

| Receita anual / atividade / margem | Simples mensal · anual | Presumido mensal · anual | Real mensal · anual | Destaque exibido |
| --- | --- | --- | --- | --- |
| R$ 0 / serviços / 15% | sem resultado | sem resultado | sem resultado | nenhum |
| R$ 120.000 / serviços / 15% | R$ 600 · R$ 7.200 | R$ 1.133 · R$ 13.596 | R$ 1.285 · R$ 15.420 | Simples |
| R$ 180.000 / serviços / 15% | R$ 900 · R$ 10.800 | R$ 1.699,50 · R$ 20.394 | R$ 1.927,50 · R$ 23.130 | Simples |
| R$ 180.000,01 / serviços / 15% | R$ 1.125 · R$ 13.500 | R$ 1.699,50 · R$ 20.394 | R$ 1.927,50 · R$ 23.130 | Simples |
| R$ 1.200.000 / comércio / 15% | R$ 10.000 · R$ 120.000 | R$ 5.930 · R$ 71.160 | R$ 12.850 · R$ 154.200 | Presumido |
| R$ 4.800.000 / indústria / 15% | R$ 42.000 · R$ 504.000 | R$ 24.920 · R$ 299.040 | R$ 55.400 · R$ 664.800 | Presumido |

O salto de R$ 900 para R$ 1.125/mês no Simples com apenas R$ 0,01 de aumento anual decorre diretamente de `A > 180000` e da ausência de parcela a deduzir. Margem de 150% também foi aceita pelo cálculo do Real no navegador. Na seção 360º a margem é inicialmente 15%; no componente isolado `FF` há valor local inicial/reset de 10%, uma inconsistência a preservar como evidência, não como regra desejada.

## 7. Ações, dependências e lacunas da implementação atual

- `Salvar`, `Share` e `Imprimir` chamam em `Lo` apenas um toast `Funcionalidade em desenvolvimento`; não geram arquivo, URL, compartilhamento nativo nem impressão. O código localizado é conclusivo, embora a tentativa de clique automatizado não tenha apresentado toast estável na captura.
- `Limpar` tem handler em cada formulário. Por código, limpa receita e restaura atividade `servicos`; no Real tenta restaurar margem local para `10`. No teste no navegador, o clique no Real não alterou os campos preenchidos. Por isso, o comportamento de reset deve ser tratado como inconsistente até caracterização adicional.
- React controla os campos, Framer Motion anima a troca de regime e valores, e um sistema de toast atende às ações de placeholder. A calculadora não precisa de Supabase nem de backend para os números vistos.
- O simulador não sincroniza a URL com os campos. O bloco de outras calculadoras do site está fora de escopo.

## 8. Verificação contra fontes oficiais — diferenças a decidir

**Simples Nacional.** A [LC 123/2006](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm) e o [Manual do PGDAS-D](https://www8.receita.fazenda.gov.br/simplesnacional/arquivos/manual/manual_pgdas-d_2018_v4.pdf) usam enquadramento por Anexo, receita bruta dos 12 meses anteriores, alíquota nominal e parcela a deduzir para obter a alíquota efetiva; a receita mensal de apuração é a base de aplicação. A função `IC` não usa esses elementos, aplica degraus sem dedução e impõe a composição 60/25/15. A comparação e o breakdown podem estar materialmente incorretos, inclusive no exemplo de R$ 180.000,01. O manual também descreve o sublimite de R$ 3,6 milhões para ICMS/ISS. A [Receita informou em agosto de 2026](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/cgsn-atualiza-regras-do-simples-nacional-para-adequacao-a-reforma-tributaria-do-consumo) mudanças com efeitos em regra a partir de 2027; não devem ser antecipadas silenciosamente.

**Lucro Presumido.** A [Receita confirma](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/IRPJ) 15% de IRPJ e adicional de 10% sobre a parcela acima de R$ 20 mil por mês de apuração; a [base de CSLL de 12% ou 32%](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/tributos/CSLL) depende da atividade. Essas parcelas coincidem com parte da simplificação publicada. Porém a função é uma média mensal, não modela todo o período/base/tributos do caso concreto, e ignora o acréscimo de 10% nos **percentuais de presunção** sobre a parcela da receita anual acima de R$ 5 milhões previsto na [LC 224/2025, art. 4º, § 5º](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm). Não confundir esse acréscimo com 10 pontos na alíquota do imposto.

**Lucro Real.** As alíquotas gerais de PIS e COFINS de 1,65%/7,6% existem, mas a [Receita descreve créditos na apuração não cumulativa](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/ecf/perguntao-2019-pj-v1-1/%40%40download/file/perguntas-e-respostas-2019-arquivo-unico-v1-1.pdf). `MC` cobra o percentual bruto sem permitir crédito. A margem informada pelo visitante não equivale automaticamente à base fiscal apurada. Portanto, o total e a classificação de menor carga podem mudar significativamente.

**Decisão fiscal necessária antes de implementar.** Reproduzir exatamente o legado serve aos testes de caracterização, mas não basta para apresentar uma recomendação tributária atual. A alternativa é definir, com validação contábil, escopo, data de vigência e dados adicionais para um motor fiscal atual. Nenhuma das diferenças acima deve ser corrigida dentro da futura UI sem essa decisão explícita.

## 9. Arquitetura real observada da Ramp

Referência: <https://ramp.com/savings-calculator>. A página é Next/Turbopack. O módulo de maior interesse está no chunk público [459xezk0dyqd9.js](https://ramp.com/_next/static/immutable/chunks/459xezk0dyqd9.js): módulos internos `771346` (seleção e campos), `447842` (estado, padrões e restauração de query), `906436` (motor, indicadores e gráficos), `698034` (URL e cópia) e `88218` (animação dos números). Também foram observados [0tmbh4gs3pfri.js](https://ramp.com/_next/static/immutable/chunks/0tmbh4gs3pfri.js) e os CSS [1dum4zrp-pmo4.css](https://ramp.com/_next/static/immutable/chunks/1dum4zrp-pmo4.css), [2gn_5ss2dyy8r.css](https://ramp.com/_next/static/immutable/chunks/2gn_5ss2dyy8r.css), [2h0hnbx10wbnm.css](https://ramp.com/_next/static/immutable/chunks/2h0hnbx10wbnm.css) e [2tpc7bh7onmci.css](https://ramp.com/_next/static/immutable/chunks/2tpc7bh7onmci.css). O source map anunciado pelo JS (`0-ogl13kaxzik.js.map`) retornou 404; o chunk executável necessário foi acessado.

O DOM contém `grid grid-cols-12`, com inputs em `col-span-12 md:col-span-6 lg:col-span-5` e resultados em `col-span-12 md:col-span-6 lg:col-span-7`. O conteúdo tem largura máxima de tela e padding responsivo. O painel de resultados é `sticky` abaixo da navbar no desktop. Em 390×844, seleção → inputs → dois anéis → métricas/breakdowns → compartilhamento aparecem em fluxo vertical. Os indicadores são grandes; as linhas de breakdown têm pontos de cor, valores e tooltips. Anéis SVG usam arcos `strokeDasharray`; hover conecta arco e linha, realçando a parcela. Em viewport estreito os dois anéis aparecem juntos antes das métricas. Há duas visualizações numéricas (economia em dinheiro e tempo), não três cards enormes.

O estado inicial é zero. As escolhas `Startup`, `Mid-market` e `Enterprise` substituem os cinco campos por conjuntos fixos; por exemplo Startup preenche `50`, `4`, `200000`, `50`, `600000`. Os campos são texto numérico, removem vírgulas, arredondam enquanto se digita, têm máximos definidos por campo, e formatam com separador local no blur. A mudança de `50` para `51` cartões alterou imediatamente o resultado mensal de US$ 17.165 para US$ 17.167,70 e o link gerado. O motor está no cliente e soma componentes de economia e horas; os coeficientes próprios do negócio Ramp estão hardcoded no módulo `906436`. Eles são evidência da arquitetura, não uma fórmula a reutilizar na Kapitalis.

O compartilhamento no módulo `698034` serializa os cinco valores em `URLSearchParams`, produz a URL da rota atual, usa `navigator.clipboard.writeText` e mostra toast de cópia. O módulo `447842` lê esses parâmetros na inicialização; a restauração foi testada após recarregar o link. A URL da página aberta permanece sem query enquanto se edita; a query está no botão de copiar. A visibilidade do convite depende de existir ao menos um valor diferente de zero. O movimento vem de `KbNumber` e transições CSS; o módulo de números consulta `prefers-reduced-motion`. O gráfico SVG contém transições CSS e deve ser reavaliado especificamente quanto a movimento reduzido ao reimplementar. Não foi encontrada necessidade de endpoint para gerar o resultado ou link; há chamadas de analytics que não fazem parte da lógica da calculadora.

## 10. Proposta de encaixe na demo e arquivos da fase seguinte

A demo já possui a seção `ToolsSection`, catálogo, tokens de navy/dourado/off-white e alternância de tema via `data-theme`. Proponho manter o catálogo e substituir **somente o painel do Simulador Tributário 360º** por uma ferramenta com formulário à esquerda e dashboard à direita; as demais ferramentas permanecem como estão. O destaque será `Menor carga estimada nesta simulação`, e a leitura será derivada apenas da diferença calculada. O breakdown e o anel usarão exclusivamente tributos que a regra aprovada puder justificar; a distribuição 60/25/15 do legado não deve receber aparência de partilha oficial.

Arquivos previstos, condicionados à decisão fiscal:

- `src/calculators/taxSimulator/types.ts`, `legacyEngine.ts`, `engine.ts`, `config.ts`, `sharing.ts`: tipos, regra legada caracterizada, regra aprovada, descrição dos campos e URL reproduzível.
- `src/calculators/taxSimulator/*.test.ts`: casos capturados, limites/faixas, centavos, entradas inválidas e comparação.
- `src/sections/TaxSimulator.tsx`, `TaxSimulator.module.css`, `TaxSimulatorChart.tsx`: shell, inputs, painel, anel/barras e tema. Divisão em mais componentes somente se a implementação exigir.
- `src/sections/ToolsSection.tsx` e, se necessário, `src/data/tools.ts`: montar o simulador na seleção existente; preservar as outras calculadoras.
- `src/sections/ToolsSection.test.tsx` e testes de UI específicos: edição, query, restauração, cópia, teclado, tema e movimento reduzido.

Um link `/?tool=simulador-tributario-360&revenue=...&activity=...&margin=...#conteudo` se encaixa na rota única atual sem mexer em `HomePage`, navbar ou roteamento. Apenas valores financeiros genéricos entram na URL. O dashboard deve derivar métricas do resultado puro, sem cálculo fiscal no JSX. A moeda deve ser tratada em centavos no contrato do novo motor e a política de arredondamento deve ser fixada após a decisão contábil; reproduzir o legado exige cálculo em `Number` sem arredondamento intermediário. A futura validação deve executar scripts reais (`test`, `lint`, `typecheck`, `build`, `git diff --check`) e os dez viewports pedidos pelo usuário.

## 11. Estado do trabalho

A investigação está completa para os bundles necessários. A branch `experiment/financial-tools-ramp` foi criada a partir de `origin/main` atualizado. Nenhuma fórmula ou UI foi implementada. O próximo passo depende de aprovação do relatório e de decisão explícita sobre o comportamento fiscal a usar na ferramenta publicada.
