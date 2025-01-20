import {testIdProps} from '@github-ui/test-id-props'
import {memo} from 'react'
import type {ColumnInstance} from 'react-table'

import type {MemexItemModel} from '../../models/memex-item-model'
import {isPageTypeForGroupedItems, type PageType} from '../../state-providers/memex-items/queries/query-keys'
import {useVisiblePagination} from '../common/use-visible-pagination'
import {StyledTableCell} from './table-cell'
import {useTableInstance} from './table-provider'
import {StyledTableRow, tableRowStyle} from './table-row'

export const PLACEHOLDER_ROW_COUNT = 5

export const TablePagination: React.FC<{pageType: PageType}> = ({pageType}) => {
  const {ref, hasNextPage} = useVisiblePagination(pageType)
  const {visibleColumns} = useTableInstance()
  const testIdSuffix = isPageTypeForGroupedItems(pageType) ? `-${pageType.groupId}` : ''
  return (
    <div ref={ref} {...testIdProps(`table-pagination${testIdSuffix}`)}>
      {!hasNextPage
        ? null
        : [...Array(PLACEHOLDER_ROW_COUNT).keys()].map(key => <PlaceholderRow key={key} columns={visibleColumns} />)}
    </div>
  )
}

type PlaceholderRowProps = {
  columns: Array<ColumnInstance<MemexItemModel>>
}

const PlaceholderRowUnmemoized: React.FC<PlaceholderRowProps> = ({columns}) => {
  return (
    <StyledTableRow role="row" style={{...tableRowStyle}} {...testIdProps('placeholder-row')}>
      {columns.map(column => (
        <StyledTableCell key={column.id} role="gridcell" style={{whiteSpace: 'nowrap', width: column.width}}>
          {column.Placeholder}
        </StyledTableCell>
      ))}
    </StyledTableRow>
  )
}

const PlaceholderRow = memo(PlaceholderRowUnmemoized)
