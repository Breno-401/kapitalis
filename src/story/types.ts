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

export type StoryChapter = {
  id: string
  eyebrow: string
  title: string
  body: string
  media: StoryMedia
}
