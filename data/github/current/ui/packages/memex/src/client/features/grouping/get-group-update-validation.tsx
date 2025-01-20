import {Link} from '@primer/react'

import type {UpdateColumnValueAction} from '../../api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {ExtendedRepository, IssueType, Milestone, ParentIssue, Repository} from '../../api/common-contracts'
import type {TrackedByItem} from '../../api/issues-graph/contracts'
import {apiGetSuggestedIssueTypes} from '../../api/memex-items/api-get-suggested-issue-types'
import {apiGetSuggestedMilestones} from '../../api/memex-items/api-get-suggested-milestones'
import type {SuggestedIssueType} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import {DragAndDropStatus} from '../../api/stats/contracts'
import type {AddToastProps} from '../../components/toasts/use-toasts'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import type {ConfirmOptions} from '../../hooks/use-alert'
import type {MemexItemModel} from '../../models/memex-item-model'
import {ApiError} from '../../platform/api-error'
import {ItemUpdateValidationResources, ParentIssueResources, Resources, TrackedByResources} from '../../strings'

export const RegroupValidationUIAction = {
  ErrorToast: 'error-toast',
  ConfirmDialog: 'confirm-dialog',
  Alert: 'alert',
} as const
type RegroupValidationUIAction = ObjectValues<typeof RegroupValidationUIAction>

export const RegroupValidationStatus = {
  Success: 'success',
  Failure: 'failure',
  Pending: 'pending',
} as const
type RegroupValidationStatus = ObjectValues<typeof RegroupValidationStatus>

interface BaseRegroupValidationResult {
  status: RegroupValidationStatus
  stats?: {
    status: DragAndDropStatus
    itemId: number
    columnId: SystemColumnId
  }
  updateColumnActionOverride?: UpdateColumnValueAction
}

interface RegroupValidationSuccessResult extends BaseRegroupValidationResult {
  status: typeof RegroupValidationStatus.Success
}

// Not successful - display alert dialog
export interface RegroupValidationAlertResult extends BaseRegroupValidationResult {
  status: typeof RegroupValidationStatus.Failure
  action: typeof RegroupValidationUIAction.Alert
  alertOptions: ConfirmOptions
}
// Not successful - display toast
interface RegroupValidationErrorResult extends BaseRegroupValidationResult {
  status: typeof RegroupValidationStatus.Failure
  action: typeof RegroupValidationUIAction.ErrorToast
  toastOptions: AddToastProps
}

// Requires confirmation - display confirm dialog
interface RegroupValidationConfirmResult extends BaseRegroupValidationResult {
  status: typeof RegroupValidationStatus.Pending
  action: typeof RegroupValidationUIAction.ConfirmDialog
  confirmOptions: ConfirmOptions
}

type ColumnUpdateResult =
  | RegroupValidationSuccessResult
  | RegroupValidationAlertResult
  | RegroupValidationConfirmResult
  | RegroupValidationErrorResult

// Milestone
const createMilestoneTransferDialogContent = (milestone: Milestone, repository: Repository): React.ReactNode => {
  return (
    <>
      Please create the <code>{milestone.title}</code> milestone in the{' '}
      <a href={`${repository.url}/milestones`}>{repository.nameWithOwner}</a> repository before adding to this milestone
      group.
    </>
  )
}
const createIssueTypeTransferDialogContent = (issueType: IssueType, repository: Repository): React.ReactNode => {
  const owner = repository.nameWithOwner.split('/')[0]
  const baseUrl = repository.url.replace(repository.nameWithOwner, '')
  const orgUrl = `${baseUrl}${owner}`

  return (
    <>
      There is no <code>{issueType.name}</code> issue type in the <a href={orgUrl}>{owner}</a> organization.
    </>
  )
}

