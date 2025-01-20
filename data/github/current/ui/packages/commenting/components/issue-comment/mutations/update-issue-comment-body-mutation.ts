import {validateNoMarkdown} from '@github-ui/entity-validators'
import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updateIssueCommentBodyMutation,
  updateIssueCommentBodyMutation$data,
  UpdateIssueCommentInput,
} from './__generated__/updateIssueCommentBodyMutation.graphql'

export function commitUpdateIssueCommentBodyMutation({
  environment,
  input: {id, body, bodyVersion},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {id: string; body: string | null; bodyVersion: string}
  onCompleted?: (response?: updateIssueCommentBodyMutation$data) => void
  onError?: (error: Error) => void
}) {
  if (!body) {
    return
  }

  const inputHash: UpdateIssueCommentInput = {
    id,
    body,
    bodyVersion,
  }

  return commitMutation<updateIssueCommentBodyMutation>(environment, {
    mutation: graphql`
      mutation updateIssueCommentBodyMutation($input: UpdateIssueCommentInput!) @raw_response_type {
        updateIssueComment(input: $input) {
          issueComment {
            bodyVersion
            ...IssueCommentViewerMarkdownViewer
          }
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    optimisticResponse: validateNoMarkdown(body)
      ? {
          updateIssueComment: {
            issueComment: {
              id,
              body,
              bodyHTML: body,
              bodyVersion,
              viewerCanUpdate: false,
            },
          },
        }
      : undefined,
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
