export type ToolField = {
  id: string
  label: string
  type: 'number' | 'select'
  step?: string
  unit?: string
  options?: readonly string[]
}

export type ToolCalculation = 'verified-factor-r' | 'pending-validation'

export type BusinessTool = {
  id: string
  name: string
  description: string
  calculation: ToolCalculation
  fields: readonly ToolField[]
}

export type ToolGroup = {
  id: string
  name: 'Tributário' | 'Pessoas e folha'
  description: string
  tools: readonly BusinessTool[]
}

const activityOptions = ['Comércio', 'Serviços Gerais', 'Indústria'] as const

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
          'Compare regimes tributários a partir da atividade e do faturamento da empresa.',
        calculation: 'pending-validation',
        fields: [
          { id: 'annual-revenue', label: 'Faturamento anual previsto (R$)', type: 'number', step: '0.01', unit: 'R$' },
          { id: 'activity', label: 'Atividade principal', type: 'select', options: activityOptions },
        ],
      },
      {
        id: 'simples-nacional',
        name: 'Calculadora Simples Nacional',
        description: 'Uma leitura tributária que depende da atividade e do período de apuração.',
        calculation: 'pending-validation',
        fields: [
          { id: 'annual-revenue', label: 'Faturamento anual previsto (R$)', type: 'number', step: '0.01', unit: 'R$' },
          { id: 'activity', label: 'Atividade principal', type: 'select', options: activityOptions },
        ],
      },
      {
        id: 'fator-r',
        name: 'Calculadora Fator R',
        description: 'Veja a proporção entre folha e receita bruta nos últimos 12 meses.',
        calculation: 'verified-factor-r',
        fields: [
          {
            id: 'revenue',
            label: 'Receita bruta anual (últimos 12 meses, R$)',
            type: 'number',
            step: '0.01',
            unit: 'R$',
          },
          {
            id: 'payroll',
            label: 'Folha anual incluindo pró-labore (últimos 12 meses, R$)',
            type: 'number',
            step: '0.01',
            unit: 'R$',
          },
          {
            id: 'activity',
            label: 'Profissão ou atividade',
            type: 'select',
            options: [
              'Clínica Médica / Medicina',
              'Arquitetura e Urbanismo',
              'Engenharia',
              'Consultoria Empresarial',
              'Advocacia',
              'Odontologia',
              'Psicologia',
              'Outros sujeitos ao Fator R',
            ],
          },
        ],
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
        description: 'Organize as informações da remuneração dos sócios.',
        calculation: 'pending-validation',
        fields: [
          { id: 'monthly-profit', label: 'Faturamento ou lucro mensal (R$)', type: 'number', step: '0.01' },
          { id: 'partners', label: 'Número de sócios', type: 'number', step: '1' },
          { id: 'desired-pro-labore', label: 'Pró-labore desejado por sócio (R$)', type: 'number', step: '0.01' },
        ],
      },
      {
        id: 'custo-clt',
        name: 'Calculadora de Custo CLT',
        description: 'Reúna o salário bruto e o regime tributário para estimar o custo.',
        calculation: 'pending-validation',
        fields: [
          { id: 'gross-salary', label: 'Salário bruto mensal (R$)', type: 'number', step: '0.01' },
          {
            id: 'tax-regime',
            label: 'Regime de tributação',
            type: 'select',
            options: ['Simples Nacional', 'Lucro Presumido / Real'],
          },
        ],
      },
      {
        id: 'rescisao',
        name: 'Calculadora de Rescisão',
        description: 'Organize salário, tempo trabalhado e motivo do desligamento.',
        calculation: 'pending-validation',
        fields: [
          { id: 'last-salary', label: 'Último salário (R$)', type: 'number', step: '0.01' },
          { id: 'months-worked', label: 'Meses trabalhados', type: 'number', step: '1' },
          {
            id: 'termination-reason',
            label: 'Motivo do desligamento',
            type: 'select',
            options: ['Demissão sem justa causa', 'Pedido de demissão'],
          },
        ],
      },
      {
        id: 'hora-extra',
        name: 'Calculadora de Hora Extra',
        description: 'Reúna salário, jornada e quantidade de horas extras.',
        calculation: 'pending-validation',
        fields: [
          { id: 'base-salary', label: 'Salário base mensal (R$)', type: 'number', step: '0.01' },
          { id: 'monthly-hours', label: 'Jornada mensal', type: 'number', step: '1' },
          { id: 'overtime-hours', label: 'Quantidade de horas', type: 'number', step: '0.01' },
          {
            id: 'overtime-rate',
            label: 'Percentual de acréscimo',
            type: 'select',
            options: ['50% (dias úteis)', '100% (domingos e feriados)'],
          },
        ],
      },
    ],
  },
]

export const businessTools = toolGroups.flatMap((group) => group.tools)
