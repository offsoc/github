import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {Assignee} from '../components/AssigneePicker'
import type {
  replaceAssigneesForAssignableMutation,
  replaceAssigneesForAssignableMutation$data,
} from './__generated__/replaceAssigneesForAssignableMutation.graphql'

export function commitReplaceAssigneesForAssignableMutation({
  environment,
  input: {assignableId, assignees, participants, typename},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {assignableId: string; assignees: Assignee[]; participants: Assignee[]; typename: string}
  onError?: (error: Error) => void
  onCompleted?: (response: replaceAssigneesForAssignableMutation$data) => void
}) {
  // merge assignees and participants into one, unique by login
  const newParticipants = [...new Map([...assignees, ...participants].map(item => [item.login, item])).values()]

  return commitMutation<replaceAssigneesForAssignableMutation>(environment, {
    mutation: graphql`
      mutation replaceAssigneesForAssignableMutation($input: ReplaceAssigneesForAssignableInput!) @raw_response_type {
        replaceAssigneesForAssignable(input: $input) {
          assignable {
            assignees(first: 20) {
              nodes {
                ...AssigneePickerAssignee
              }
            }
            suggestedAssignees(first: 20) {
              nodes {
                ...AssigneePickerAssignee
              }
            }
          }
        }
      }
    `,
    variables: {input: {assignableId, assigneeIds: assignees.map(a => a.id)}},
    optimisticResponse: {
      replaceAssigneesForAssignable: {
        assignable: {
          id: assignableId,
          __isNode: 'true',
          __typename: typename,
          assignees: {
            nodes: assignees.map(a => {
              return {
                id: a.id,
                login: a.login,
                name: a.name,
                avatarUrl: a.avatarUrl,
              }
            }),
          },
          suggestedAssignees: {
            nodes: newParticipants.map(a => {
              return {
                id: a.id,
                login: a.login,
                name: a.name,
                avatarUrl: a.avatarUrl,
              }
            }),
          },
        },
      },
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
