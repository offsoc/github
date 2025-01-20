import {markPullRequestReadyForReviewMutation} from '@github-ui/mergebox'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {CodeReviewIcon, GitPullRequestDraftIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import convertPullRequestToDraftMutation from './../../mutations/convert-pull-request-to-draft-mutation'
import type {ActionSection_pullRequest$key} from './__generated__/ActionSection_pullRequest.graphql'

/**
 * Houses actions that can be taken on a pull request from the details pane
 */
export function ActionSection({pullRequest}: {pullRequest: ActionSection_pullRequest$key}) {
  const environment = useRelayEnvironment()
  const actionData = useFragment(
    graphql`
      fragment ActionSection_pullRequest on PullRequest {
        id
        isDraft
        baseRepository {
          planSupportsDraftPullRequests: planSupports(feature: DRAFT_PRS)
        }
        state
        viewerCanUpdate
      }
    `,
    pullRequest,
  )
  const {addToast} = useToastContext()

  function convertToDraft() {
    convertPullRequestToDraftMutation({
      environment,
      input: {pullRequestId: actionData.id},
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Could not convert to draft',
        })
      },
    })
  }

  function readyForReview() {
    markPullRequestReadyForReviewMutation({
      environment,
      input: {pullRequestId: actionData.id},
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Could not mark ready for review',
        })
      },
    })
  }

  if (
    !actionData.baseRepository?.planSupportsDraftPullRequests ||
    !actionData.viewerCanUpdate ||
    actionData.state !== 'OPEN'
  ) {
    return null
  }

  return (
    <ActionList variant="full">
      {actionData.isDraft ? (
        <ActionList.Item sx={{width: '100%'}} onSelect={readyForReview}>
          <ActionList.LeadingVisual>
            <CodeReviewIcon />
          </ActionList.LeadingVisual>
          Mark as ready for review
        </ActionList.Item>
      ) : (
        <ActionList.Item sx={{width: '100%'}} onSelect={convertToDraft}>
          <ActionList.LeadingVisual>
            <GitPullRequestDraftIcon />
          </ActionList.LeadingVisual>
          Convert to draft
        </ActionList.Item>
      )}
    </ActionList>
  )
}
