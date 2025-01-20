import type {UpdateColumnValueAction} from '../../api/columns/contracts/domain'
import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {IssueTypeResources, MilestoneResources, ParentIssueResources, TrackedByResources} from '../../strings'

const RESTRICTED_COLUMN_DATA_TYPES: Partial<{[key in MemexColumnDataType]: string}> = {
  [MemexColumnDataType.TrackedBy]: TrackedByResources.addedUnsupportedItemToast,
  [MemexColumnDataType.ParentIssue]: ParentIssueResources.addedUnsupportedItemToast,
  [MemexColumnDataType.IssueType]: IssueTypeResources.addedUnsupportedItemToast,
  [MemexColumnDataType.Milestone]: MilestoneResources.addedUnsupportedItemToast,
}

export const draftsUnsupported = (updateAction: UpdateColumnValueAction): boolean => {
  return updateAction.dataType in RESTRICTED_COLUMN_DATA_TYPES
}

// We have the logic for getting the warning message here, as opposed to the domain layer,
// to avoid piling on too much logic there.
export const getDraftItemsWarningMessage = (updateAction: UpdateColumnValueAction): string | undefined => {
  return RESTRICTED_COLUMN_DATA_TYPES[updateAction.dataType]
}
