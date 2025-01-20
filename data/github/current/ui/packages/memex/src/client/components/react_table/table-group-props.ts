import type {Row} from 'react-table'

import type {GroupingMetadataWithSource} from '../../features/grouping/types'
import type {TableDataType} from './table-data-type'
import type {TableRowProps} from './table-row'

// Defined here to avoid circular imports between `use-row-drag-drop.tsx` and `table-group.tsx`
export type TableGroupProps = {
  groupId: string
  metadata: GroupingMetadataWithSource
  rows: Array<Row<TableDataType>>
  itemData: TableRowProps['data']
  scrollRef: React.RefObject<HTMLElement>
  firstRowIndex: number
  isCollapsed: boolean
  shouldDisableFooter: boolean
  footerPlaceholder: string
  isEditable: boolean
  totalCount: number
}
