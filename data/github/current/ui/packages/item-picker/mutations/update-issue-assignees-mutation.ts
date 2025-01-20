import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {Assignee} from '../components/AssigneePicker'
import type {
  updateIssueAssigneesMutation,
  updateIssueAssigneesMutation$data,
} from './__generated__/updateIssueAssigneesMutation.graphql'

export function commitUpdateIssueAssigneesMutation({
  environment,
  input: {issueId, assignees, participants},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string; assignees: Assignee[]; participants: Assignee[]}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueAssigneesMutation$data) => void
}) {
  // merge assignees and participants into one, unique by login and take the first 5
  const newParticipants = [...new Map([...assignees, ...participants].map(item => [item.login, item])).values()].slice(
    0,
    5,
  )
  // We use the `replaceAssigneesForAssignable` mutation specifically instead of `editIssue` as this has more specific permission
  // check for assignments.
  return commitMutation<updateIssueAssigneesMutation>(environment, {
    mutation: graphql`
      mutation updateIssueAssigneesMutation($input: ReplaceAssigneesForAssignableInput!) @raw_response_type {
        replaceAssigneesForAssignable(input: $input) {
          assignable {
            ... on Issue {
              id
              assignees(first: 20) {
                nodes {
                  ...AssigneePickerAssignee
                }
              }
              participants(first: 10) {
                nodes {
                  ...AssigneePickerAssignee
                }
              }
            }
          }
        }
      }
    `,
    variables: {input: {assignableId: issueId, assigneeIds: assignees.map(a => a.id)}},
    optimisticResponse: {
      replaceAssigneesForAssignable: {
        assignable: {
          __typename: 'Issue',
          __isNode: 'Issue',
          id: issueId,
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
          participants: {
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
