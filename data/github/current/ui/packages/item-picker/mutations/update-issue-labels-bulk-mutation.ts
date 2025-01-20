import {commitMutation, graphql} from 'react-relay'
import {ConnectionHandler, type Environment, type RecordSourceSelectorProxy} from 'relay-runtime'

import type {
  UpdateIssuesBulkInput,
  updateIssueLabelsBulkMutation,
} from './__generated__/updateIssueLabelsBulkMutation.graphql'

type issueUpdateArgs = {
  applyLabelIds: string[]
  removeLabelIds: string[]
}

export function updateIssuesById(
  store: RecordSourceSelectorProxy,
  ids: string[],
  existingIssueLabels: Map<string, string[]>,
  connectionIds: {[key: string]: string[]},
  issueUpdateArgs: issueUpdateArgs,
) {
  for (const id of ids) {
    const issue = store.get(id)
    if (!issue) return
    const connections = connectionIds[id]?.map(cId => store.get(cId))

    issueUpdateArgs.applyLabelIds.map(labelId => {
      if (existingIssueLabels.get(id)?.includes(labelId)) return
      const label = store.get(labelId)
      if (!label) return
      connections
        ?.filter(connection => connection)
        .map(connection => {
          const edge = connection && ConnectionHandler.createEdge(store, connection, label, 'LabelEdge')
          edge && ConnectionHandler.insertEdgeBefore(connection, edge)
        })
    })

    issueUpdateArgs.removeLabelIds.map(labelId => {
      connections
        ?.filter(connection => connection)
        .map(connection => connection && ConnectionHandler.deleteNode(connection, labelId))
    })
  }
}

export function commitUpdateIssueLabelsBulkMutation({
  environment,
  optimisticUpdateIds,
  existingIssueLabels,
  connectionIds,
  input: {ids, applyLabelIds, removeLabelIds},
  onCompleted,
  onError,
}: {
  environment: Environment
  connectionIds: {[key: string]: string[]}
  input: {ids: string[]} & issueUpdateArgs
  optimisticUpdateIds: string[]
  existingIssueLabels: Map<string, string[]>
  onCompleted?: (response: updateIssueLabelsBulkMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {applyLabelIds, removeLabelIds}
  const inputHash: UpdateIssuesBulkInput = {
    ids,
    ...inputArgs,
  }

  return commitMutation<updateIssueLabelsBulkMutation>(environment, {
    mutation: graphql`
      mutation updateIssueLabelsBulkMutation($input: UpdateIssuesBulkInput!) @raw_response_type {
        updateIssuesBulk(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssuesById(store, optimisticUpdateIds, existingIssueLabels, connectionIds, inputArgs),
    optimisticUpdater: store =>
      updateIssuesById(store, optimisticUpdateIds, existingIssueLabels, connectionIds, inputArgs),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
