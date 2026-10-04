import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import type { Plugin } from 'vite'

const require = createRequire(import.meta.url)
export const broMarqueeImport = '@bro-design/bro-marquee/dist/bro-marquee.min.js?react'

/**
 * 1.0.1 is a browser IIFE with no exports or destroy(). Bundle the installed MIT
 * source as an explicit constructor, adding resource disposal only. The official
 * cloning, measurement, wrapping, input, inertia and animation code stays intact.
 * Replacements deliberately fail on an incompatible upstream release.
 */
export function broMarqueeReactSource(source: string) {
  function replace(before: string, after: string) {
    if (!source.includes(before)) throw new Error(`Unexpected broMarquee 1.0.1 source: ${before}`)
    source = source.replace(before, after)
  }
  replace("!function(){'use strict';", "'use strict';")
  const autoInit = source.indexOf('const init=()=>document.querySelectorAll')
  if (autoInit === -1) throw new Error('Missing broMarquee auto-init boundary')
  source = source.slice(0, autoInit) + 'export default InfiniteMarquee;'
  replace('constructor(el){', 'constructor(el){this.destroyed=false;this.frames=new Set();this.listeners=[];')
  replace('this.c=this.#parse();', 'this.originals=[...this.l.children];this.wrapperStyle=this.w.getAttribute("style");this.c=this.#parse();')
  replace('this.#bind();this.#init()', 'this.#bind();this.ready=this.#init()')
  replace('this.l.offsetHeight;', 'if(this.destroyed)return;this.l.offsetHeight;')
  replace('new IntersectionObserver(', '(this.io=new IntersectionObserver(')
  replace('{threshold:0}).observe(this.el)', '{threshold:0})).observe(this.el)')
  // Retain exact callback identities, including the anonymous upstream listeners.
  for (const target of ['this.w', 'this.el', 'document', 'window']) {
    source = source.replaceAll(`${target}.addEventListener(`, `this.#listen(${target},`)
  }
  source = source.replaceAll('requestAnimationFrame(', 'this.#frame(')
  replace('cancelAnimationFrame(this.aid);', 'cancelAnimationFrame(this.aid);this.frames.delete(this.aid);')
  replace('#parse(){', `
    #listen(target,type,listener,options){
      target.addEventListener(type,listener,options);
      if(!this.listeners.some(entry=>entry[0]===target&&entry[1]===type&&entry[2]===listener))
        this.listeners.push([target,type,listener,options]);
    }
    #frame(callback){
      if(this.destroyed)return null;
      const id=requestAnimationFrame(time=>{
        this.frames.delete(id);
        if(!this.destroyed)callback(time);
      });
      this.frames.add(id);return id;
    }
    destroy(){
      if(this.destroyed)return;
      this.destroyed=true;this.stop();
      this.frames.forEach(id=>cancelAnimationFrame(id));this.frames.clear();
      clearTimeout(this.wt);this.io?.disconnect();
      this.listeners.forEach(([target,type,listener,options])=>target.removeEventListener(type,listener,options));
      this.listeners=[];
      [...this.l.children].forEach(item=>{if(!this.originals.includes(item))item.remove()});
      if(this.wrapperStyle===null)this.w.removeAttribute('style');
      else this.w.setAttribute('style',this.wrapperStyle);
      if(this.el.__marqueeInstance===this)delete this.el.__marqueeInstance;
    }
    #parse(){`)
  return source
}

export function broMarqueeReact(): Plugin {
  const id = '\0bro-marquee-react'
  const license = readFileSync(new URL('../LICENSES/bro-marquee.txt', import.meta.url), 'utf8')
  return {
    name: 'bro-marquee-react-lifecycle',
    enforce: 'pre',
    resolveId: (specifier) => specifier === broMarqueeImport ? id : undefined,
    load: (specifier) => specifier === id
      ? '/*!\n' + license + '\n*/\n'
        + broMarqueeReactSource(readFileSync(require.resolve('@bro-design/bro-marquee'), 'utf8'))
      : undefined,
    // Vite's minifier strips source comments. Ship the full MIT notice with the
    // generated assets as well, so every production distribution includes it.
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'assets/bro-marquee.LICENSE.txt', source: license })
    },
  }
}
