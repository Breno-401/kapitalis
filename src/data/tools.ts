import { site } from './site'

export type ToolDestination = {
  href: string
  state: 'single-page-entry' | 'single-page-panel'
  note: string
}

export type BusinessTool = {
  id: string
  name: string
  description: string
  destination: ToolDestination
}

export type ToolGroup = {
  id: string
  name: 'Tributário' | 'Pessoas e folha'
  description: string
  tools: readonly BusinessTool[]
}

const simulatorDestination: ToolDestination = {
  href: site.websiteUrl,
  state: 'single-page-entry',
  note: 'Abra “Simule Agora” no site publicado; não há URL própria observada.',
}

const calculatorDestination: ToolDestination = {
  href: `${site.websiteUrl}#calculadoras`,
  state: 'single-page-panel',
  note: 'Painel #calculadoras; selecione a ferramenta na lista do site publicado.',
}

export const toolGroups: readonly ToolGroup[] = [
  {
    id: 'tributario',
    name: 'Tributário',
    description: 'Regimes e enquadramentos para uma leitura tributária mais clara.',
    tools: [
      {
        id: 'simulador-tributario-360',
        name: 'Simulador Tributário 360º',
        description:
          'Compare Simples Nacional, Lucro Presumido e Lucro Real na ferramenta publicada.',
        destination: simulatorDestination,
      },
      {
        id: 'simples-nacional',
        name: 'Calculadora Simples Nacional',
        description: 'Abra a calculadora pelo painel de ferramentas do site atual.',
        destination: calculatorDestination,
      },
      {
        id: 'fator-r',
        name: 'Calculadora Fator R',
        description: 'Abra a calculadora pelo painel de ferramentas do site atual.',
        destination: calculatorDestination,
      },
    ],
  },
  {
    id: 'pessoas-folha',
    name: 'Pessoas e folha',
    description: 'Ferramentas publicadas para remuneração, vínculo e jornada.',
    tools: [
      {
        id: 'pro-labore',
        name: 'Calculadora de Pró-labore',
        description:
          'Estime distribuição de lucros e encargos no painel de pró-labore atual.',
        destination: calculatorDestination,
      },
      {
        id: 'custo-clt',
        name: 'Calculadora de Custo CLT',
        description: 'Abra a calculadora pelo painel de ferramentas do site atual.',
        destination: calculatorDestination,
      },
      {
        id: 'rescisao',
        name: 'Calculadora de Rescisão',
        description: 'Abra a calculadora pelo painel de ferramentas do site atual.',
        destination: calculatorDestination,
      },
      {
        id: 'hora-extra',
        name: 'Calculadora de Hora Extra',
        description: 'Abra a calculadora pelo painel de ferramentas do site atual.',
        destination: calculatorDestination,
      },
    ],
  },
]
