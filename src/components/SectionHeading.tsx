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
    <header className={className}>
      <Heading id={id}>{title}</Heading>
      {description ? <p>{description}</p> : null}
    </header>
  )
}
