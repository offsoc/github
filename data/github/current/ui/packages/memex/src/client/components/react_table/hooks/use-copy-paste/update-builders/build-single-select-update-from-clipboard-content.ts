import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import type {SingleSelectColumnModel} from '../../../../../models/column-model/custom/single-select'
import type {StatusColumnModel} from '../../../../../models/column-model/system/status'
import {DataTypeMismatchFailure} from '../errors'
import type {ClipboardContent} from '../types'

export const buildSingleSelectUpdateFromClipboardContent = (
  content: ClipboardContent | string,
  targetColumn: SingleSelectColumnModel | StatusColumnModel,
) => {
  if (typeof content === 'string') return // Do not allow arbitrary pasting for this data type
  let valueId: string | undefined

  if (content.dataType === MemexColumnDataType.SingleSelect && content.columnId === targetColumn.id) {
    const singleSelectValue = content.value
    valueId = singleSelectValue?.id
  } else if (content.dataType === MemexColumnDataType.Text) {
    const textValue = content.value

    const singleSelectOptions = targetColumn.settings.options
    const normalized = textValue?.raw.trim().toLowerCase()
    const matchingOption = singleSelectOptions.find(o => {
      return o.name.trim().toLowerCase() === normalized
    })

    valueId = matchingOption?.id
  }

  if (!valueId && content.value) {
    throw new DataTypeMismatchFailure()
  }

  return {
    dataType: MemexColumnDataType.SingleSelect,
    memexProjectColumnId: targetColumn.id,
    value: valueId ? {id: valueId} : undefined,
  }
}
