import type {SxProp} from '@primer/react'
import {Heading} from '@primer/react'

export type TitleProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode | string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  sx?: SxProp
}

const Title = ({children, as = 'h3', sx, ...restProps}: TitleProps) => {
  return (
    <Heading
      as={as}
      sx={{
        font: 'var(--text-body-shorthand-medium)',
        fontWeight: 'var(--text-title-weight-medium)',
        ...sx,
      }}
      {...restProps}
    >
      {children}
    </Heading>
  )
}
Title.displayName = 'ControlGroup.Title'

export default Title
