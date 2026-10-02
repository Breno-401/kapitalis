# Simulador Tributário 360º — plano de implementação

## Escopo

O relatório em `docs/audits/2026-09-27-simulador-tributario-ramp.md` caracteriza o legado e a referência visual. A decisão posterior da Kapitalis é usar apenas regras atuais verificáveis; situações incompletas ficam pendentes. Esta rodada altera somente a área de ferramentas e o motor do Simulador Tributário 360º.

## Tarefas

1. Criar motor puro do Simples Nacional para receita mensal comum dos Anexos I, II e III confirmados, usando RBT12 e tabelas vigentes da LC 123/2006. Testar primeiro limites, centavos, entrada inválida, exceções e a diferença para o legado. Presumido e Real devolvem estado pendente até haver bases de cálculo e tributos comparáveis.
2. Criar experiência de entradas à esquerda e dashboard à direita. Exibir DAS mensal, equivalente anual de 12 vezes o mês simulado, alíquota efetiva e ring da proporção DAS/receita. Mostrar três regimes em lista compacta, com pendências explícitas. Nunca eleger regime sem três cargas comparáveis.
3. Compartilhar por URL com somente os valores financeiros genéricos e escolhas da simulação. Restaurar ao abrir; copiar com retorno discreto. Testar entradas, resultado, pendências, restauração e link.
4. Verificar testes, lint, typecheck, build, diff e layout nos dez tamanhos pedidos. Comitar etapas semanticamente em português, sem PR nem merge.

## Critérios fiscais

- A opção de Anexo III exige confirmação explícita; “serviços sem enquadramento confirmado” fica pendente.
- A opção pelo Simples e a elegibilidade da empresa são premissas do cenário. Receita com substituição tributária, incidência monofásica, exportação, retenção ou outra segregação não entra no cálculo padrão. O usuário precisa confirmar essas premissas.
- RBT12 igual a zero, superior a R$ 3,6 milhões ou exercício de início de atividade ficam pendentes nesta rodada; a faixa com sublimites exige tratamento separado.
- O equivalente anual é `DAS mensal × 12`, apenas uma escala do mês simulado, não uma previsão nem uma apuração anual efetiva.
- “Menor carga estimada nesta simulação” aparece sem valor até haver estimativas completas e comparáveis para os três regimes.

## Fontes

- [LC 123/2006, art. 18 e Anexos I–III](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm)
- [Manual PGDAS-D, item 8.1](https://www8.receita.fazenda.gov.br/simplesnacional/arquivos/manual/manual_pgdas-d_2018_v4.pdf)
- [LC 224/2025, ajuste do Lucro Presumido a partir de 2026](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm)
