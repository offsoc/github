import {validateNoMarkdown} from '@github-ui/entity-validators'
import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updateIssueBodyMutation,
  updateIssueBodyMutation$data,
  UpdateIssueInput,
} from './__generated__/updateIssueBodyMutation.graphql'

export function commitUpdateIssueBodyMutation({
  environment,
  input: {issueId, body, tasklistBlocksOperation, bodyVersion},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {
    issueId: string
    body: string
    tasklistBlocksOperation?: string | null
    bodyVersion: string
  }
  onCompleted?: (response: updateIssueBodyMutation$data) => void
  onError?: (error: Error) => void
}) {
  const inputHash: UpdateIssueInput = {
    id: issueId,
    body,
    tasklistBlocksOperation,
    bodyVersion,
  }

  return commitMutation<updateIssueBodyMutation>(environment, {
    mutation: graphql`
      mutation updateIssueBodyMutation($input: UpdateIssueInput!) @raw_response_type {
        updateIssue(input: $input) {
          issue {
            id
            bodyVersion
            ...IssueBodyContent
            ...MarkdownEditHistoryViewer_comment
          }
        }
      }
    `,
    optimisticResponse: validateNoMarkdown(body)
      ? {
          updateIssue: {
            issue: {
              id: issueId,
              body,
              bodyVersion,
              bodyHTML: body,
              lastEditedAt: new Date().toISOString(),
              viewerCanReadUserContentEdits: true,
              lastUserContentEdit: null,
              __isComment: 'Issue',
            },
          },
        }
      : undefined,
    variables: {
      input: inputHash,
    },
    onCompleted: (response: updateIssueBodyMutation$data) => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
