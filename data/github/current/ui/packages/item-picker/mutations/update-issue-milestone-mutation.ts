import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {Milestone} from '../components/MilestonePicker'
import type {
  updateIssueMilestoneMutation,
  updateIssueMilestoneMutation$data,
} from './__generated__/updateIssueMilestoneMutation.graphql'

export function commitUpdateIssueMilestoneMutation({
  environment,
  input: {issueId, milestone},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {issueId: string; milestone: Milestone | null}
  onError?: (error: Error) => void
  onCompleted?: (response: updateIssueMilestoneMutation$data) => void
}) {
  return commitMutation<updateIssueMilestoneMutation>(environment, {
    mutation: graphql`
      mutation updateIssueMilestoneMutation($input: UpdateIssueInput!) @raw_response_type {
        updateIssue(input: $input) {
          issue {
            id
            milestone {
              ...MilestonePickerMilestone
            }
          }
        }
      }
    `,
    variables: {input: {id: issueId, milestoneId: milestone ? milestone.id : null}},
    optimisticResponse: {
      updateIssue: {
        issue: {
          id: issueId,
          milestone: milestone
            ? {
                id: milestone.id,
                title: milestone.title,
                closed: milestone.closed,
                dueOn: milestone.dueOn,
                progressPercentage: milestone.progressPercentage,
                url: milestone.url,
                closedAt: milestone.closedAt,
              }
            : null,
        },
      },
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
