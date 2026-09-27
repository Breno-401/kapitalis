# Validação contábil pendente — Simulador Tributário 360º

Referência do motor: apuração mensal de 2026, LC 123/2006, art. 18 e Anexos I–III; Manual PGDAS-D, item 8.1. O simulador publicado foi usado apenas para caracterizar o legado. O motor novo não reproduz os atalhos de alíquota dele.

## Premissas para um DAS estimado

- Empresa já optante e elegível ao Simples Nacional no período.
- Anexo I, II ou III confirmado para a receita informada.
- Toda receita do mês segue a tributação comum do anexo selecionado, sem substituição tributária, incidência monofásica, exportação, retenção ou outra segregação.
- RBT12 é a receita bruta acumulada nos 12 meses **anteriores** ao mês da simulação; não é uma projeção anual.
- RBT12 maior que zero e até R$ 3,6 milhões. Início de atividade, sublimites e possível perda de opção exigem análise específica.
- DAS exibido = receita mensal × alíquota efetiva, arredondado ao centavo. A projeção anual multiplica o DAS mensal arredondado por 12 e só vale para 12 meses idênticos sob as mesmas premissas.

## Cenários para a Kapitalis conferir antes de produção

| Cenário | Receita mensal | RBT12 | Anexo | Saída esperada do motor | Ponto de validação |
| --- | ---: | ---: | --- | --- | --- |
| Primeiro intervalo de serviços | R$ 10.000,00 | R$ 120.000,00 | III | DAS R$ 600,00; 6,00%; projeção R$ 7.200,00 | Confirmar enquadramento e tratamento da receita. |
| Limite da 1ª faixa | R$ 15.000,00 | R$ 180.000,00 | III | DAS R$ 900,00; faixa 1 | Conferir fronteira inclusiva. |
| Um centavo acima | R$ 15.000,00 | R$ 180.000,01 | III | DAS R$ 900,00; faixa 2 | Confirmar continuidade da alíquota efetiva; o legado saltava R$ 225/mês. |
| Comércio na 2ª faixa | R$ 12.345,67 | R$ 360.000,00 | I | DAS R$ 697,53 | Conferir arredondamento ao centavo. |
| Indústria na 2ª faixa | R$ 12.345,67 | R$ 360.000,00 | II | DAS R$ 759,26 | Conferir arredondamento ao centavo. |
| Mês sem receita | R$ 0,00 | R$ 120.000,00 | III | DAS R$ 0,00 | Confirmar apresentação de alíquota mesmo sem receita no mês. |
| RBT12 zerado | R$ 10.000,00 | R$ 0,00 | III | Pendente | Início de atividade e RBT12 proporcionalizado. |
| Acima do sublimite | R$ 300.000,00 | R$ 3.600.000,01 | I | Pendente | ICMS/ISS e limite local. |
| Anexo incerto | R$ 10.000,00 | R$ 120.000,00 | Serviços sem anexo confirmado | Pendente | CNAE, fator R e incidências. |
| Receita especial | R$ 10.000,00 | R$ 120.000,00 | I | Pendente | Segregação no PGDAS-D. |

## Comparação entre regimes

Lucro Presumido e Lucro Real aparecem como **pendentes de validação**, sem valores. Por isso o painel não calcula diferenças, economia ou regime de menor carga. Uma comparação exigirá definir período de apuração, receitas por atividade, lucro fiscal e ajustes, créditos permitidos, tributos locais, folha e demais incidências. O Presumido deve considerar também a LC 224/2025 para receitas que excedam R$ 5 milhões em 2026. Qualquer implementação futura precisará do aceite dos cenários pela Kapitalis.

## Fontes oficiais

- [Lei Complementar 123/2006](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm)
- [Manual PGDAS-D, item 8.1](https://www8.receita.fazenda.gov.br/simplesnacional/arquivos/manual/manual_pgdas-d_2018_v4.pdf)
- [Lei Complementar 224/2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm)
- [Receita Federal: adequações do Simples para 2027](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/cgsn-atualiza-regras-do-simples-nacional-para-adequacao-a-reforma-tributaria-do-consumo)
