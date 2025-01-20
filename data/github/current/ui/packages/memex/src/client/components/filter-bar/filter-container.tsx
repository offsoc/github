import {type TestIdProps, testIdProps} from '@github-ui/test-id-props'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'
import {Box} from '@primer/react'
import {useRef} from 'react'

type FilterContainerProps = TestIdProps

/**
 * Renders a styled div for the `<Tokenized`FilterInput />` component
 */
export function FilterContainer({children, ...props}: React.PropsWithChildren<FilterContainerProps>) {
  const filterContainerRef = useRef<HTMLDivElement>(null)
  const breakpoint = useContainerBreakpoint(filterContainerRef.current)

  return (
    <Box
      ref={filterContainerRef}
      role="region"
      aria-label="View filters"
      {...testIdProps('base-filter-input')}
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        maxWidth: '100%',
        position: 'relative',
        gap: 2,
        flexWrap: breakpoint(['wrap', 'nowrap']),
        justifyContent: breakpoint(['flex-end', 'space-between']),
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
