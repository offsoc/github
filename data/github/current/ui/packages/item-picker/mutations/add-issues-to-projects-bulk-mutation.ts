import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  UpdateIssuesBulkInput,
  addIssuesToProjectsBulkMutation,
} from './__generated__/addIssuesToProjectsBulkMutation.graphql'

type addToProjectUpdateArgs = {
  addToProjectV2Ids: string[]
  removeFromProjectV2Ids: string[]
}

export function commitAddIssuesToProjectsBulkMutation({
  environment,
  input: {ids, addToProjectV2Ids, removeFromProjectV2Ids},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {ids: string[]} & addToProjectUpdateArgs
  onCompleted?: (response: addIssuesToProjectsBulkMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {addToProjectV2Ids, removeFromProjectV2Ids}
  const inputHash: UpdateIssuesBulkInput = {
    ids,
    ...inputArgs,
  }

  return commitMutation<addIssuesToProjectsBulkMutation>(environment, {
    mutation: graphql`
      mutation addIssuesToProjectsBulkMutation($input: UpdateIssuesBulkInput!) @raw_response_type {
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
