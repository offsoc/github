import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import type {ClipboardContent} from '../types'

export const buildTextUpdateFromClipboardContent = (
  content: ClipboardContent | string,
  memexProjectColumnId: number,
) => {
  return {
    dataType: MemexColumnDataType.Text,
    memexProjectColumnId,
    value: typeof content === 'string' ? content : content.text,
  }
}
