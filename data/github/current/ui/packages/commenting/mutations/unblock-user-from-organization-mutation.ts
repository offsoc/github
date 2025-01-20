import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  UnblockUserFromOrganizationInput,
  unblockUserFromOrganizationMutation,
} from './__generated__/unblockUserFromOrganizationMutation.graphql'

export function unblockUserFromOrganization({
  environment,
  input: {organizationId, unblockedUserId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {
    organizationId: string
    unblockedUserId: string
  }
  onError?: (error: Error) => void
  onCompleted?: () => void
}) {
  const inputHash: UnblockUserFromOrganizationInput = {
    organizationId,
    unblockedUserId,
  }

  return commitMutation<unblockUserFromOrganizationMutation>(environment, {
    mutation: graphql`
      mutation unblockUserFromOrganizationMutation($input: UnblockUserFromOrganizationInput!) @raw_response_type {
        unblockUserFromOrganization(input: $input) {
          clientMutationId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onError: error => onError && onError(error),
    onCompleted: () => {
      onCompleted && onCompleted()
    },
  })
}
