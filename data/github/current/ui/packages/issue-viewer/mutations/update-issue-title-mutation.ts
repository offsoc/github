import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  UpdateIssueInput,
  updateIssueTitleMutation,
  updateIssueTitleMutation$data,
} from './__generated__/updateIssueTitleMutation.graphql'

export function commitUpdateIssueTitleMutation({
  environment,
  input: {issueId, title},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string; title: string | null}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueTitleMutation$data) => void
}) {
  const inputHash: UpdateIssueInput = {
    id: issueId,
  }
  if (title !== null) {
    inputHash.title = title
  }

  return commitMutation<updateIssueTitleMutation>(environment, {
    mutation: graphql`
      mutation updateIssueTitleMutation($input: UpdateIssueInput!) @raw_response_type {
        updateIssue(input: $input) {
          issue {
            id
            title
            titleHTML
          }
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onError: error => onError && onError(error),
    optimisticResponse: {
      updateIssue: {
        issue: {
          id: issueId,
          title: title || '',
          titleHTML: title || '',
        },
      },
    },
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
