import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  ApplySuggestedChangesInput,
  applySuggestedChangesMutation as applySuggestedChangesMutationType,
  applySuggestedChangesMutation$data,
} from './__generated__/applySuggestedChangesMutation.graphql'

export default function applySuggestedChangesMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: ApplySuggestedChangesInput
  onCompleted?: (response: applySuggestedChangesMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<applySuggestedChangesMutationType>(environment, {
    mutation: graphql`
      mutation applySuggestedChangesMutation($input: ApplySuggestedChangesInput!) @raw_response_type {
        applySuggestedChanges(input: $input) {
          clientMutationId
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
