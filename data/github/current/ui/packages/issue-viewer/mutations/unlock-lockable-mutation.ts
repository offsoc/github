import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  UnlockLockableInput,
  unlockLockableMutation,
  unlockLockableMutation$data,
} from './__generated__/unlockLockableMutation.graphql'

type IssueMutationProps = {
  environment: Environment
  input: UnlockLockableInput
  onError?: (error: Error) => void
  onCompleted?: (response: unlockLockableMutation$data) => void
}

export function commitUnlockLockableMutation({
  environment,
  input: {lockableId},
  onError,
  onCompleted,
}: IssueMutationProps) {
  const inputHash: UnlockLockableInput = {
    lockableId,
  }

  return commitMutation<unlockLockableMutation>(environment, {
    mutation: graphql`
      mutation unlockLockableMutation($input: UnlockLockableInput!) @raw_response_type {
        unlockLockable(input: $input) {
          unlockedRecord {
            ... on Issue {
              locked
            }
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
