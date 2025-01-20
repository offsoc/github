import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'

import type {FilterProvider} from '../types'
import {AddFilterButton} from './AddFilterButton'

interface BlankStateProps {
  isNarrowBreakpoint: boolean
  addFilterButtonMobileRef: React.RefObject<HTMLButtonElement>
  filterProviders: FilterProvider[]
  addNewFilterBlock: (provider: FilterProvider) => void
}

export const BlankState = ({
  isNarrowBreakpoint,
  addFilterButtonMobileRef,
  filterProviders,
  addNewFilterBlock,
}: BlankStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexFlow: 'column',
        margin: 'auto',
        alignSelf: 'center',
        justifyContent: 'center',
        maxWidth: 320,
        height: '100%',
        flex: 1,
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
      {...testIdProps('afd-no-content')}
    >
      <Box sx={{fontSize: 1, fontWeight: 'bold', color: 'fg.default', mb: 1}}>Build complex filter queries</Box>
      <Box sx={{fontSize: 0, color: 'fg.muted'}}>
        To start building your query add your first filter using the button below.
      </Box>
      <Box sx={{display: ['flex', 'flex', 'none'], justifyContent: 'center', py: 3}}>
        <AddFilterButton
          size={isNarrowBreakpoint ? 'medium' : 'small'}
          ref={addFilterButtonMobileRef}
          filterProviders={filterProviders}
          addNewFilterBlock={addNewFilterBlock}
        />
      </Box>
    </Box>
  )
}
