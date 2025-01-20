import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {DataTypeMismatchFailure} from '../errors'
import type {ClipboardContent} from '../types'

export const buildNumberUpdateFromClipboardContent = (
  content: ClipboardContent | string,
  memexProjectColumnId: number,
) => {
  let number: number | undefined
  if (typeof content === 'string') {
    number = parseFloat(content)

    if (isNaN(number) && content) return
  } else if (content.dataType === MemexColumnDataType.Number) {
    const numericValue = content.value
    number = numericValue?.value
  } else if (content.dataType === MemexColumnDataType.Text) {
    number = parseFloat(content.text)
    if (isNaN(number) && content.text) throw new DataTypeMismatchFailure()
  } else {
    number = parseFloat(content.text)
    if (isNaN(number) && content.text) throw new DataTypeMismatchFailure()
  }

  return {
    dataType: MemexColumnDataType.Number,
    memexProjectColumnId,
    value: number ? {value: number} : undefined,
  }
}
