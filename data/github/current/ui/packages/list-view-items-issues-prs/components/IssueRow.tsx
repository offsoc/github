import {prefetchIssueDebounced} from '@github-ui/issue-viewer/IssueViewerLoader'
import {issueUrl} from '@github-ui/issue-viewer/Urls'

import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import type {AnalyticsEvent} from '@github-ui/use-analytics'
import React, {type ForwardedRef, forwardRef, type ReactElement, useCallback, useMemo} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {graphql, useFragment, type PreloadedQuery} from 'react-relay/hooks'
import type {NavigateOptions, To} from 'react-router-dom'

import type {IssueItem$key} from './__generated__/IssueItem.graphql'
import {IssueItem, IssueItemQuery} from './IssueItem'
import type {IssueRow$key} from './__generated__/IssueRow.graphql'
import {LABELS} from '../constants/labels'
import type {QUERY_FIELDS} from '../constants/queries'
import {useIssueRowSubscription} from './IssueRowSubscription'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'

export const IssuesIndexSecondaryGraphqlQuery = graphql`
  query IssueRowSecondaryQuery($nodes: [ID!]!, $assigneePageSize: Int = 10, $includeReactions: Boolean = false) {
    nodes(ids: $nodes) {
      id
      __typename
      ... on Issue {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...IssuePullRequestStateIconViewed
        ...IssueItemMetadata @arguments(assigneePageSize: $assigneePageSize, includeReactions: $includeReactions)
      }
      ... on PullRequest {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...PullRequestItemMetadata @arguments(assigneePageSize: $assigneePageSize, includeReactions: $includeReactions)
      }
    }
  }
`

interface Props {
  issueKey: IssueRow$key
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
  // this is passed as an object and it comes from the app payload
  scopedRepository?: {id: string; name: string; owner: string; is_archived: boolean}
  /**
   * Href getter for the metadata badge links
   * @param type - metadata type
   * @param name - name of the metadata
   * @returns URL to the metadata
   */
  getMetadataHref: (type: keyof typeof QUERY_FIELDS, name: string) => string
  onSelect?: (selected: boolean) => void
  onNavigate: (to: To, options?: NavigateOptions) => void
  onSelectRow: (payload?: {[key: string]: unknown} | AnalyticsEvent | undefined) => void
  isActive: boolean
  isSelected?: boolean
  reactionEmojiToDisplay?: {reaction: string; reactionEmoji: string}
  sortingItemSelected: string
}

const IssueRowInternal = forwardRef(
  (
    {
      isActive,
      isSelected,
      issueKey,
      scopedRepository,
      getMetadataHref,
      onSelect,
      onNavigate,
      onSelectRow,
      reactionEmojiToDisplay,
      sortingItemSelected,
      metadataRef,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLAnchorElement>,
  ): ReactElement => {
    const {graphql_subscriptions, issues_react_prefetch} = useFeatureFlags()

    const data = useFragment(
      graphql`
        fragment IssueRow on Issue
        @argumentDefinitions(labelPageSize: {type: "Int!"}, fetchRepository: {type: "Boolean!"}) {
          ...IssueItem @arguments(labelPageSize: $labelPageSize)
          number
          repository @include(if: $fetchRepository) {
            name
            owner {
              login
            }
          }
        }
      `,
      issueKey,
    )
    const issueItemKey = data as IssueItem$key
    const issueItemData = useFragment(IssueItemQuery, issueItemKey)

    if (graphql_subscriptions) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useIssueRowSubscription(issueItemData.id)
    }

    // This is a fallback in case the repository is not passed
    const repositoryOwner = scopedRepository ? scopedRepository.owner : data.repository?.owner.login || ''
    const repositoryName = scopedRepository ? scopedRepository.name : data.repository?.name || ''

    const showTimeStamp = useMemo(
      () =>
        [
          LABELS.Newest,
          LABELS.Oldest,
          LABELS.RecentlyUpdated,
          LABELS.mostCommented,
          LABELS.thumbsUp,
          LABELS.thumbsDown,
          LABELS.rocket,
          LABELS.hooray,
          LABELS.eyes,
          LABELS.heart,
        ].indexOf(sortingItemSelected) >= 0,
      [sortingItemSelected],
    )

    const url = issueUrl({owner: repositoryOwner, repo: repositoryName, number: data.number})

    const handleNavigation = useCallback(
      (event: React.MouseEvent | React.KeyboardEvent) => {
        onSelectRow({type: issueItemData.__typename})

        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (event.ctrlKey || event.metaKey) return
        event.stopPropagation()
        event.preventDefault()
        onNavigate(url)
      },
      [issueItemData.__typename, onNavigate, onSelectRow, url],
    )

    const environment = useRelayEnvironment()
    const onFocus = useCallback(() => {
      if (issues_react_prefetch) {
        prefetchIssueDebounced(environment, repositoryOwner, repositoryName, data.number)
      }
    }, [issues_react_prefetch, environment, repositoryOwner, repositoryName, data.number])

    return (
      <IssueItem
        isActive={isActive}
        itemKey={issueItemKey}
        metadataRef={metadataRef}
        isSelected={isSelected}
        reactionEmojiToDisplay={reactionEmojiToDisplay}
        showCommentCount={true}
        showTimeStamp={showTimeStamp}
        showRepository={!scopedRepository}
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        showAssignees={true}
        showLeadingRightSideContent={false}
        sortingItemSelected={sortingItemSelected}
        getMetadataHref={getMetadataHref}
        onSelect={onSelect}
        onFocus={onFocus}
        onClick={handleNavigation}
        href={url}
        ref={ref}
        {...props}
      />
    )
  },
)

IssueRowInternal.displayName = 'IssueRowInternal'

export const IssueRow = React.memo(IssueRowInternal)
