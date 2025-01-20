import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import mutationRequest, {type markAsDoneMutation} from './__generated__/markAsDoneMutation.graphql'

type MarkAsDoneMutationProps = {
  environment: Environment
  notificationId: string
  onError?: (error: Error) => void
}

graphql`
  mutation markAsDoneMutation($input: MarkNotificationAsDoneInput!) @raw_response_type {
    markNotificationAsDone(input: $input) {
      success
      notificationThread {
        id
        isDone
      }
    }
  }
`

export function markNotificationAsDone({environment, notificationId, onError}: MarkAsDoneMutationProps) {
  return commitMutation<markAsDoneMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {id: notificationId}},
    optimisticResponse: {
      markNotificationAsDone: {
        success: true,
        notificationThread: {
          id: notificationId,
          isDone: true,
        },
      },
    },
    onError,
  })
}
