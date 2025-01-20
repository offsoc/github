import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef} from 'react'

const filterInputContainerStyles: BetterSystemStyleObject = {
  alignItems: 'center',
  pl: '12px',
  pr: 2,
  maxWidth: '100%',
  flexShrink: 1,
  flexGrow: 1,
  minHeight: '32px',
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: 2,
  minWidth: '20px',
  borderRadius: 2,
  borderColor: 'border.default',
  borderStyle: 'solid',
  borderWidth: '1px',
  ':hover': {
    cursor: 'text',
  },
  '&.is-focused': {
    borderColor: 'accent.fg',
  },
}
export const FilterInputContainer = forwardRef<HTMLDivElement, {children: React.ReactNode}>(
  function FilterInputContainer({children}, forwardedRef) {
    return (
      <Box ref={forwardedRef} sx={filterInputContainerStyles}>
        {children}
      </Box>
    )
  },
)