const getMilestoneValidationResult = async (
  item: MemexItemModel,
  milestone?: Milestone,
): Promise<ColumnUpdateResult> => {
  if (!milestone) return {status: RegroupValidationStatus.Success}

  const baseStatsPayload = {
    itemId: item.id,
    columnId: SystemColumnId.Milestone,
  }

  if (item.contentType === ItemType.DraftIssue) {
    // drafts cannot be dropped into an existing milestone as the
    // backend does not support these changes
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: ItemUpdateValidationResources.Milestone.Alerts.NeedsConversion,
      stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
    }
  }

  if (item.columns.Milestone && item.columns.Milestone.id === milestone.id) {
    // if the milestone of the row being moved matches the milestone of the
    // drop zone we can proceed - the user is likely reordering rows in the
    // same group
    return {status: RegroupValidationStatus.Success}
  }

  const response = await apiGetSuggestedMilestones({memexProjectItemId: item.id})
  const targetMilestoneForRepository = response.suggestions.find(m => m.title === milestone.title)

  if (targetMilestoneForRepository) {
    return {
      status: RegroupValidationStatus.Success,
      stats: {...baseStatsPayload, status: DragAndDropStatus.SUCCESS},
      // The same milestone name can exist in multiple repos, so this ensures that
      // we're using the correct one.
      updateColumnActionOverride: {
        dataType: MemexColumnDataType.Milestone,
        value: targetMilestoneForRepository,
      },
    }
  }

  return {
    status: RegroupValidationStatus.Failure,
    action: RegroupValidationUIAction.Alert,
    alertOptions: {
      ...ItemUpdateValidationResources.Milestone.Alerts.NeedsTransfer,
      content: createMilestoneTransferDialogContent(milestone, not_typesafe_nonNullAssertion(item.columns.Repository)),
    },
    stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
  }
}

const getIssueTypeValidationResult = async (
  item: MemexItemModel,
  issueType?: IssueType,
): Promise<ColumnUpdateResult> => {
  // Issue type can be removed without validation
  if (!issueType) return {status: RegroupValidationStatus.Success}

  const baseStatsPayload = {
    itemId: item.id,
    columnId: SystemColumnId.IssueType,
  }

  if (item.contentType === ItemType.DraftIssue) {
    // Issue type cannot be assigned to drafts
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: ItemUpdateValidationResources.IssueType.Alerts.NeedsConversion,
      stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
    }
  }

  if (item.contentType === ItemType.PullRequest) {
    // Issue type cannot be assigned to pull requests
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: ItemUpdateValidationResources.IssueType.Alerts.CannotAssignPulls,
      stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
    }
  }

  if (item.columns[SystemColumnId.IssueType]?.id === issueType.id) {
    // If the issue type of the row being moved matches the issue type of the
    // drop zone we can proceed - the user is likely reordering rows in the
    // same group
    return {status: RegroupValidationStatus.Success}
  }

  let suggestedIssueTypes: Array<SuggestedIssueType> = []

  try {
    // The request to get issue type suggestions will fail if the issue is unable to recieve suggestions.
    // This will happen if the parent repo has been excluded from issue types, or if the repo is user-owned.
    // Propagate any error message containing information about why suggestions are unavailable to the user.
    const response = await apiGetSuggestedIssueTypes({memexProjectItemId: item.id})
    suggestedIssueTypes = response.suggestions
  } catch (e: unknown) {
    const message = e instanceof ApiError ? e.message : Resources.genericErrorMessage

    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: {
        ...ItemUpdateValidationResources.IssueType.Alerts.NeedsTransfer,
        content: message,
      },
      stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
    }
  }
  const targetIssueTypeForRepository = suggestedIssueTypes.find(m => m.name === issueType.name)

  if (targetIssueTypeForRepository) {
    // The selected issue type is available in the repo, so we can update it
    return {
      status: RegroupValidationStatus.Success,
      stats: {...baseStatsPayload, status: DragAndDropStatus.SUCCESS},
      updateColumnActionOverride: {
        dataType: MemexColumnDataType.IssueType,
        value: targetIssueTypeForRepository,
      },
    }
  } else if (suggestedIssueTypes.length === 0) {
    // No issue types are available within the issue's repository. This could be because
    // the repo is user-owned, or that issue types are disabled for the organization repository
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: ItemUpdateValidationResources.IssueType.Alerts.NoTypesForRepo,
      stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
    }
  }

  // Issue types are present within the repository, but the selection is not available for the owning organization
  return {
    status: RegroupValidationStatus.Failure,
    action: RegroupValidationUIAction.Alert,
    alertOptions: {
      ...ItemUpdateValidationResources.IssueType.Alerts.NeedsTransfer,
      content: createIssueTypeTransferDialogContent(issueType, not_typesafe_nonNullAssertion(item.columns.Repository)),
    },
    stats: {...baseStatsPayload, status: DragAndDropStatus.FAILURE},
  }
}

