import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updateIssueProjectsMutation,
  updateIssueProjectsMutation$data,
} from './__generated__/updateIssueProjectsMutation.graphql'

type CommitProjectMutationProps = {
  environment: Environment
  connectionId?: string
  projectId: string
  issueId: string
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueProjectsMutation$data) => void
}

export function commitUpdateIssueProjectsMutation({
  environment,
  connectionId,
  projectId,
  issueId,
  onError,
  onCompleted,
}: CommitProjectMutationProps) {
  if (!projectId) return
  return commitMutation<updateIssueProjectsMutation>(environment, {
    mutation: graphql`
      mutation updateIssueProjectsMutation($connections: [ID!]!, $input: AddProjectV2ItemByIdInput!)
      @raw_response_type {
        addProjectV2ItemById(input: $input) {
          projectEdge @appendEdge(connections: $connections) {
            node {
              ...ProjectItemSection
            }
          }
        }
      }
    `,
    variables: {input: {contentId: issueId, projectId}, connections: connectionId ? [connectionId] : []},
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
