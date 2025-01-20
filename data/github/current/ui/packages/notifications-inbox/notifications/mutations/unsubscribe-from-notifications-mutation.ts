import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import mutationRequest, {
  type unsubscribeFromNotificationsMutation,
} from './__generated__/unsubscribeFromNotificationsMutation.graphql'

type UnsubscribeFromNotificationsMutationProps = {
  environment: Environment
  subjectIds: Set<string>
  onCompleted?: () => void
  onError?: (error: Error) => void
}

graphql`
  mutation unsubscribeFromNotificationsMutation($input: UnsubscribeFromNotificationsInput!) @raw_response_type {
    unsubscribeFromNotifications(input: $input) {
      success
    }
  }
`

export function unsubscribeFromNotifications({
  environment,
  subjectIds,
  onCompleted,
  onError,
}: UnsubscribeFromNotificationsMutationProps) {
  return commitMutation<unsubscribeFromNotificationsMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {ids: Array.from(subjectIds)}},
    onCompleted,
    onError,
  })
}
