import type {SxProp} from '@primer/react'
import {Text} from '@primer/react'
import type {PropsWithChildren} from 'react'

const defaultStyle = {
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '18px',
  marginTop: 2,
  color: 'fg.muted',
}

export interface DescriptionProps extends SxProp {}

export function Description({sx, children}: PropsWithChildren<DescriptionProps>) {
  const style = {...defaultStyle, sx}

  return (
    <Text as="p" sx={style}>
      {children}
    </Text>
  )
}
