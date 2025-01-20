import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {updateSummaryViewedState} from '../helpers/mutation-helpers'
import type {markFileAsViewedMutation} from './__generated__/markFileAsViewedMutation.graphql'

export default function commitMarkFileAsViewedMutation({
  environment,
  input: {diffEntryId, pullRequestId, path},
  onError,
}: {
  environment: Environment
  input: {diffEntryId: string; pullRequestId: string; path: string}
  onError?: (error: Error) => void
}) {
  return commitMutation<markFileAsViewedMutation>(environment, {
    mutation: graphql`
      mutation markFileAsViewedMutation($id: ID!, $path: String!) @raw_response_type {
        markFileAsViewed(input: {pullRequestId: $id, path: $path}) {
          pullRequest {
            viewerViewedFiles
            comparison {
              diffEntry(path: $path) {
                viewerViewedState
              }
            }
          }
        }
      }
    `,
    variables: {id: pullRequestId, path},
    optimisticUpdater(store) {
      // update diff entry viewed state
      const diffEntry = store.get(diffEntryId)
      diffEntry?.setValue('VIEWED', 'viewerViewedState')
      updateSummaryViewedState(store, pullRequestId, path, 'VIEWED')

      // update pull request viewed files count
      const pullRequest = store.get(pullRequestId)
      const viewerViewedFiles = pullRequest?.getValue('viewerViewedFiles')
      const viewerViewedFilesCount = Number(viewerViewedFiles)
      if (!isNaN(viewerViewedFilesCount)) {
        pullRequest?.setValue(viewerViewedFilesCount + 1, 'viewerViewedFiles')
      }
    },
    updater(store) {
      updateSummaryViewedState(store, pullRequestId, path, 'VIEWED')
    },
    onError,
  })
}
