import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  UpdateIssuesBulkByQueryInput,
  addIssuesToProjectsBulkByQueryMutation,
} from './__generated__/addIssuesToProjectsBulkByQueryMutation.graphql'

type addToProjectUpdateArgs = {
  addToProjectV2Ids: string[]
  removeFromProjectV2Ids: string[]
}

export function commitAddIssuesToProjectsBulkByQueryMutation({
  environment,
  input: {query, repositoryId, addToProjectV2Ids, removeFromProjectV2Ids},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {query: string; repositoryId: string} & addToProjectUpdateArgs
  onCompleted?: (response: addIssuesToProjectsBulkByQueryMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {addToProjectV2Ids, removeFromProjectV2Ids}
  const inputHash: UpdateIssuesBulkByQueryInput = {
    query,
    repositoryId,
    ...inputArgs,
  }

  return commitMutation<addIssuesToProjectsBulkByQueryMutation>(environment, {
    mutation: graphql`
      mutation addIssuesToProjectsBulkByQueryMutation($input: UpdateIssuesBulkByQueryInput!) @raw_response_type {
        updateIssuesBulkByQuery(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
