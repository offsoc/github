import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import type {TableDataType} from '../../../table-data-type'
import type {ClipboardEntry} from '../types'

export const readSubIssuesProgressCellClipboardContent = (row: TableDataType): ClipboardEntry | undefined => {
  const subIssuesProgress = row.columns['Sub-issues progress']
  if (!subIssuesProgress) return

  const text = `${subIssuesProgress.completed} / ${subIssuesProgress.total} (${subIssuesProgress.percentCompleted}%)`

  return {
    text,
    dataType: MemexColumnDataType.SubIssuesProgress,
    value: subIssuesProgress,
    html: text,
  }
}
