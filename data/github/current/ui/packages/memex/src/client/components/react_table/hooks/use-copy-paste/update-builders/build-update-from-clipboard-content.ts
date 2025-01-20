import type {UpdateColumnValueAction} from '../../../../../api/columns/contracts/domain'
import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../../../models/column-model'
import type {ClipboardContent} from '../types'
import {buildAssigneesUpdateFromClipboardContent} from './build-assignees-update-from-clipboard-content'
import {buildDateUpdateFromClipboardContent} from './build-date-update-from-clipboard-content'
import {buildIssueTypeUpdateFromClipboardContent} from './build-issue-type-update-from-clipboard-content'
import {buildIterationUpdateFromClipboardContent} from './build-iteration-update-from-clipboard-content'
import {buildLabelsUpdateFromClipboardContent} from './build-labels-update-from-clipboard-content'
import {buildMilestoneUpdateFromClipboardContent} from './build-milestone-update-from-clipboard-content'
import {buildNumberUpdateFromClipboardContent} from './build-number-update-from-clipboard-content'
import {buildParentIssueUpdateFromClipboardContent} from './build-parent-issue-update-from-clipboard-content'
import {buildSingleSelectUpdateFromClipboardContent} from './build-single-select-update-from-clipboard-content'
import {buildTextUpdateFromClipboardContent} from './build-text-update-from-clipboard-content'

/**
 * Build an `UpdateColumnValueAction` for the target column from the clipboard content, if possible.
 * If returns `undefined`, this was an invalid action but we shouldn't fail silently instead of showing an error toast.
 * @throws {PasteValidationFailure} If this was an invalid action for which the user should be notified.
 */
export const buildUpdateFromClipboardContent = (
  content: ClipboardContent | string,
  targetColumn: ColumnModel,
): UpdateColumnValueAction | undefined => {
  switch (targetColumn.dataType) {
    case MemexColumnDataType.Assignees: {
      return buildAssigneesUpdateFromClipboardContent(content)
    }

    case MemexColumnDataType.Date: {
      return buildDateUpdateFromClipboardContent(content, targetColumn.id)
    }

    case MemexColumnDataType.Iteration: {
      return buildIterationUpdateFromClipboardContent(content, targetColumn)
    }

    case MemexColumnDataType.Labels: {
      return buildLabelsUpdateFromClipboardContent(content)
    }

    case MemexColumnDataType.Milestone: {
      return buildMilestoneUpdateFromClipboardContent(content)
    }

    case MemexColumnDataType.IssueType: {
      return buildIssueTypeUpdateFromClipboardContent(content)
    }

    case MemexColumnDataType.Number: {
      return buildNumberUpdateFromClipboardContent(content, targetColumn.id)
    }

    case MemexColumnDataType.SingleSelect: {
      return buildSingleSelectUpdateFromClipboardContent(content, targetColumn)
    }

    case MemexColumnDataType.Text: {
      return buildTextUpdateFromClipboardContent(content, targetColumn.id)
    }

    case MemexColumnDataType.ParentIssue: {
      return buildParentIssueUpdateFromClipboardContent(content)
    }
  }
}
