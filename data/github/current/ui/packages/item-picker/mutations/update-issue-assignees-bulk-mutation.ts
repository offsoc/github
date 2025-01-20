import {commitMutation, graphql} from 'react-relay'
import {ConnectionHandler, type Environment, type RecordSourceSelectorProxy} from 'relay-runtime'
import type {
  UpdateIssuesBulkInput,
  updateIssueAssigneesBulkMutation,
} from './__generated__/updateIssueAssigneesBulkMutation.graphql'

type issueUpdateArgs = {
  applyAssigneeIds: string[]
  removeAssigneeIds: string[]
}

export function updateIssuesById(
  store: RecordSourceSelectorProxy,
  ids: string[],
  existingIssueAssignees: Map<string, string[]>,
  connectionIds: {[key: string]: string[]},
  issueUpdateArgs: issueUpdateArgs,
) {
  for (const id of ids) {
    const issue = store.get(id)
    if (!issue) return
    const connections = connectionIds[id]?.map(cId => store.get(cId))

    issueUpdateArgs.applyAssigneeIds.map(assigneeId => {
      if (existingIssueAssignees.get(id)?.includes(assigneeId)) return
      const assignee = store.get(assigneeId)
      if (!assignee) return
      connections
        ?.filter(connection => connection)
        .map(connection => {
          const edge = connection && ConnectionHandler.createEdge(store, connection, assignee, 'AssigneeEdge')
          edge && ConnectionHandler.insertEdgeBefore(connection, edge)
        })
    })

    issueUpdateArgs.removeAssigneeIds.map(assigneeId => {
      connections
        ?.filter(connection => connection)
        .map(connection => connection && ConnectionHandler.deleteNode(connection, assigneeId))
    })
  }
}

export function commitUpdateIssueAssigneesBulkMutation({
  environment,
  optimisticUpdateIds,
  existingIssueAssignees,
  connectionIds,
  input: {ids, applyAssigneeIds, removeAssigneeIds},
  onCompleted,
  onError,
}: {
  environment: Environment
  connectionIds: {[key: string]: string[]}
  input: {ids: string[]} & issueUpdateArgs
  optimisticUpdateIds: string[]
  existingIssueAssignees: Map<string, string[]>
  onCompleted?: (response: updateIssueAssigneesBulkMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {applyAssigneeIds, removeAssigneeIds}
  const inputHash: UpdateIssuesBulkInput = {
    ids,
    ...inputArgs,
  }

  return commitMutation<updateIssueAssigneesBulkMutation>(environment, {
    mutation: graphql`
      mutation updateIssueAssigneesBulkMutation($input: UpdateIssuesBulkInput!) @raw_response_type {
        updateIssuesBulk(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssuesById(store, optimisticUpdateIds, existingIssueAssignees, connectionIds, inputArgs),
    optimisticUpdater: store =>
      updateIssuesById(store, optimisticUpdateIds, existingIssueAssignees, connectionIds, inputArgs),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
