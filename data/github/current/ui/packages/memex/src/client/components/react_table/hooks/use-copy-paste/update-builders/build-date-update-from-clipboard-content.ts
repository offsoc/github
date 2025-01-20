import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {DataTypeMismatchFailure} from '../errors'
import type {ClipboardContent} from '../types'

export const buildDateUpdateFromClipboardContent = (
  content: ClipboardContent | string,
  memexProjectColumnId: number,
) => {
  if (typeof content === 'string') return // Do not allow arbitrary pasting for this data type

  if (content.dataType === MemexColumnDataType.Date) {
    const dateValue = content.value

    return {
      dataType: MemexColumnDataType.Date,
      memexProjectColumnId,
      value: dateValue ? {value: dateValue.value} : undefined,
    }
  }

  if (content?.value) throw new DataTypeMismatchFailure()

  return {
    dataType: MemexColumnDataType.Date,
    memexProjectColumnId,
    value: undefined,
  }
}
