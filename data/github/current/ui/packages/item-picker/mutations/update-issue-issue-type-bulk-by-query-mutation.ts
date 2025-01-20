import {type Environment, commitMutation, graphql} from 'react-relay'
import type {updateIssueIssueTypeBulkByQueryMutation} from './__generated__/updateIssueIssueTypeBulkByQueryMutation.graphql'
import {UNSET_ID} from '../components/IssueTypePicker'
import {updateIssueIssueTypeById} from './update-issue-issue-type-bulk-mutation'

type InputArgs = {query: string; repositoryId: string; issueTypeId?: string; unsetIssueType?: boolean}

export function commitUpdateIssueIssueTypeBulkByQueryMutation({
  environment,
  input: {query, repositoryId, issueTypeId},
  optimisticUpdateIds,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {query: string; repositoryId: string; issueTypeId: string}
  optimisticUpdateIds: string[]
  onCompleted?: (response: updateIssueIssueTypeBulkByQueryMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputHash: InputArgs = {query, repositoryId}
  if (issueTypeId !== UNSET_ID) inputHash.issueTypeId = issueTypeId
  else inputHash.unsetIssueType = true

  return commitMutation<updateIssueIssueTypeBulkByQueryMutation>(environment, {
    mutation: graphql`
      mutation updateIssueIssueTypeBulkByQueryMutation($input: UpdateIssuesBulkByQueryInput!) @raw_response_type {
        updateIssuesBulkByQuery(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssueIssueTypeById(store, optimisticUpdateIds, inputHash.issueTypeId),
    optimisticUpdater: store => updateIssueIssueTypeById(store, optimisticUpdateIds, inputHash.issueTypeId),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
