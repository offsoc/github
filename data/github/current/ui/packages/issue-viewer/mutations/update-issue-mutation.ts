import {validateNoMarkdown} from '@github-ui/entity-validators'
import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  UpdateIssueInput,
  updateIssueMutation,
  updateIssueMutation$data,
} from './__generated__/updateIssueMutation.graphql'

export function commitUpdateIssueMutation({
  environment,
  input: {issueId, title, body},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string; title: string | null; body: string | null}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueMutation$data) => void
}) {
  const inputHash: UpdateIssueInput = {
    id: issueId,
  }
  if (title !== null) {
    inputHash.title = title
  }

  if (body !== null) {
    inputHash.body = body
  }

  return commitMutation<updateIssueMutation>(environment, {
    mutation: graphql`
      mutation updateIssueMutation($input: UpdateIssueInput!) @raw_response_type {
        updateIssue(input: $input) {
          issue {
            id
            title
            titleHTML
            body
            bodyHTML(unfurlReferences: true, renderTasklistBlocks: true)
          }
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onError: error => onError && onError(error),
    optimisticResponse: validateNoMarkdown(body)
      ? {
          updateIssue: {
            issue: {
              id: issueId,
              title: title || '',
              titleHTML: title || '',
              body: body || '',
              bodyHTML: body || '',
            },
          },
        }
      : undefined,
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
