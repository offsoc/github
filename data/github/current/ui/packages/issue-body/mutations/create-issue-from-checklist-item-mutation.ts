import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  createIssueFromChecklistItemMutation,
  createIssueFromChecklistItemMutation$data,
  CreateIssueInput,
} from './__generated__/createIssueFromChecklistItemMutation.graphql'

type MutationProps = {
  environment: Environment
  input: CreateIssueInput
  onError?: (error: Error) => void
  onCompleted?: (respnse: createIssueFromChecklistItemMutation$data) => void
}
export function commitCreateIssueFromChecklistItemMutation({
  environment,
  input: {title, repositoryId, parentIssueId, position},
  onError,
  onCompleted,
}: MutationProps) {
  const inputHash: CreateIssueInput = {
    title,
    repositoryId,
    parentIssueId,
    position,
  }

  return commitMutation<createIssueFromChecklistItemMutation>(environment, {
    mutation: graphql`
      mutation createIssueFromChecklistItemMutation($input: CreateIssueInput!) @raw_response_type {
        createIssue(input: $input) {
          issue {
            parent {
              body
              bodyHTML(unfurlReferences: true, renderTasklistBlocks: true)
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
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
