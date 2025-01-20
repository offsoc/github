import type {IterationValue} from '../../../../../api/columns/contracts/iteration'
import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'
import type {ValidIterationColumn} from '../types'

export const readIterationCellClipboardContent = (row: TableDataType, column: ValidIterationColumn) => {
  const customColumnValue = row.columns[column.id]
  const customValue = customColumnValue as IterationValue
  const valueId = customValue?.id

  const matchingIteration = column.allIterations.find(i => i.id === valueId)
  const raw = customValue
  const text = matchingIteration?.title || ''

  return {
    text,
    dataType: MemexColumnDataType.Iteration,
    value: raw,
    html: matchingIteration ? sanitizeTextInputHtmlString(matchingIteration.titleHtml) : '',
  }
}
