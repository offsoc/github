import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {DataTypeMismatchFailure} from '../errors'
import type {ClipboardContent} from '../types'

export const buildLabelsUpdateFromClipboardContent = (content: ClipboardContent | string) => {
  if (typeof content === 'string') return // Do not allow arbitrary pasting for this data type
  if (content.dataType !== MemexColumnDataType.Labels) throw new DataTypeMismatchFailure()

  const labels = content.value
  const payload = {
    dataType: MemexColumnDataType.Labels,
    value: labels,
  }

  return payload
}
