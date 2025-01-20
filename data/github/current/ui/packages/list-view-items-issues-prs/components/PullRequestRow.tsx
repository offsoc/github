import {pullRequestUrl} from '@github-ui/issue-viewer/Urls'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import type {AnalyticsEvent} from '@github-ui/use-analytics'
import React, {type ForwardedRef, forwardRef, type ReactElement, useCallback, useMemo} from 'react'
import {graphql, useSubscription} from 'react-relay'
import {useFragment, type PreloadedQuery} from 'react-relay/hooks'

import type {PullRequestItem$key} from './__generated__/PullRequestItem.graphql'
import {PullRequestItem} from './PullRequestItem'
import type {PullRequestRow_pullRequest$key} from './__generated__/PullRequestRow_pullRequest.graphql'
import type {PullRequestRowCommentsSubscription} from './__generated__/PullRequestRowCommentsSubscription.graphql'
import type {PullRequestRowCommitChecksSubscription} from './__generated__/PullRequestRowCommitChecksSubscription.graphql'
import type {PullRequestRowReviewSubscription} from './__generated__/PullRequestRowReviewSubscription.graphql'
import type {PullRequestRowStatusUpdatedSubscription} from './__generated__/PullRequestRowStatusUpdatedSubscription.graphql'
import type {PullRequestRowTitleUpdatedSubscription} from './__generated__/PullRequestRowTitleUpdatedSubscription.graphql'
import {LABELS} from '../constants/labels'
import type {QUERY_FIELDS} from '../constants/queries'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'

export function usePullRequestSubscriptions(pullRequestId: string) {
  const statusConfig = useMemo(
    () => ({
      subscription: graphql`
        subscription PullRequestRowStatusUpdatedSubscription($id: ID!) {
          pullRequestStatusUpdated(id: $id) {
            id
            state
            isDraft
          }
        }
      `,
      variables: {id: pullRequestId},
    }),
    [pullRequestId],
  )

  const titleConfig = useMemo(
    () => ({
      subscription: graphql`
        subscription PullRequestRowTitleUpdatedSubscription($id: ID!) {
          pullRequestTitleUpdated(id: $id) {
            id
            title
            titleHTML
          }
        }
      `,
      variables: {id: pullRequestId},
    }),
    [pullRequestId],
  )

  const commentsConfig = useMemo(
    () => ({
      subscription: graphql`
        subscription PullRequestRowCommentsSubscription($id: ID!) {
          pullRequestCommentsUpdated(id: $id) {
            id
            totalCommentsCount
          }
        }
      `,
      variables: {id: pullRequestId},
    }),
    [pullRequestId],
  )

  const reviewDecisionConfig = useMemo(
    () => ({
      subscription: graphql`
        subscription PullRequestRowReviewSubscription($id: ID!) {
          pullRequestReviewDecisionUpdated(id: $id) {
            id
            reviewDecision
          }
        }
      `,
      variables: {id: pullRequestId},
    }),
    [pullRequestId],
  )

  useSubscription<PullRequestRowStatusUpdatedSubscription>(statusConfig)
  useSubscription<PullRequestRowTitleUpdatedSubscription>(titleConfig)
  useSubscription<PullRequestRowCommentsSubscription>(commentsConfig)
  useSubscription<PullRequestRowReviewSubscription>(reviewDecisionConfig)
}

/**
 * This component allows us to conditionally subscribe to commit checks updates (hooks can't be called conditionally)
 */
export function CommitChecksUpdateSubscriptionWrapper({commitId}: {commitId: string}) {
  const commitChecksConfig = useMemo(
    () => ({
      subscription: graphql`
        subscription PullRequestRowCommitChecksSubscription($id: ID!) {
          commitChecksUpdated(id: $id) {
            id
            statusCheckRollup {
              state
              contexts {
                checkRunCount
                checkRunCountsByState {
                  count
                  state
                }
              }
            }
          }
        }
      `,
      variables: {id: commitId},
    }),
    [commitId],
  )

  useSubscription<PullRequestRowCommitChecksSubscription>(commitChecksConfig)
  return <></>
}

