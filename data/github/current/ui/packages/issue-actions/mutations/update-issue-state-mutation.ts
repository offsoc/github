import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updateIssueStateMutation,
  updateIssueStateMutation$data,
} from './__generated__/updateIssueStateMutation.graphql'
import type {
  IssueClosedStateReason,
  updateIssueStateMutationCloseMutation,
  updateIssueStateMutationCloseMutation$data,
} from './__generated__/updateIssueStateMutationCloseMutation.graphql'

export function commitCloseIssueMutation({
  environment,
  input: {issueId, newStateReason},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string; newStateReason: IssueClosedStateReason}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueStateMutationCloseMutation$data) => void
}) {
  return commitMutation<updateIssueStateMutationCloseMutation>(environment, {
    mutation: graphql`
      mutation updateIssueStateMutationCloseMutation($id: ID!, $newStateReason: IssueClosedStateReason!)
      @raw_response_type {
        closeIssue(input: {issueId: $id, stateReason: $newStateReason}) {
          issue {
            id
            state
            stateReason
          }
        }
      }
    `,
    variables: {id: issueId, newStateReason},
    optimisticResponse: {
      closeIssue: {
        issue: {
          id: issueId,
          state: 'CLOSED',
          stateReason: newStateReason,
        },
      },
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}

export function commitReopenIssueMutation({
  environment,
  input: {issueId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueStateMutation$data) => void
}) {
  return commitMutation<updateIssueStateMutation>(environment, {
    mutation: graphql`
      mutation updateIssueStateMutation($id: ID!) @raw_response_type {
        reopenIssue(input: {issueId: $id}) {
          issue {
            id
            state
          }
        }
      }
    `,
    variables: {id: issueId},
    optimisticResponse: {
      reopenIssue: {
        issue: {
          id: issueId,
          state: 'OPEN',
        },
      },
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
