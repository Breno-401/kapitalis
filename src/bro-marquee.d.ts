declare module '@bro-design/bro-marquee/dist/bro-marquee.min.js?react' {
  export default class BroInfiniteMarquee {
    constructor(element: HTMLElement)
    ready: Promise<void>
    c: { spd: number; spdM: number | null }
    start(): void
    stop(): void
    destroy(): void
  }
}
