import {MergeMethod, MergeQueueMethod} from '../types'

/**
 * Returns the button text depending on the merge method
 */
export function mergeButtonText({
  mergeMethod,
  confirming,
  isBypassMerge = false,
  inProgress = false,
  isAutoMergeAllowed = false,
}: {
  mergeMethod: MergeMethod
  confirming: boolean
  isBypassMerge?: boolean
  inProgress?: boolean
  isAutoMergeAllowed?: boolean
}) {
  if (inProgress) {
    return 'Merging...'
  }

  const mergedText = isAutoMergeAllowed ? 'auto-merge' : 'merge'

  switch (mergeMethod) {
    case MergeMethod.MERGE:
      if (confirming) {
        return isBypassMerge ? 'Confirm bypass rules and merge' : `Confirm ${mergedText}`
      } else {
        return isBypassMerge
          ? `Bypass rules and ${mergedText}`
          : `${isAutoMergeAllowed ? 'Enable auto-merge' : 'Merge pull request'}`
      }
    case MergeMethod.SQUASH:
      if (confirming) {
        return isBypassMerge ? `Confirm bypass rules and ${mergedText} (squash)` : `Confirm squash and ${mergedText}`
      } else {
        return isBypassMerge ? `Bypass rules and ${mergedText} (squash)` : `Squash and ${mergedText}`
      }
    case MergeMethod.REBASE:
      if (confirming) {
        return isBypassMerge ? `Confirm bypass rules and ${mergedText} (rebase)` : `Confirm rebase and ${mergedText}`
      } else {
        return isBypassMerge ? `Bypass rules and ${mergedText} (rebase)` : `Rebase and ${mergedText}`
      }
  }
}

/**
 * Returns the button text depending on the selected merge queue method
 */
export function mergeQueueButtonText({mergeMethod, confirming}: {mergeMethod: MergeQueueMethod; confirming: boolean}) {
  switch (mergeMethod) {
    case MergeQueueMethod.GROUP:
      return confirming ? 'Confirm merge when ready' : 'Merge when ready'
    case MergeQueueMethod.SOLO:
      return confirming ? 'Confirm queue and force solo merge' : 'Queue and force solo merge'
  }
}