// Repository
const createIssueTransferDialogContent = (link: string): React.ReactNode => {
  return (
    <div>
      You can transfer this issue to a different repository from the&nbsp;
      <Link inline target="_blank" href={link}>
        issue page
      </Link>
      .
    </div>
  )
}

const getRepositoryValidationResult = (item: MemexItemModel, repository?: ExtendedRepository): ColumnUpdateResult => {
  if (!repository) return {status: RegroupValidationStatus.Success}

  const statsFailurePayload = {
    itemId: item.id,
    columnId: SystemColumnId.Repository,
    status: DragAndDropStatus.FAILURE,
  }

  if (item.contentType === ItemType.DraftIssue) {
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: ItemUpdateValidationResources.Repository.Alerts.NeedsConversion,
      stats: statsFailurePayload,
    }
  }

  if (item.contentType === ItemType.PullRequest) {
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: ItemUpdateValidationResources.Repository.Alerts.CannotTransferPulls,
      stats: statsFailurePayload,
    }
  }

  if (
    item.contentType === ItemType.Issue &&
    item.columns.Repository?.nameWithOwner !== repository.nameWithOwner &&
    item.content &&
    'url' in item.content
  ) {
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.Alert,
      alertOptions: {
        ...ItemUpdateValidationResources.Repository.Alerts.IssueNeedsTransfer,
        content: createIssueTransferDialogContent(item.content.url),
      },
      stats: statsFailurePayload,
    }
  }

  return {status: RegroupValidationStatus.Success}
}

// Tracked by
const getTrackedByValidationResult = (
  item: MemexItemModel,
  trackedByItems: Array<TrackedByItem>,
): ColumnUpdateResult => {
  if (
    // only display a warning if the user is trying to add a tracked by value, as opposed to sort items _in_ "No Tracked by"
    trackedByItems.length > 0 &&
    (item.contentType === ItemType.DraftIssue || item.contentType === ItemType.PullRequest)
  ) {
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.ErrorToast,
      toastOptions: TrackedByResources.Toasts.DraftAndPullsNotSupported,
      stats: {status: DragAndDropStatus.FAILURE, itemId: item.id, columnId: SystemColumnId.TrackedBy},
    }
  }

  if (
    // If the item is tracked by 2 parent issues
    (item.columns[SystemColumnId.TrackedBy]?.length ?? 0) > 1 &&
    // ...and they want to move it to "No Tracked by"
    trackedByItems.length === 0
  ) {
    // we need to confirm with the user that they understand that the item will be removed from both parent issues
    return {
      status: RegroupValidationStatus.Pending,
      action: RegroupValidationUIAction.ConfirmDialog,
      confirmOptions: TrackedByResources.moveMultipleTrackedByNoTrackedWarning,
    }
  }

  return {status: RegroupValidationStatus.Success}
}

// Parent issue
const getParentIssueValidationResult = (
  item: MemexItemModel,
  parentIssue: ParentIssue | undefined,
): ColumnUpdateResult => {
  if (
    // only display a warning if the user is trying to add a sub-issue, as opposed to sort items _in_ "No Parent issue"
    parentIssue &&
    (item.contentType === ItemType.DraftIssue || item.contentType === ItemType.PullRequest)
  ) {
    return {
      status: RegroupValidationStatus.Failure,
      action: RegroupValidationUIAction.ErrorToast,
      toastOptions: ParentIssueResources.toasts.draftAndPullsNotSupported,
      stats: {status: DragAndDropStatus.FAILURE, itemId: item.id, columnId: SystemColumnId.ParentIssue},
    }
  }

  return {status: RegroupValidationStatus.Success}
}

export async function getUpdateGroupValidation(
  item: MemexItemModel,
  updateColumnAction: UpdateColumnValueAction,
): Promise<ColumnUpdateResult> {
  switch (updateColumnAction.dataType) {
    case MemexColumnDataType.Repository:
      return getRepositoryValidationResult(item, updateColumnAction.value)
    case MemexColumnDataType.Milestone:
      return await getMilestoneValidationResult(item, updateColumnAction.value)
    case MemexColumnDataType.TrackedBy:
      return getTrackedByValidationResult(item, updateColumnAction.value)
    case MemexColumnDataType.IssueType:
      return getIssueTypeValidationResult(item, updateColumnAction.value)
    case MemexColumnDataType.ParentIssue:
      return getParentIssueValidationResult(item, updateColumnAction.value)
  }
  return {status: RegroupValidationStatus.Success}
}
