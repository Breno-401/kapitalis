export type DemoFinanceView = 'payments' | 'receipts' | 'closing'

export type DemoFinanceTone = 'neutral' | 'positive' | 'attention'

export type DemoFinanceRecord = {
  id: string
  date: string
  title: string
  detail: string
  amount: string
  status: string
  tone: DemoFinanceTone
}

export type DemoFinanceMetric = {
  id: string
  label: string
  value: string
  note: string
  tone: DemoFinanceTone
}

export type DemoFinanceViewState = {
  title: string
  panelStatus: string
  summaryLabel: string
  summaryValue: string
  summaryNote: string
  timelineLabel: string
  metrics: readonly DemoFinanceMetric[]
  records: readonly DemoFinanceRecord[]
}

export type DemoFinanceState = {
  period: string
  overview: {
    projectedBalance: string
    inflows: string
    commitments: string
    routines: readonly { id: string; label: string; detail: string }[]
  }
  views: Record<DemoFinanceView, DemoFinanceViewState>
}

export const DEMO_FINANCE_STATE: DemoFinanceState = {
  period: '01—05 OUT 2026',
  overview: {
    projectedBalance: 'R$ 18.640',
    inflows: 'R$ 25.800',
    commitments: 'R$ 7.160',
    routines: [
      {
        id: 'vencimentos',
        label: 'Próximo vencimento',
        detail: '02 OUT · R$ 4.280',
      },
      {
        id: 'conciliacao',
        label: 'Conciliação bancária',
        detail: 'Em conferência',
      },
      {
        id: 'fechamento',
        label: 'Fechamento do período',
        detail: 'Em organização',
      },
    ],
  },
  views: {
    payments: {
      title: 'Agenda de pagamentos',
      panelStatus: 'COMPROMISSOS · DEMONSTRATIVO',
      summaryLabel: 'Compromissos previstos',
      summaryValue: 'R$ 7.160',
      summaryNote: 'Organização ilustrativa da semana',
      timelineLabel: 'Compromissos previstos no período',
      metrics: [
        {
          id: 'proximo-vencimento',
          label: 'Próximo vencimento',
          value: '02 OUT',
          note: 'primeira data da agenda',
          tone: 'attention',
        },
        {
          id: 'programados',
          label: 'Programados',
          value: '3',
          note: 'no período demonstrativo',
          tone: 'neutral',
        },
        {
          id: 'maior-compromisso',
          label: 'Maior compromisso',
          value: 'R$ 4.280',
          note: 'valor demonstrativo',
          tone: 'neutral',
        },
      ],
      records: [
        {
          id: 'obrigacao-proxima',
          date: '02 OUT',
          title: 'Obrigação próxima',
          detail: 'Primeiro vencimento',
          amount: 'R$ 4.280',
          status: 'Próximo vencimento',
          tone: 'attention',
        },
        {
          id: 'despesas-periodo',
          date: '04 OUT',
          title: 'Despesas do período',
          detail: 'Compromisso programado',
          amount: 'R$ 1.940',
          status: 'Programado',
          tone: 'neutral',
        },
        {
          id: 'outros-compromissos',
          date: '05 OUT',
          title: 'Outros compromissos',
          detail: 'Compromisso organizado',
          amount: 'R$ 940',
          status: 'Organizado',
          tone: 'positive',
        },
      ],
    },
    receipts: {
      title: 'Acompanhamento de recebimentos',
      panelStatus: 'ENTRADAS · DEMONSTRATIVO',
      summaryLabel: 'Entradas previstas',
      summaryValue: 'R$ 25.800',
      summaryNote: 'Previsão ilustrativa até 05 out',
      timelineLabel: 'Entradas previstas e recebidas',
      metrics: [
        {
          id: 'recebimentos-previstos',
          label: 'Previsto',
          value: 'R$ 25.800',
          note: 'no período demonstrativo',
          tone: 'neutral',
        },
        {
          id: 'recebimentos-confirmados',
          label: 'Recebido',
          value: 'R$ 8.950',
          note: 'entrada confirmada',
          tone: 'positive',
        },
        {
          id: 'recebimentos-pendentes',
          label: 'Pendente',
          value: 'R$ 16.850',
          note: 'previsto para a semana',
          tone: 'attention',
        },
      ],
      records: [
        {
          id: 'entradas-inicio',
          date: '01 OUT',
          title: 'Entrada confirmada',
          detail: 'Início da semana',
          amount: 'R$ 8.950',
          status: 'Recebido',
          tone: 'positive',
        },
        {
          id: 'valores-conciliacao',
          date: '03 OUT',
          title: 'Lote em conciliação',
          detail: 'Data prevista',
          amount: 'R$ 6.200',
          status: 'Pendente',
          tone: 'attention',
        },
        {
          id: 'demais-recebimentos',
          date: '05 OUT',
          title: 'Demais recebimentos',
          detail: 'Data prevista',
          amount: 'R$ 10.650',
          status: 'Pendente',
          tone: 'neutral',
        },
      ],
    },
    closing: {
      title: 'Fechamento e leitura do período',
      panelStatus: 'FECHAMENTO · DEMONSTRATIVO',
      summaryLabel: 'Saldo projetado',
      summaryValue: 'R$ 18.640',
      summaryNote: 'Estimativa ilustrativa até sexta-feira',
      timelineLabel: 'Rotina de fechamento demonstrativa',
      metrics: [
        {
          id: 'movimentos-conciliados',
          label: 'Movimentos conciliados',
          value: '18 de 21',
          note: 'etapa demonstrativa',
          tone: 'positive',
        },
        {
          id: 'movimentos-revisao',
          label: 'A revisar',
          value: '3 movimentos',
          note: 'em conferência',
          tone: 'attention',
        },
        {
          id: 'dias-periodo',
          label: 'Resumo do período',
          value: '5 dias',
          note: '01 a 05 de outubro',
          tone: 'neutral',
        },
      ],
      records: [
        {
          id: 'entradas-fechamento',
          date: '01—02 OUT',
          title: 'Entradas do período',
          detail: 'Resumo das entradas previstas',
          amount: 'R$ 25.800',
          status: 'Acompanhadas',
          tone: 'positive',
        },
        {
          id: 'compromissos-fechamento',
          date: '03—04 OUT',
          title: 'Compromissos',
          detail: 'Pagamentos do período',
          amount: '− R$ 7.160',
          status: 'Organizados',
          tone: 'positive',
        },
        {
          id: 'conciliacao-fechamento',
          date: '05 OUT',
          title: 'Conciliação bancária',
          detail: 'Resumo do período',
          amount: 'R$ 18.640',
          status: 'Em conferência',
          tone: 'attention',
        },
      ],
    },
  },
}
