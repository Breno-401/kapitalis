export type StoryChapterId =
  | 'entradas'
  | 'organizacao'
  | 'visibilidade'
  | 'decisao'

export type StoryChapter = {
  id: StoryChapterId
  eyebrow: string
  title: string
  body: string
  items: readonly string[]
}

export type StoryMedia =
  | {
      kind: 'diagram'
      scene: 'sources' | 'organized' | 'information' | 'decision'
    }
  | {
      kind: 'image'
      src: string
      alt: string
      objectPosition?: string
    }
