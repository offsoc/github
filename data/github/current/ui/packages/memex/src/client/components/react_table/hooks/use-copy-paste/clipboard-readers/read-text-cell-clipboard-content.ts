import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {asCustomTextValue} from '../../../../../helpers/parsing'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'

export const readTextCellClipboardContent = (row: TableDataType, columnId: number) => {
  const customColumnValue = row.columns[columnId]
  const value = asCustomTextValue(customColumnValue) || undefined

  return {
    text: value?.raw || '',
    dataType: MemexColumnDataType.Text,
    value,
    html: value ? sanitizeTextInputHtmlString(value.html) : '',
  }
}
