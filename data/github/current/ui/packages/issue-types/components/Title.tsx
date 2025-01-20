import type {FC, ReactNode} from 'react'
import {Heading} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

type TitleProps = {
  children: ReactNode
  showBorder?: boolean
  page?: string
  sx?: BetterSystemStyleObject
}

export const Title: FC<TitleProps> = ({children, page, sx, showBorder = true}) => {
  const border = showBorder
    ? {
        borderBottomStyle: 'solid',
        borderBottomColor: 'border.muted',
        borderBottomWidth: '1px',
      }
    : {}
  return (
    <Heading
      as="h2"
      id={`issue-types-heading${page ? `-${page}` : ''}`}
      sx={{
        fontSize: 4,
        fontWeight: 400,

        pb: 3,
        ...sx,
        ...border,
      }}
    >
      {children}
    </Heading>
  )
}
