import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import type {SingleSelectValue} from '../../../../../api/columns/contracts/single-select'
import {asSingleSelectValue} from '../../../../../helpers/parsing'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'
import type {ValidSingleSelectColumn} from '../types'

export const readSingleSelectCellClipboardContent = (row: TableDataType, column: ValidSingleSelectColumn) => {
  const customColumnValue = row.columns[column.id]
  const customValue = customColumnValue as SingleSelectValue
  const valueId = customValue?.id

  const matchingOption = column.options.find(o => o.id === valueId)

  const raw = asSingleSelectValue(customColumnValue) || undefined
  const text = matchingOption?.name || ''

  return {
    text,
    dataType: MemexColumnDataType.SingleSelect,
    value: raw,
    html: matchingOption ? sanitizeTextInputHtmlString(matchingOption.nameHtml) : undefined,
  }
}
