import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import type {TableDataType} from '../../../table-data-type'

export const readReviewersCellClipboardContent = (row: TableDataType) => {
  const reviews = row.columns.Reviewers
  if (!reviews || reviews.length === 0) return

  return {
    text: reviews.map(a => a.reviewer.name).join(', '),
    dataType: MemexColumnDataType.Reviewers,
    value: reviews || [],
  }
}
