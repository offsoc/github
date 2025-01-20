import type React from 'react'

import {Box, Text, type SxProp} from '@primer/react'

export function EllipsisOverflow(props: React.PropsWithChildren<{title: string}>) {
  return (
    <Box
      title={props.title}
      sx={{
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        direction: 'rtl',
      }}
    >
      {props.children}
    </Box>
  )
}

export function CenteredContent(props: React.PropsWithChildren<SxProp>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        ...props.sx,
        gap: 2,
      }}
    >
      {props.children}
    </Box>
  )
}

export function TextWithIcon(props: React.PropsWithChildren<{icon: React.ReactNode} & SxProp>) {
  return (
    <CenteredContent>
      {props.icon}
      <Text sx={props.sx}>{props.children}</Text>
    </CenteredContent>
  )
}
