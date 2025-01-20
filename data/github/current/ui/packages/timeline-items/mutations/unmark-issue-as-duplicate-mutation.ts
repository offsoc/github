import {commitMutation, graphql, commitLocalUpdate} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  unmarkIssueAsDuplicateMutation,
  unmarkIssueAsDuplicateMutation$data,
} from './__generated__/unmarkIssueAsDuplicateMutation.graphql'

export function commitUnmarkIssueAsDuplicateMutation({
  environment,
  input: {cannonicalId, duplicateId},
  eventId,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {cannonicalId: string; duplicateId: string}
  eventId: string
  onError?: (error: Error) => void
  onCompleted?: (response: unmarkIssueAsDuplicateMutation$data) => void
}) {
  return commitMutation<unmarkIssueAsDuplicateMutation>(environment, {
    mutation: graphql`
      mutation unmarkIssueAsDuplicateMutation($cannonicalId: ID!, $duplicateId: ID!) @raw_response_type {
        unmarkIssueAsDuplicate(input: {canonicalId: $cannonicalId, duplicateId: $duplicateId}) {
          clientMutationId
        }
      }
    `,
    variables: {cannonicalId, duplicateId},
    onError: error => onError && onError(error),
    onCompleted: response => {
      commitLocalUpdate(environment, store => {
        const event = store.get(eventId)
        event?.setValue(true, 'pendingUndo')
      })
      onCompleted?.(response)
    },
  })
}
