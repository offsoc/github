import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {updateIssuesById} from './update-issue-labels-bulk-mutation'
import type {
  UpdateIssuesBulkByQueryInput,
  updateIssueLabelsBulkByQueryMutation,
} from './__generated__/updateIssueLabelsBulkByQueryMutation.graphql'

type issueUpdateArgs = {
  applyLabelIds: string[]
  removeLabelIds: string[]
}

export function commitUpdateIssueLabelsBulkByQueryMutation({
  environment,
  optimisticUpdateIds,
  existingIssueLabels,
  connectionIds,
  input: {query, repositoryId, applyLabelIds, removeLabelIds},
  onCompleted,
  onError,
}: {
  environment: Environment
  connectionIds: {[key: string]: string[]}
  input: {query: string; repositoryId: string} & issueUpdateArgs
  optimisticUpdateIds: string[]
  existingIssueLabels: Map<string, string[]>
  onCompleted?: (response: updateIssueLabelsBulkByQueryMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {applyLabelIds, removeLabelIds}
  const inputHash: UpdateIssuesBulkByQueryInput = {
    query,
    repositoryId,
    ...inputArgs,
  }

  return commitMutation<updateIssueLabelsBulkByQueryMutation>(environment, {
    mutation: graphql`
      mutation updateIssueLabelsBulkByQueryMutation($input: UpdateIssuesBulkByQueryInput!) @raw_response_type {
        updateIssuesBulkByQuery(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssuesById(store, optimisticUpdateIds, existingIssueLabels, connectionIds, inputArgs),
    optimisticUpdater: store =>
      updateIssuesById(store, optimisticUpdateIds, existingIssueLabels, connectionIds, inputArgs),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
