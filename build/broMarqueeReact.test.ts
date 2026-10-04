// @vitest-environment node
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { broMarqueeReactSource } from './broMarqueeReact.js'

const require = createRequire(import.meta.url)
const official = readFileSync(require.resolve('@bro-design/bro-marquee'), 'utf8')

function method(source: string, name: string) {
  const start = source.indexOf(`#${name}(`)
  // Find the declaration rather than a call on this.
  let declaration = start
  while (source.slice(declaration - 5, declaration) === 'this.') declaration = source.indexOf(`#${name}(`, declaration + 1)
  const opening = source.indexOf('{', declaration)
  let depth = 1, end = opening + 1
  for (; depth && end < source.length; end++) {
    if (source[end] === '{') depth++
    if (source[end] === '}') depth--
  }
  return source.slice(declaration, end)
    .replaceAll('this.#frame(', 'requestAnimationFrame(')
    .replaceAll('this.#listen(document,', 'document.addEventListener(')
}

describe('broMarquee npm source integration', () => {
  it('bundles the installed 1.0.1 constructor and disables document-wide auto-init', () => {
    const result = broMarqueeReactSource(official)
    expect(official).toContain('BroMarquee 1.0.1')
    expect(result).toContain('export default InfiniteMarquee;')
    expect(result).not.toContain('window.initBroMarquees')
    expect(result).toContain('destroy(){')
  })

  it.each(['parse', 'spd', 'norm', 'tr', 'anim', 'ds', 'pd', 'df', 'wh', 'decay', 'inert', 'sync'])(
    'preserves the official %s implementation apart from resource tracking', name => {
      expect(method(broMarqueeReactSource(official), name)).toBe(method(official, name))
    },
  )

  it('fails visibly if an upstream change invalidates the lifecycle adapter', () => {
    expect(() => broMarqueeReactSource('an incompatible module')).toThrow('Unexpected broMarquee')
  })
})
