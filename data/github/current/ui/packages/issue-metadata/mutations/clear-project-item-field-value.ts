import {commitMutation, ConnectionHandler, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import type {
  clearProjectItemFieldValueMutation,
  clearProjectItemFieldValueMutation$data,
  ClearProjectV2ItemFieldValueInput,
} from './__generated__/clearProjectItemFieldValueMutation.graphql'

function clearProjectItemFieldValueOptimistic(
  store: RecordSourceSelectorProxy,
  input: ClearProjectV2ItemFieldValueInput,
) {
  // step 1: get the field values for a project item
  const connectionId = `${ConnectionHandler.getConnectionID(
    input.itemId,
    'ProjectItemSection_fieldValues',
  )}(orderBy:{"direction":"ASC","field":"POSITION"})`
  const connection = store.get(connectionId)
  if (!connection) return

  // step 2: remove the deleted field value from the connection
  connection.getLinkedRecords('edges')?.map((edge, index) => {
    if (edge?.getLinkedRecord('node')?.getLinkedRecord('field')?.getDataID() === input.fieldId) {
      const updatedEdges = connection.getLinkedRecords('edges') || []
      updatedEdges.splice(index, 1)
      connection.setLinkedRecords(updatedEdges, 'edges')
    }
  })
}

export function commitClearProjectItemFieldValueMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: ClearProjectV2ItemFieldValueInput
  onError?: (error: Error) => void
  onCompleted?: (response: clearProjectItemFieldValueMutation$data) => void
}) {
  return commitMutation<clearProjectItemFieldValueMutation>(environment, {
    mutation: graphql`
      mutation clearProjectItemFieldValueMutation($input: ClearProjectV2ItemFieldValueInput!) @raw_response_type {
        clearProjectV2ItemFieldValue(input: $input) {
          projectV2Item {
            id
            type
            project {
              id
            }
            ...ProjectItemSectionFieldsValues
            fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
              }
            }
          }
        }
      }
    `,
    variables: {
      input,
    },
    optimisticUpdater: store => clearProjectItemFieldValueOptimistic(store, input),
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
