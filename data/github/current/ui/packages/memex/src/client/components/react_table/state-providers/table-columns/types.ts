import type {EditorCellProps, RendererCellProps, Row} from 'react-table'

import type {GroupingMetadataConfiguration} from '../../../../features/grouping/grouping-metadata-configurations'
import type {GroupingMetadataWithSource} from '../../../../features/grouping/types'
import type {TableDataType} from '../../table-data-type'

/**
 * This type represents the behaviour required for each field in the table.
 *
 * Not all columns currently support grouping, and sorting may require knowing
 * which column is active - this is important for custom field types which can
 * be defined multiple times for a project - but it is expected that all
 * fields will render out a cell or cell editor component.
 *
 * Fields that do not support editing will render a `null` `CellEditor`.
 */
export type ReactTableColumnBehavior = {
  typeToEditEnabled?: boolean
  groupingConfiguration?: GroupingMetadataConfiguration<Row<TableDataType>>
  Placeholder: React.ReactNode
  Cell: (props: RendererCellProps<TableDataType>) => React.ReactNode
  CellEditor: (props: EditorCellProps<TableDataType>) => React.ReactNode
}

export type CustomRowGrouping<D extends object> = GroupingMetadataWithSource & {
  rows: Array<Row<D>>
}
