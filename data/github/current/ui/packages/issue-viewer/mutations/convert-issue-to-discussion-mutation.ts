import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  ConvertIssueToDiscussionInput,
  convertIssueToDiscussionMutation,
  convertIssueToDiscussionMutation$data,
} from './__generated__/convertIssueToDiscussionMutation.graphql'

type IssueMutationProps = {
  environment: Environment
  input: ConvertIssueToDiscussionInput
  onError?: (error: Error) => void
  onCompleted?: (response: convertIssueToDiscussionMutation$data) => void
}

export function commitConvertIssueToDiscussionMutation({
  environment,
  input: {issueId, categoryId},
  onError,
  onCompleted,
}: IssueMutationProps) {
  const inputHash: ConvertIssueToDiscussionInput = {
    issueId,
    categoryId,
  }

  return commitMutation<convertIssueToDiscussionMutation>(environment, {
    mutation: graphql`
      mutation convertIssueToDiscussionMutation($input: ConvertIssueToDiscussionInput!) @raw_response_type {
        convertIssueToDiscussion(input: $input) {
          discussion {
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
