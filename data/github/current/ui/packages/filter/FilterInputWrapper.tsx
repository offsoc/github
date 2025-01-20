import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {PropsWithChildren} from 'react'

type FilterInputWrapperProps = PropsWithChildren & {
  isStandalone?: boolean
}
export const FilterInputWrapper = ({children, isStandalone = false}: FilterInputWrapperProps) => {
  if (isStandalone) {
    return (
      <Box {...testIdProps('filter-bar')} sx={{display: 'inline-flex'}}>
        {children}
      </Box>
    )
  }
  return (
    <Box
      {...testIdProps('filter-bar')}
      sx={{
        display: 'inline-flex',
        width: '100%',
        maxWidth: '100%',
        color: 'fg.default',
        verticalAlign: 'middle',
        fontSize: 1,
        position: 'relative',
        cursor: 'text',
        bg: 'canvas.default',
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  )
}
