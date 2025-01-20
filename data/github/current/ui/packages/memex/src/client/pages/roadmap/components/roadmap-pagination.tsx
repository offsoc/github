import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {memo} from 'react'

import {TextPlaceholder} from '../../../components/common/placeholders'
import {useVisiblePagination} from '../../../components/common/use-visible-pagination'
import {StyledTableCell} from '../../../components/react_table/table-cell'
import {ROADMAP_NUMBER_COLUMN_WIDTH} from '../../../components/roadmap/constants'
import {useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {isPageTypeForGroupedItems, type PageType} from '../../../state-providers/memex-items/queries/query-keys'
import {roadmapCellSx, roadmapRowSx} from './roadmap-table-layout'

export const PLACEHOLDER_ROW_COUNT = 5

export const RoadmapPagination: React.FC<{pageType: PageType}> = ({pageType}) => {
  const {ref, hasNextPage} = useVisiblePagination(pageType)
  const testIdSuffix = isPageTypeForGroupedItems(pageType) ? `-${pageType.groupId}` : ''
  return (
    <div ref={ref} {...testIdProps(`roadmap-pagination${testIdSuffix}`)}>
      {!hasNextPage ? null : [...Array(PLACEHOLDER_ROW_COUNT).keys()].map(key => <PlaceholderRow key={key} />)}
    </div>
  )
}

const PlaceholderRowUnmemoized: React.FC = () => {
  const tableWidth = useRoadmapTableWidth()
  return (
    <Box className="roadmap-row" role="row" sx={roadmapRowSx} {...testIdProps('placeholder-row')}>
      <StyledTableCell
        className="roadmap-table-cell"
        sx={roadmapCellSx}
        style={{
          height: '100%',
          position: 'sticky',
          left: 0,
          width: tableWidth,
          paddingLeft: `${ROADMAP_NUMBER_COLUMN_WIDTH}px`,
        }}
      >
        <TextPlaceholder minWidth={80} maxWidth={200} {...testIdProps('placeholder')} />
      </StyledTableCell>
    </Box>
  )
}

const PlaceholderRow = memo(PlaceholderRowUnmemoized)
