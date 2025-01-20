import {Box, Text} from '@primer/react'
import type {SxProp} from '@primer/react/lib-esm/sx'

export type SectionProps = {
  children?: React.ReactNode
  emptyText?: string | JSX.Element
  sectionHeader: JSX.Element
  id?: string
} & SxProp

export function Section({children, emptyText, sectionHeader, id, sx}: SectionProps) {
  return (
    <Box
      data-testid={id ?? 'sidebar-section'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingTop: 1,
        marginBottom: 3,
        position: 'relative',
        width: '100%',
        ':after': {
          content: '""',
          position: 'absolute',
          height: '1px',
          bottom: '-8px',
          left: '8px',
          bg: 'border.muted',
          width: 'calc(100% - 8px)',
        },
        ...sx,
      }}
    >
      <Box sx={{width: '100%'}}>
        {sectionHeader}
        {emptyText && (
          <>
            <Text sx={{fontSize: 0, px: 2, mb: 2, mt: 1, color: 'fg.muted', display: 'block'}}>{emptyText}</Text>
            <Box sx={{height: '0px', p: 0, m: 0, border: '0', visibility: 'hidden'}}>{children}</Box>
          </>
        )}
      </Box>
      {!emptyText && <Box sx={{width: '100%', p: 0}}>{children}</Box>}
    </Box>
  )
}
