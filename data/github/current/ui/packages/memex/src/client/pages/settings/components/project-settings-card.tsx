import {Box, Heading, Text} from '@primer/react'
import type {ReactNode} from 'react'

type ProjectSettingsCardProps = {
  showDivider?: boolean
  children: ReactNode
}

export function ProjectSettingsCard({children, showDivider}: ProjectSettingsCardProps) {
  return (
    <Box
      sx={{
        justifyItems: 'center',
        p: 3,
        display: 'flex',
        ...(showDivider
          ? {
              borderBottomColor: 'border.muted',
              borderBottomStyle: 'solid',
              borderBottomWidth: '1px',
            }
          : {borderBottom: 'unset'}),
      }}
    >
      {children}
    </Box>
  )
}

type ProjectSettingsCardHeaderProps = {
  title: string
  description: string
  children?: ReactNode
}

export function ProjectSettingsCardHeader({title, description, children}: ProjectSettingsCardHeaderProps) {
  return (
    <Box sx={{flex: 'auto'}}>
      <Heading as="h3" sx={{mb: 1, fontSize: 1}}>
        {title}
      </Heading>
      {children}
      <Text sx={{fontSize: 1}}>{description}</Text>
    </Box>
  )
}

export function ProjectSettingsCardBody({children}: {children: ReactNode}) {
  return <Box sx={{display: 'flex', alignItems: 'center', gap: '24px'}}>{children}</Box>
}
