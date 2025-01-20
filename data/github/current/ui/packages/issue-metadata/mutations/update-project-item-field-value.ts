import {commitMutation, ConnectionHandler, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import type {
  updateProjectItemFieldValueMutation,
  updateProjectItemFieldValueMutation$data,
  UpdateProjectV2ItemFieldValueInput,
} from './__generated__/updateProjectItemFieldValueMutation.graphql'

function updateProjectItemFieldValueOptimistic(
  store: RecordSourceSelectorProxy,
  input: UpdateProjectV2ItemFieldValueInput,
) {
  // step 1: get the field values for a project item
  const connectionId = `${ConnectionHandler.getConnectionID(
    input.itemId,
    'ProjectItemSection_fieldValues',
  )}(orderBy:{"direction":"ASC","field":"POSITION"})`
  const connection = store.get(connectionId)
  if (!connection) return

  // step 2: find the field value that matches the field id
  const nodes = connection.getLinkedRecords('edges')?.map(edge => edge.getLinkedRecord('node')) || []
  const node = nodes.find(cur_node => {
    if (!cur_node) return false
    const field = cur_node.getLinkedRecord('field')
    if (!field) return false
    return field.getDataID() === input.fieldId
  })

  // the memex api only returns the field value if it has a value
  // this means that we can't optimistically update a field value that doesn't exist
  if (node) {
    switch (node.getType()) {
      case 'ProjectV2ItemFieldTextValue': {
        node.setValue(input.value.text, 'text')
        break
      }
      case 'ProjectV2ItemFieldNumberValue': {
        node.setValue(input.value.number, 'number')
        break
      }
      case 'ProjectV2ItemFieldDateValue': {
        node.setValue(input.value.date, 'date')
        break
      }
      case 'ProjectV2ItemFieldSingleSelectValue': {
        if (!input.value.singleSelectOptionId) return
        // get the option by id
        const singleSelectOption = store.get(input.value.singleSelectOptionId)
        if (!singleSelectOption) return

        node.setValue(input.value.singleSelectOptionId, 'optionId')

        for (const key of ['color', 'name', 'nameHTML']) {
          node.setValue(singleSelectOption.getValue(key), key)
        }

        break
      }
      case 'ProjectV2ItemFieldIterationValue': {
        if (!input.value.iterationId) return
        // get the iteration by id
        const iteration = store.get(input.value.iterationId)
        if (!iteration) return

        node.setValue(input.value.iterationId, 'iterationId')

        for (const key of ['duration', 'startDate', 'title', 'titleHTML']) {
          node.setValue(iteration.getValue(key), key)
        }

        break
      }
    }
  }
}

export function commitUpdateProjectItemFieldValueMutation({
  environment,
  input,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: UpdateProjectV2ItemFieldValueInput
  onError?: (error: Error) => void
  onCompleted?: (response: updateProjectItemFieldValueMutation$data) => void
}) {
  return commitMutation<updateProjectItemFieldValueMutation>(environment, {
    mutation: graphql`
      mutation updateProjectItemFieldValueMutation($input: UpdateProjectV2ItemFieldValueInput!) @raw_response_type {
        updateProjectV2ItemFieldValue(input: $input) {
          projectV2Item {
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
    optimisticUpdater: store => updateProjectItemFieldValueOptimistic(store, input),
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
