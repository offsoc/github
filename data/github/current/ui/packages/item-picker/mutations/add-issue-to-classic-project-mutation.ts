import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  addIssueToClassicProjectMutation,
  addIssueToClassicProjectMutation$data,
} from './__generated__/addIssueToClassicProjectMutation.graphql'

type CommitProjectMutationProps = {
  environment: Environment
  connectionId?: string
  projectColumnId: string
  issueId: string
  onError?: (error: Error) => void
  onCompleted?: (response: addIssueToClassicProjectMutation$data) => void
}

export function commitAddIssueToClassicProjectMutation({
  environment,
  connectionId,
  projectColumnId,
  issueId,
  onError,
  onCompleted,
}: CommitProjectMutationProps) {
  return commitMutation<addIssueToClassicProjectMutation>(environment, {
    mutation: graphql`
      mutation addIssueToClassicProjectMutation($connections: [ID!]!, $input: AddProjectCardInput!) @raw_response_type {
        addProjectCard(input: $input) {
          cardEdge @appendEdge(connections: $connections) {
            node {
              ...ClassicProjectItem
            }
          }
        }
      }
    `,
    variables: {input: {contentId: issueId, projectColumnId}, connections: connectionId ? [connectionId] : []},
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