type Props = {
  pullRequestKey: PullRequestRow_pullRequest$key
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
  /**
   * Href getter for the metadata badge links
   * @param type - metadata type
   * @param name - name of the metadata
   * @returns URL to the metadata
   */
  getMetadataHref: (type: keyof typeof QUERY_FIELDS, metadataName: string) => string
  onSelect?: (selected: boolean) => void
  onSelectRow: (payload?: {[key: string]: unknown} | AnalyticsEvent | undefined) => void
  isActive: boolean
  isSelected?: boolean
  showAvatar?: boolean
  reactionEmojiToDisplay?: {reaction: string; reactionEmoji: string}
  sortingItemSelected: string
  additionalAnalyticsContext?: Record<string, string>
}

const PullRequestRowInternal = forwardRef(
  (
    {
      pullRequestKey,
      metadataRef,
      reactionEmojiToDisplay,
      getMetadataHref,
      onSelect,
      onSelectRow,
      isActive,
      isSelected,
      showAvatar,
      sortingItemSelected,
      additionalAnalyticsContext = {},
      ...props
    }: Props,
    ref: ForwardedRef<HTMLAnchorElement>,
  ): ReactElement => {
    const {use_pull_request_subscriptions_enabled} = useFeatureFlags()

    const pullRequest = useFragment(
      graphql`
        fragment PullRequestRow_pullRequest on PullRequest @argumentDefinitions(labelPageSize: {type: "Int!"}) {
          __typename
          id
          repository {
            name
            owner {
              login
            }
          }
          ...PullRequestItem @arguments(labelPageSize: $labelPageSize)

          headCommit {
            commit {
              id
            }
          }
          number
        }
      `,
      pullRequestKey,
    )

    if (use_pull_request_subscriptions_enabled) {
      // Feature flagging for deploy safety only
      // eslint-disable-next-line react-hooks/rules-of-hooks
      usePullRequestSubscriptions(pullRequest.id)
    }
    const pullRequestOwner = pullRequest.repository.owner.login

    const showTimeStamp = useMemo(
      () => [LABELS.Newest, LABELS.Oldest, LABELS.RecentlyUpdated].indexOf(sortingItemSelected) >= 0,
      [sortingItemSelected],
    )

    const url = pullRequestUrl({owner: pullRequestOwner, repo: pullRequest.repository.name, number: pullRequest.number})

    const handleNavigation = useCallback(
      (event: React.MouseEvent | React.KeyboardEvent) => {
        onSelectRow({
          type: pullRequest.__typename,
          ...additionalAnalyticsContext,
        })

        event.stopPropagation()
        event.preventDefault()

        // open item in new tab
        window.open(`${window.location.origin}${url}`)
      },
      [additionalAnalyticsContext, onSelectRow, pullRequest.__typename, url],
    )

    return (
      <>
        {!!pullRequest.headCommit && use_pull_request_subscriptions_enabled && (
          <CommitChecksUpdateSubscriptionWrapper commitId={pullRequest.headCommit.commit.id} />
        )}
        <PullRequestItem
          itemKey={pullRequest as PullRequestItem$key}
          metadataRef={metadataRef}
          isActive={isActive}
          isSelected={isSelected}
          reactionEmojiToDisplay={reactionEmojiToDisplay}
          showAuthorAvatar={showAvatar}
          showCommentCount={true}
          showTimestamp={showTimeStamp}
          showRepository={true}
          showAssignees={true}
          showLeadingRightSideContent={false}
          sortingItemSelected={sortingItemSelected}
          getMetadataHref={getMetadataHref}
          onSelect={onSelect}
          onClick={handleNavigation}
          href={url}
          ref={ref}
          {...props}
        />
      </>
    )
  },
)

PullRequestRowInternal.displayName = 'PullRequestRow'

export const PullRequestRow = React.memo(PullRequestRowInternal)
