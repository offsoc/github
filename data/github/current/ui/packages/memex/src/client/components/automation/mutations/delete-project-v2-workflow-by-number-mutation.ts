import {commitMutation, type Environment, graphql} from 'react-relay'
import type {RecordSourceSelectorProxy} from 'relay-runtime'

import type {deleteProjectV2WorkflowByNumberMutation$data} from './__generated__/deleteProjectV2WorkflowByNumberMutation.graphql'

export default function deleteProjectV2WorkflowByNumberMutation({
  environment,
  input: {workflowNumber, projectId},
  optimisticUpdater,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {workflowNumber: number; projectId: string}
  optimisticUpdater?: (store: RecordSourceSelectorProxy) => void
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  onCompleted?: (response: deleteProjectV2WorkflowByNumberMutation$data | unknown) => void
  onError: (error: Error) => void
}) {
  return commitMutation(environment, {
    mutation: graphql`
      mutation deleteProjectV2WorkflowByNumberMutation($workflowNumber: Int!, $projectId: ID!) @raw_response_type {
        deleteProjectV2WorkflowByNumber(input: {number: $workflowNumber, projectId: $projectId}) {
          deletedWorkflowId
        }
      }
    `,
    variables: {workflowNumber, projectId},
    optimisticUpdater,
    onCompleted,
    onError,
  })
}
