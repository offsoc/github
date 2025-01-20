import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {asCustomNumberValue} from '../../../../../helpers/parsing'
import type {TableDataType} from '../../../table-data-type'

export const readNumberCellClipboardContent = (row: TableDataType, columnId: number) => {
  const customColumnValue = row.columns[columnId]
  const value = asCustomNumberValue(customColumnValue) || undefined

  return {
    text: value ? value.value.toString() : '',
    dataType: MemexColumnDataType.Number,
    value,
  }
}
