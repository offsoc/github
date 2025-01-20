import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {updateIssuesById} from './update-issue-assignees-bulk-mutation'
import type {
  UpdateIssuesBulkByQueryInput,
  updateIssueAssigneesBulkByQueryMutation,
} from './__generated__/updateIssueAssigneesBulkByQueryMutation.graphql'

type issueUpdateArgs = {
  applyAssigneeIds: string[]
  removeAssigneeIds: string[]
}

export function commitUpdateIssueAssigneesBulkByQueryMutation({
  environment,
  optimisticUpdateIds,
  existingIssueAssignees,
  connectionIds,
  input: {query, repositoryId, applyAssigneeIds, removeAssigneeIds},
  onCompleted,
  onError,
}: {
  environment: Environment
  connectionIds: {[key: string]: string[]}
  input: {query: string; repositoryId: string} & issueUpdateArgs
  optimisticUpdateIds: string[]
  existingIssueAssignees: Map<string, string[]>
  onCompleted?: (response: updateIssueAssigneesBulkByQueryMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {applyAssigneeIds, removeAssigneeIds}
  const inputHash: UpdateIssuesBulkByQueryInput = {
    query,
    repositoryId,
    ...inputArgs,
  }

  return commitMutation<updateIssueAssigneesBulkByQueryMutation>(environment, {
    mutation: graphql`
      mutation updateIssueAssigneesBulkByQueryMutation($input: UpdateIssuesBulkByQueryInput!) @raw_response_type {
        updateIssuesBulkByQuery(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssuesById(store, optimisticUpdateIds, existingIssueAssignees, connectionIds, inputArgs),
    optimisticUpdater: store =>
      updateIssuesById(store, optimisticUpdateIds, existingIssueAssignees, connectionIds, inputArgs),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
