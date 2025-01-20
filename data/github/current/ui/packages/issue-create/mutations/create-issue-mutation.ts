import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  CreateIssueInput,
  createIssueMutation,
  createIssueMutation$data,
} from './__generated__/createIssueMutation.graphql'

type IssueMutationProps = {
  environment: Environment
  input: CreateIssueInput
  onError?: (error: Error) => void
  onCompleted?: (response: createIssueMutation$data) => void
}

export function commitCreateIssueMutation({
  environment,
  input: {title, body, repositoryId, labelIds, milestoneId, assigneeIds, issueTemplate, issueTypeId, parentIssueId},
  onError,
  onCompleted,
}: IssueMutationProps) {
  const inputHash: CreateIssueInput = {
    title,
    body,
    repositoryId,
    labelIds,
    milestoneId,
    assigneeIds,
    issueTemplate,
    issueTypeId,
    parentIssueId,
  }

  return commitMutation<createIssueMutation>(environment, {
    mutation: graphql`
      mutation createIssueMutation($input: CreateIssueInput!, $fetchParent: Boolean = false) @raw_response_type {
        createIssue(input: $input) {
          issue {
            databaseId
            repository {
              databaseId
              id
              name
              owner {
                login
              }
            }
            number
            title
            id
            number
            url
            # If this issue was a sub-issue of another issue, then we also fetch the parent's information so
            # that the UI will automatically update with the new sub-issues count.
            parent @include(if: $fetchParent) {
              id
              subIssues(first: 50) {
                totalCount
              }
              ...SubIssuesListView
            }
          }
          errors {
            message
          }
        }
      }
    `,
    variables: {
      input: inputHash,
      fetchParent: !!inputHash.parentIssueId,
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
