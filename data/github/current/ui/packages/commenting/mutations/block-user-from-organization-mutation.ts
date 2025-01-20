import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  BlockFromOrganizationDuration,
  BlockUserFromOrganizationInput,
  blockUserFromOrganizationMutation,
  ReportedContentClassifiers,
} from './__generated__/blockUserFromOrganizationMutation.graphql'

export function blockUserFromOrganization({
  environment,
  input: {organizationId, blockedUserId, duration, notifyBlockedUser, hiddenReason, contentId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {
    organizationId: string
    blockedUserId: string
    duration: BlockFromOrganizationDuration
    notifyBlockedUser: boolean
    hiddenReason: ReportedContentClassifiers | undefined
    contentId: string
  }
  onError?: (error: Error) => void
  onCompleted?: () => void
}) {
  let inputHash: BlockUserFromOrganizationInput = {
    organizationId,
    blockedUserId,
    duration,
    notifyBlockedUser,
    contentId,
  }

  if (hiddenReason) {
    inputHash = {
      ...inputHash,
      hiddenReason,
    }
  }

  return commitMutation<blockUserFromOrganizationMutation>(environment, {
    mutation: graphql`
      mutation blockUserFromOrganizationMutation($input: BlockUserFromOrganizationInput!) @raw_response_type {
        blockUserFromOrganization(input: $input) {
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
