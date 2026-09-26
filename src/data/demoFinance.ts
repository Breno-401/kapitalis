export type DemoFinanceView = 'payments' | 'receipts' | 'closing'

export type DemoFinanceTone = 'neutral' | 'positive' | 'attention'

export type DemoFinanceRecord = {
  id: string
  title: string
  detail: string
  amount: string
  status: string
  tone: DemoFinanceTone
}

export type DemoFinanceViewState = {
  title: string
  panelStatus: string
  summaryLabel: string
  summaryValue: string
  summaryNote: string
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
      records: [
        {
          id: 'obrigacao-proxima',
          title: 'Obrigação próxima',
          detail: 'Vence em 02 out',
          amount: 'R$ 4.280',
          status: 'Próximo vencimento',
          tone: 'attention',
        },
        {
          id: 'despesas-periodo',
          title: 'Despesas do período',
          detail: 'Vence em 04 out',
          amount: 'R$ 1.940',
          status: 'Programado',
          tone: 'neutral',
        },
        {
          id: 'outros-compromissos',
          title: 'Outros compromissos',
          detail: 'Vence em 05 out',
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
      records: [
        {
          id: 'entradas-inicio',
          title: 'Entradas do início da semana',
          detail: 'Até 02 out',
          amount: 'R$ 8.950',
          status: 'Previsto',
          tone: 'neutral',
        },
        {
          id: 'valores-conciliacao',
          title: 'Valores em conciliação',
          detail: 'Até 04 out',
          amount: 'R$ 6.200',
          status: 'Em conferência',
          tone: 'attention',
        },
        {
          id: 'demais-recebimentos',
          title: 'Demais recebimentos',
          detail: 'Até 05 out',
          amount: 'R$ 10.650',
          status: 'Previsto',
          tone: 'neutral',
        },
      ],
    },
    closing: {
      title: 'Fechamento e leitura do período',
      panelStatus: 'ACOMPANHAMENTO · DEMONSTRATIVO',
      summaryLabel: 'Saldo projetado',
      summaryValue: 'R$ 18.640',
      summaryNote: 'Estimativa ilustrativa até sexta-feira',
      records: [
        {
          id: 'entradas-fechamento',
          title: 'Entradas previstas',
          detail: 'Movimento da semana',
          amount: 'R$ 25.800',
          status: 'Acompanhadas',
          tone: 'positive',
        },
        {
          id: 'compromissos-fechamento',
          title: 'Compromissos',
          detail: 'Pagamentos do período',
          amount: '− R$ 7.160',
          status: 'Organizados',
          tone: 'positive',
        },
        {
          id: 'conciliacao-fechamento',
          title: 'Conciliação bancária',
          detail: 'Revisão do movimento',
          amount: '—',
          status: 'Em conferência',
          tone: 'attention',
        },
      ],
    },
  },
}
