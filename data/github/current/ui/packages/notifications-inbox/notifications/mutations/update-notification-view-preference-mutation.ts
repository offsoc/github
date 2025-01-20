import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import mutationRequest, {
  type updateNotificationViewPreferenceMutation,
} from './__generated__/updateNotificationViewPreferenceMutation.graphql'
import type {NotificationViewPreference} from '../../types/notification'

type UpdateNotificationViewPreferenceMutationProps = {
  environment: Environment
  viewPreference: NotificationViewPreference
  onError?: (error: Error) => void
  onCompleted?: () => void
}

graphql`
  mutation updateNotificationViewPreferenceMutation($input: UpdateNotificationViewPreferenceInput!) @raw_response_type {
    updateNotificationViewPreference(input: $input) {
      success
    }
  }
`

export function updateNotificationViewPreference({
  environment,
  viewPreference,
  onError,
  onCompleted,
}: UpdateNotificationViewPreferenceMutationProps) {
  return commitMutation<updateNotificationViewPreferenceMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {viewPreference}},
    onError,
    onCompleted: () => onCompleted && onCompleted(),
  })
}
