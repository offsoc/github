import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {LabelPickerLabel$data as Label} from '../components/__generated__/LabelPickerLabel.graphql'
import type {
  setLabelsForLabelableMutation,
  setLabelsForLabelableMutation$data,
} from './__generated__/setLabelsForLabelableMutation.graphql'

export function commitSetLabelsForLabelableMutation({
  environment,
  input: {labelableId, labels, labelableTypeName},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {labelableId: string; labels: Label[]; labelableTypeName: 'Issue' | 'PullRequest'}
  onError?: (error: Error) => void
  onCompleted?: (response: setLabelsForLabelableMutation$data) => void
}) {
  return commitMutation<setLabelsForLabelableMutation>(environment, {
    mutation: graphql`
      mutation setLabelsForLabelableMutation($input: SetLabelsForLabelableInput!) @raw_response_type {
        setLabelsForLabelable(input: $input) {
          labelableRecord {
            ...LabelPickerAssignedLabels
            ...LabelsSectionAssignedLabels
          }
        }
      }
    `,
    variables: {input: {labelableId, labelIds: labels.map(a => a.id)}},
    optimisticResponse: {
      setLabelsForLabelable: {
        labelableRecord: {
          __typename: labelableTypeName,
          __isNode: 'true',
          __isLabelable: 'true',
          id: labelableId,
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
