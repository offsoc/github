import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {asCustomDateString, asCustomDateValue} from '../../../../../helpers/parsing'
import type {TableDataType} from '../../../table-data-type'

export const readDateCellClipboardContent = (row: TableDataType, columnId: number) => {
  const customColumnValue = row.columns[columnId]
  const customValue = customColumnValue
  const text = asCustomDateString(customValue) || ''
  const raw = asCustomDateValue(customColumnValue) || undefined

  return {text, dataType: MemexColumnDataType.Date, value: raw}
}
