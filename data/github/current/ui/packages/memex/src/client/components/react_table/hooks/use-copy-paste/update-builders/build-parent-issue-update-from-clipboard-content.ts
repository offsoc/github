import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {DataTypeMismatchFailure} from '../errors'
import type {ClipboardContent} from '../types'

export const buildParentIssueUpdateFromClipboardContent = (content: ClipboardContent | string) => {
  if (typeof content === 'string') return // Do not allow arbitrary pasting for this data type
  if (content.dataType !== MemexColumnDataType.ParentIssue) throw new DataTypeMismatchFailure()

  const parentIssue = content.value

  return {
    dataType: MemexColumnDataType.ParentIssue,
    value: parentIssue,
  }
}
