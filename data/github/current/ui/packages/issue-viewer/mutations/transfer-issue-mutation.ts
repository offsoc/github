import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  TransferIssueInput,
  transferIssueMutation,
  transferIssueMutation$data,
} from './__generated__/transferIssueMutation.graphql'

type IssueMutationProps = {
  environment: Environment
  input: TransferIssueInput
  onError?: (error: Error) => void
  onCompleted?: (response: transferIssueMutation$data) => void
}

export function commitTransferIssueMutation({
  environment,
  input: {issueId, repositoryId, createLabelsIfMissing},
  onError,
  onCompleted,
}: IssueMutationProps) {
  const inputHash: TransferIssueInput = {
    issueId,
    repositoryId,
    createLabelsIfMissing,
  }

  return commitMutation<transferIssueMutation>(environment, {
    mutation: graphql`
      mutation transferIssueMutation($input: TransferIssueInput!) @raw_response_type {
        transferIssue(input: $input) {
          issue {
            url
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
