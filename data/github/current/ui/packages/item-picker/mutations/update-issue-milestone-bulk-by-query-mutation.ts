import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  UpdateIssuesBulkByQueryInput,
  updateIssueMilestoneBulkByQueryMutation,
} from './__generated__/updateIssueMilestoneBulkByQueryMutation.graphql'

type issueUpdateArgs = {
  milestoneId: string
}

export function commitUpdateIssueMilestoneBulkByQueryMutation({
  environment,
  input: {query, repositoryId, milestoneId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {query: string; repositoryId: string} & issueUpdateArgs
  onCompleted?: (response: updateIssueMilestoneBulkByQueryMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputArgs = {milestoneId}
  const inputHash: UpdateIssuesBulkByQueryInput = {
    query,
    repositoryId,
    ...inputArgs,
  }

  return commitMutation<updateIssueMilestoneBulkByQueryMutation>(environment, {
    mutation: graphql`
      mutation updateIssueMilestoneBulkByQueryMutation($input: UpdateIssuesBulkByQueryInput!) @raw_response_type {
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
