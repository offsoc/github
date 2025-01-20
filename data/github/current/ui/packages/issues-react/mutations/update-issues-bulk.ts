import {commitMutation, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import type {
  IssueClosedStateReason,
  IssueState,
  UpdateIssuesBulkInput,
  updateIssuesBulkMutation,
} from './__generated__/updateIssuesBulkMutation.graphql'

type issueUpdateArgs = {
  state: IssueState
  stateReason?: IssueClosedStateReason
}

export function updateIssuesById(store: RecordSourceSelectorProxy, ids: string[], issueUpdateArgs: issueUpdateArgs) {
  for (const id of ids) {
    const issue = store.get(id)
    if (issue) {
      for (const [key, value] of Object.entries(issueUpdateArgs)) {
        issue.setValue(value, key)
      }
    }
  }
}

export function commitUpdateIssueBulkMutation({
  environment,
  optimisticUpdateIds,
  input: {ids, state, stateReason},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {ids: string[]} & issueUpdateArgs
  optimisticUpdateIds: string[]
  onCompleted?: (response: updateIssuesBulkMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {state, stateReason}
  const inputHash: UpdateIssuesBulkInput = {
    ids,
    ...inputArgs,
  }

  return commitMutation<updateIssuesBulkMutation>(environment, {
    mutation: graphql`
      mutation updateIssuesBulkMutation($input: UpdateIssuesBulkInput!) @raw_response_type {
        updateIssuesBulk(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssuesById(store, optimisticUpdateIds, inputArgs),
    optimisticUpdater: store => updateIssuesById(store, optimisticUpdateIds, inputArgs),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
