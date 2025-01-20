import {Box, Text} from '@primer/react'

import type {FilterProvider, MutableFilterBlock} from '../types'
import {AddFilterButton} from './AddFilterButton'
import {AdvancedFilterItem} from './AdvancedFilterItem'

const headerStyles = {
  display: ['none', 'none', 'contents'],
  py: 1,
  fontWeight: 500,
  color: 'fg.muted',
  position: 'relative',
  height: '28px',
  fontSize: 0,
}

const headerCellStyles = {
  flexDirection: 'column',
  justifyContent: 'center',
  height: '28px',
  display: 'inline-flex',
  zIndex: 1,
}

const headerBackgroundStyles = {
  bg: 'canvas.subtle',
  borderColor: 'border.default',
  borderStyle: 'solid',
  borderTopWidth: 1,
  borderLeftWidth: 0,
  borderRightWidth: 0,
  borderBottomWidth: 1,
  position: 'absolute',
  height: '28px',
  top: 0,
  left: 0,
  right: 0,
}

interface FilterListProps {
  filterBlocks: MutableFilterBlock[]
  filterProviders: FilterProvider[]
  updateFilterBlock: (filterBlock: MutableFilterBlock) => void
  deleteFilterBlock: (index: number) => void
  isNarrowBreakpoint: boolean
  addFilterButtonMobileLastRowRef: React.RefObject<HTMLButtonElement>
  addNewFilterBlock: (provider: FilterProvider) => void
}

export const FilterList = ({
  filterBlocks,
  filterProviders,
  updateFilterBlock,
  deleteFilterBlock,
  isNarrowBreakpoint,
  addFilterButtonMobileLastRowRef,
  addNewFilterBlock,
}: FilterListProps) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        rowGap: [0, 0, 3],
        columnGap: 2,
        display: 'grid',
        gridTemplateColumns: ['1fr', '1fr', 'min-content auto minmax(80px, auto) minmax(30%,auto) min-content'],
        gridTemplateRows: 'min-content',
        width: '100%',
      }}
    >
      <Box sx={headerStyles}>
        <Box sx={headerBackgroundStyles} />
        <Box sx={headerCellStyles} />
        <Text sx={headerCellStyles}>Qualifier</Text>
        <Text sx={{...headerCellStyles}}>Operator</Text>
        <Text sx={headerCellStyles}>Value</Text>
        <div />
      </Box>
      {filterBlocks.map((filterBlock, index) => (
        <AdvancedFilterItem
          key={`advanced-filter-item-${index}`}
          filterBlock={filterBlock}
          filterProviders={filterProviders}
          updateFilterBlock={updateFilterBlock}
          index={index}
          deleteFilterBlock={deleteFilterBlock}
        />
      ))}
      <Box sx={{display: ['grid', 'grid', 'none'], pb: [3, 3, 0]}}>
        <AddFilterButton
          size={isNarrowBreakpoint ? 'medium' : 'small'}
          ref={addFilterButtonMobileLastRowRef}
          filterProviders={filterProviders}
          addNewFilterBlock={addNewFilterBlock}
        />
      </Box>
    </Box>
  )
}
