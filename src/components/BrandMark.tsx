import type { SVGProps } from 'react'

type BrandMarkProps = Pick<
  SVGProps<SVGSVGElement>,
  'className' | 'x' | 'y' | 'width' | 'height'
>

export function BrandMark({ className, x, y, width, height }: BrandMarkProps) {
  return (
    <svg
      className={className}
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox="525 236 486 432"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <image
        data-kapitalis-brandmark
        href="/assets/kapitalis-logo-original.png"
        width="1536"
        height="1024"
      />
    </svg>
  )
}
