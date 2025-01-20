import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {LabelPickerLabel$data as Label} from '../components/__generated__/LabelPickerLabel.graphql'
import type {
  updateIssueLabelsMutation,
  updateIssueLabelsMutation$data,
} from './__generated__/updateIssueLabelsMutation.graphql'

export function commitUpdateIssueLabelsMutation({
  environment,
  input: {issueId, labels},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string; labels: Label[]}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueLabelsMutation$data) => void
}) {
  return commitMutation<updateIssueLabelsMutation>(environment, {
    mutation: graphql`
      mutation updateIssueLabelsMutation($input: UpdateIssueInput!) @raw_response_type {
        updateIssue(input: $input) {
          issue {
            id
            ...LabelsSectionAssignedLabels
          }
        }
      }
    `,
    variables: {input: {id: issueId, labelIds: labels.map(a => a.id)}},
    optimisticResponse: {
      updateIssue: {
        issue: {
          __isNode: 'Issue',
          __isLabelable: 'Issue',
          id: issueId,
          labels: {
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
            edges: labels.map(a => ({
              cursor: a.id,
              node: {
                __typename: 'Label',
                id: a.id,
                name: a.name,
                nameHTML: a.nameHTML,
                color: a.color,
                url: a.url,
                description: a.description,
              },
            })),
          },
        },
      },
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
