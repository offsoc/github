import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  LockLockableInput,
  lockLockableMutation,
  lockLockableMutation$data,
} from './__generated__/lockLockableMutation.graphql'

type IssueMutationProps = {
  environment: Environment
  input: LockLockableInput
  onError?: (error: Error) => void
  onCompleted?: (response: lockLockableMutation$data) => void
}

export function commitLockLockableMutation({
  environment,
  input: {lockableId, lockReason},
  onError,
  onCompleted,
}: IssueMutationProps) {
  const inputHash: LockLockableInput = {
    lockableId,
    lockReason,
  }

  return commitMutation<lockLockableMutation>(environment, {
    mutation: graphql`
      mutation lockLockableMutation($input: LockLockableInput!) @raw_response_type {
        lockLockable(input: $input) {
          lockedRecord {
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
