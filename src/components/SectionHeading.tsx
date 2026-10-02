import type { HTMLAttributes, ReactNode } from 'react'

type SectionHeadingProps = {
  as?: 'h2' | 'h3'
  id: string
  title: string
  description?: ReactNode
} & Pick<HTMLAttributes<HTMLElement>, 'className'>

export function SectionHeading({
  as = 'h2',
  id,
  title,
  description,
  className,
}: SectionHeadingProps) {
  const Heading = as

  return (
    <div className={className} data-reveal-group>
      <Heading id={id} data-reveal="text" data-reveal-step="1">{title}</Heading>
      {description ? <p data-reveal="text" data-reveal-step="2">{description}</p> : null}
    </div>
  )
}
