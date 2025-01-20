import type {RecordSourceSelectorProxy} from 'relay-runtime'

type ChangeType = 'increment' | 'decrement'

export function incrementConnectionCount<T>(
  store: RecordSourceSelectorProxy<T>,
  connectionId: string | undefined,
  countFieldName: string,
) {
  if (connectionId) {
    const connection = store.get(connectionId)
    if (!connection) return

    const previousCount = Number(connection.getValue(countFieldName))
    if (!isNaN(previousCount)) {
      connection.setValue(previousCount + 1, countFieldName)
    }
  }
}

export function decrementConnectionCount<T>(
  store: RecordSourceSelectorProxy<T>,
  connectionId: string | undefined,
  countFieldName: string,
) {
  if (connectionId) {
    const connection = store.get(connectionId)
    if (!connection) return

    const previousCount = Number(connection.getValue(countFieldName))
    if (!isNaN(previousCount)) {
      connection.setValue(previousCount - 1, countFieldName)
    }
  }
}

export function updateUnresolvedCommentCount<T>(
  store: RecordSourceSelectorProxy<T>,
  pullRequestId: string,
  filePath: string,
  change: ChangeType | number,
  countFieldName = 'unresolvedCommentCount',
) {
  const pullRequest = store.get(pullRequestId)
  const summary = pullRequest?.getLinkedRecord('comparison')?.getLinkedRecords('summary')
  const updatedFile = summary?.find(s => s.getValue('path') === filePath)

  if (!updatedFile) return

  const incrementValue = typeof change === 'number' ? change : change === 'increment' ? 1 : -1

  const previousCount = Number(updatedFile.getValue(countFieldName))
  if (!isNaN(previousCount)) {
    updatedFile.setValue(previousCount + incrementValue, countFieldName)
  }
}

export function updateTotalCommentsCount<T>(
  store: RecordSourceSelectorProxy<T>,
  pullRequestId: string,
  filePath: string,
  change: ChangeType,
  countFieldName = 'totalCommentsCount',
) {
  const pullRequest = store.get(pullRequestId)
  const summary = pullRequest?.getLinkedRecord('comparison')?.getLinkedRecords('summary')
  const updatedFile = summary?.find(s => s.getValue('path') === filePath)

  if (!updatedFile) return

  const incrementValue = change === 'increment' ? 1 : -1

  const previousCount = Number(updatedFile.getValue(countFieldName))
  if (!isNaN(previousCount)) {
    updatedFile.setValue(previousCount + incrementValue, countFieldName)
  }
}

/**
 * Use this function to update the viewerViewedState of a file in pullRequestComparison.summary.
 * Useful when a pullRequestDiffEntry object is marked as viewed or unviewed.
 */
export function updateSummaryViewedState<T>(
  store: RecordSourceSelectorProxy<T>,
  pullRequestId: string,
  filePath: string,
  newValue: string | null,
) {
  const pullRequest = store.get(pullRequestId)
  const summary = pullRequest?.getLinkedRecord('comparison')?.getLinkedRecords('summary')
  const updatedFile = summary?.find(s => s.getValue('path') === filePath)

  if (!updatedFile) return

  updatedFile.setValue(newValue, 'viewerViewedState')
}
