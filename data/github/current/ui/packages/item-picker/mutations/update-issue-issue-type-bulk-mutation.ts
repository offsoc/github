import {type Environment, commitMutation, graphql} from 'react-relay'
import type {updateIssueIssueTypeBulkMutation} from './__generated__/updateIssueIssueTypeBulkMutation.graphql'
import type {RecordSourceSelectorProxy} from 'relay-runtime'
import {UNSET_ID} from '../components/IssueTypePicker'

type InputArgs = {ids: string[]; issueTypeId?: string; unsetIssueType?: boolean}

export function updateIssueIssueTypeById(
  store: RecordSourceSelectorProxy,
  ids: string[],
  issueTypeId: string | null | undefined,
) {
  for (const id of ids) {
    const issue = store.get(id)
    if (!issue) return

    // Remove the issue type if the issue type is null (unset)
    const issueType = issueTypeId ? store.get(issueTypeId) : null
    if (!issueType) {
      issue.setValue(null, 'issueType')
      continue
    }

    issue.setLinkedRecord(issueType, 'issueType')
  }
}

export function commitUpdateIssueIssueTypeBulkMutation({
  environment,
  input: {ids, issueTypeId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {ids: string[]; issueTypeId: string}
  onCompleted?: (response: updateIssueIssueTypeBulkMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputHash: InputArgs = {ids}
  if (issueTypeId !== UNSET_ID) inputHash.issueTypeId = issueTypeId
  else inputHash.unsetIssueType = true

  return commitMutation<updateIssueIssueTypeBulkMutation>(environment, {
    mutation: graphql`
      mutation updateIssueIssueTypeBulkMutation($input: UpdateIssuesBulkInput!) @raw_response_type {
        updateIssuesBulk(input: $input) {
          jobId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    updater: store => updateIssueIssueTypeById(store, ids, inputHash.issueTypeId),
    optimisticUpdater: store => updateIssueIssueTypeById(store, ids, inputHash.issueTypeId),
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
