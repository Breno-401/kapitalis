export type GoogleReview = {
  id: string
  author: string
  rating: 5
  text: string
  period: string
  sourceUrl: string
}

export type GoogleReviewsSnapshot = {
  provider: 'Google'
  averageRating: 5
  totalReviews: 52
  verifiedAt: string
  sourceUrl: string
  reviews: readonly GoogleReview[]
}

/** Public Google profile snapshot. Text and displayed review periods are preserved as shown. */
export const googleReviewsSnapshot: GoogleReviewsSnapshot = {
  provider: 'Google',
  averageRating: 5,
  totalReviews: 52,
  verifiedAt: '2026-09-26',
  sourceUrl:
    'https://www.google.com/search?q=kapitalis+contabilidade#lrd=0x6da4bd0a6568f94b:0xcb8c5b389e7798f2,1,,,,',
  reviews: [
    {
      id: 'jimmy-campos',
      author: 'Jimmy Campos',
      rating: 5,
      text: 'Ótima experiência. Profissional com excelente atendimento e prestatividade, resolveu sem complicações e de forma ágil a questão. Recomendo fortemente!',
      period: '3 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/109796225001755189738/reviews?hl=pt-BR',
    },
    {
      id: 'ely-santos',
      author: 'Ely Santos',
      rating: 5,
      text: 'Entrei em contato com esta empresa e fui atendido de uma maneira muito cortês e o profissional me passou muito profissionalismo no que faz! Eu super indico!',
      period: '3 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/112358610826315446266/reviews?hl=pt-BR',
    },
    {
      id: 'claudinei-bazoni',
      author: 'claudinei bazoni',
      rating: 5,
      text: 'Excelente atendimento, profissional qualificado que passa segurança, no meu primeiro contato já fechei contrato.',
      period: '3 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/103791107278955304422/reviews?hl=pt-BR',
    },
    {
      id: 'rafael-de-oliveira-matos',
      author: 'Rafael de Oliveira Matos',
      rating: 5,
      text: 'Melhor coisa que fiz ,foi ter encontrado essa contabilidade, Indicação de um amigo meu ,Tava tendo dificuldades pra resolver meu Mei ,Ele resolveu rápido, e passou para Me ,Fiquei surpreso com a eficiência, pq hoje em dia pra achar profissional bom ta muito difícil.',
      period: '3 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/110968958636918077494/reviews?hl=pt-BR',
    },
    {
      id: 'maicon-c-boone',
      author: 'Maicon C. Boone',
      rating: 5,
      text: 'Simplesmente a melhor contabilidade com a qual já fui atendido. Serviço de qualidade, com uma visão mais humana e aquele tratamento diferenciado. Indico a todos!',
      period: '6 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/111656301095879725808/reviews?hl=pt-BR',
    },
    {
      id: 'tellys-tapias-de-oliveira',
      author: 'Tellys tapias de oliveira',
      rating: 5,
      text: 'Assistência Full time, tira todas as dúvidas, sempre solícito, nos atende muito rápido. Fará toda nossa gestão fiscal! Recomendo.',
      period: '3 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/104505179886337914060/reviews?hl=pt-BR',
    },
    {
      id: 'fabricio-schinaider',
      author: 'Fabricio Schinaider',
      rating: 5,
      text: 'Um ótimo atendimento rapidez super educado E um suporte excelente',
      period: '3 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/117908121229435132212/reviews?hl=pt-BR',
    },
    {
      id: 'frank-oliveira',
      author: 'Frank Oliveira',
      rating: 5,
      text: 'Muito atencioso, me tratou muito bem! Fui bem recebido! Cuidando muito bem da minha empresa! O melhor contador da região 5.',
      period: '5 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/100772835368350382873/reviews?hl=pt-BR',
    },
    {
      id: 'lorena-barros',
      author: 'Lorena Barros',
      rating: 5,
      text: 'Ótimo preço Ótimo atendimento! Minha demanda foi resolvida em minutos.',
      period: '2 meses atrás',
      sourceUrl:
        'https://www.google.com/maps/contrib/106269992790627880150/reviews?hl=pt-BR',
    },
  ],
}
