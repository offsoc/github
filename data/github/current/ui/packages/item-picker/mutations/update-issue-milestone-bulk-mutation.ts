import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  UpdateIssuesBulkInput,
  updateIssueMilestoneBulkMutation,
} from './__generated__/updateIssueMilestoneBulkMutation.graphql'

type issueUpdateArgs = {
  milestoneId: string
}

export function commitUpdateIssueMilestoneBulkMutation({
  environment,
  input: {ids, milestoneId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {ids: string[]} & issueUpdateArgs
  onCompleted?: (response: updateIssueMilestoneBulkMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {milestoneId}
  const inputHash: UpdateIssuesBulkInput = {
    ids,
    ...inputArgs,
  }

  return commitMutation<updateIssueMilestoneBulkMutation>(environment, {
    mutation: graphql`
      mutation updateIssueMilestoneBulkMutation($input: UpdateIssuesBulkInput!) @raw_response_type {
        updateIssuesBulk(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
