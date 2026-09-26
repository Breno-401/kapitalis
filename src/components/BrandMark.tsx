import type { ImgHTMLAttributes } from 'react'

type BrandMarkProps = Pick<ImgHTMLAttributes<HTMLImageElement>, 'className'>

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      className={className}
      src="/assets/kapitalis-logo-original.png"
      alt=""
      aria-hidden="true"
      width={96}
      height={64}
      decoding="async"
    />
  )
}
