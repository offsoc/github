import {Box, PageHeader} from '@primer/react'
import type {ReactNode} from 'react'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}
export function PropertyPageHeader({title, subtitle, actions}: Props) {
  return (
    <>
      <PageHeader>
        <PageHeader.TitleArea sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
          <PageHeader.Title>{title}</PageHeader.Title>
        </PageHeader.TitleArea>
        <PageHeader.Actions>{actions && <Box sx={{display: 'flex', gap: 1}}>{actions}</Box>}</PageHeader.Actions>
      </PageHeader>
      {subtitle && (
        <Box
          as="p"
          sx={{
            color: 'fg.muted',
            mb: 3,
            mt: 'var(--base-size-12)',
            pt: 3,
            borderTop: '1px solid var(--borderColor-default)',
          }}
        >
          {subtitle}
        </Box>
      )}
    </>
  )
}
