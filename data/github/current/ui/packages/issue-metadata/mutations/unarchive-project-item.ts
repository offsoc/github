import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  UnarchiveProjectV2ItemInput,
  unarchiveProjectItemMutation,
  unarchiveProjectItemMutation$data,
} from './__generated__/unarchiveProjectItemMutation.graphql'

export function commitUnArchiveProjectItem({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: UnarchiveProjectV2ItemInput
  onError?: (error: Error) => void
  onCompleted?: (response: unarchiveProjectItemMutation$data) => void
}) {
  return commitMutation<unarchiveProjectItemMutation>(environment, {
    mutation: graphql`
      mutation unarchiveProjectItemMutation($input: UnarchiveProjectV2ItemInput!) @raw_response_type {
        unarchiveProjectV2Item(input: $input) {
          item {
            isArchived
          }
        }
      }
    `,
    variables: {
      input,
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
