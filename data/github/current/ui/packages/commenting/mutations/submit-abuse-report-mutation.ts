import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  AbuseReportReason,
  SubmitAbuseReportInput,
  submitAbuseReportMutation,
} from './__generated__/submitAbuseReportMutation.graphql'

export function submitAbuseReportMutation({
  environment,
  input: {reportedContentId, reason},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {
    reportedContentId: string
    reason: AbuseReportReason
  }
  onError?: (error: Error) => void
  onCompleted?: () => void
}) {
  const inputHash: SubmitAbuseReportInput = {
    reportedContent: reportedContentId,
    reason,
  }

  return commitMutation<submitAbuseReportMutation>(environment, {
    mutation: graphql`
      mutation submitAbuseReportMutation($input: SubmitAbuseReportInput!) @raw_response_type {
        submitAbuseReport(input: $input) {
          clientMutationId
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onError: error => onError && onError(error),
    onCompleted: () => onCompleted && onCompleted(),
  })
}
