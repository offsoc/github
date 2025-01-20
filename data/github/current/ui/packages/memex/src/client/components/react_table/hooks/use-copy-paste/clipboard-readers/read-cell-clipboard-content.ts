import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {assertNever} from '../../../../../helpers/assert-never'
import {ClipboardOnly_UrlColumnModel} from '../constants'
import type {ClipboardCellData, ClipboardEntry} from '../types'
import {readAssigneesCellClipboardContent} from './read-assignees-cell-clipboard-content'
import {readClipboardOnlyUrlCellClipboardContent} from './read-clipboard-only-url-cell-clipboard-content'
import {readDateCellClipboardContent} from './read-date-cell-clipboard-content'
import {readIssueTypeCellClipboardContent} from './read-issue-type-cell-clipboard-content'
import {readIterationCellClipboardContent} from './read-iteration-cell-clipboard-content'
import {readLabelsCellClipboardContent} from './read-labels-cell-clipboard-content'
import {readLinkedPullRequestsCellClipboardContent} from './read-linked-pull-requests-cell-clipboard-content'
import {readMilestoneCellClipboardContent} from './read-milestone-cell-clipboard-content'
import {readNumberCellClipboardContent} from './read-number-cell-clipboard-content'
import {readParentIssueCellClipboardContent} from './read-parent-issue-cell-clipboard-content'
import {readRepositoryCellClipboardContent} from './read-repository-cell-clipboard-content'
import {readReviewersCellClipboardContent} from './read-reviewers-cell-clipboard-content'
import {readSingleSelectCellClipboardContent} from './read-single-select-cell-clipboard-content'
import {readSubIssuesProgressCellClipboardContent} from './read-sub-issues-progress-cell-clipboard-content'
import {readTextCellClipboardContent} from './read-text-cell-clipboard-content'
import {readTitleCellClipboardContent} from './read-title-cell-clipboard-content'
import {readTrackedByCellClipboardContent} from './read-tracked-by-cell-clipboard-content'
import {readTracksCellClipboardContent} from './read-tracks-cell-clipboard-content'

export const readCellClipboardContent = (cellData: ClipboardCellData): ClipboardEntry | undefined => {
  const {column, row} = cellData

  switch (column.dataType) {
    case MemexColumnDataType.Title: {
      return readTitleCellClipboardContent(row)
    }
    case MemexColumnDataType.Assignees: {
      return readAssigneesCellClipboardContent(row)
    }
    case MemexColumnDataType.Labels: {
      return readLabelsCellClipboardContent(row)
    }
    case MemexColumnDataType.Milestone: {
      return readMilestoneCellClipboardContent(row)
    }
    case MemexColumnDataType.ParentIssue: {
      return readParentIssueCellClipboardContent(row)
    }
    case MemexColumnDataType.Repository: {
      return readRepositoryCellClipboardContent(row)
    }
    case MemexColumnDataType.SubIssuesProgress: {
      return readSubIssuesProgressCellClipboardContent(row)
    }
    case MemexColumnDataType.Tracks: {
      return readTracksCellClipboardContent(row)
    }
    case MemexColumnDataType.TrackedBy: {
      return readTrackedByCellClipboardContent(row)
    }
    case MemexColumnDataType.IssueType: {
      return readIssueTypeCellClipboardContent(row)
    }
    case MemexColumnDataType.Text: {
      return readTextCellClipboardContent(row, column.id)
    }
    case MemexColumnDataType.Number: {
      return readNumberCellClipboardContent(row, column.id)
    }
    case MemexColumnDataType.Date: {
      return readDateCellClipboardContent(row, column.id)
    }
    case MemexColumnDataType.Iteration: {
      return readIterationCellClipboardContent(row, column)
    }
    // user defined single select or status column
    case MemexColumnDataType.SingleSelect: {
      return readSingleSelectCellClipboardContent(row, column)
    }
    case MemexColumnDataType.Reviewers: {
      return readReviewersCellClipboardContent(row)
    }
    case MemexColumnDataType.LinkedPullRequests: {
      return readLinkedPullRequestsCellClipboardContent(row)
    }
    case ClipboardOnly_UrlColumnModel.dataType: {
      return readClipboardOnlyUrlCellClipboardContent(row)
    }
    default: {
      assertNever(column)
    }
  }
}
