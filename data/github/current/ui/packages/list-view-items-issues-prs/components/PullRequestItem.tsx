import {ChecksStatusBadge} from '@github-ui/commit-checks-status'
import type {VariantType} from '@github-ui/list-view/ListViewVariantContext'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItem} from '@github-ui/list-view/ListItem'
import {noop} from '@github-ui/noop'
import {Box} from '@primer/react'
import {graphql, useFragment, type PreloadedQuery} from 'react-relay'

import type {PullRequestItem$data, PullRequestItem$key} from './__generated__/PullRequestItem.graphql'
import {LazyPullRequestItemMetadata, type PullRequestItemMetadataProps} from './PullRequestItemMetadata'
import {IssuePullRequestDescription} from './IssuePullRequestDescription'
import {IssuePullRequestStateIcon} from './IssuePullRequestStateIcon'
import {IssuePullRequestTitle} from './IssuePullRequestTitle'
import {QUERY_FIELDS} from '../constants/queries'
import type {CommonItemProps} from '../constants/types'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'

// This component represents a single 'basic' pull request displayed in the list
// It styles a given pull request using the ListItem component

export const PullRequestItemQuery = graphql`
  fragment PullRequestItem on PullRequest @argumentDefinitions(labelPageSize: {type: "Int!", defaultValue: 10}) {
    id
    __typename
    headCommit {
      commit {
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
    repository {
      name
      owner {
        login
      }
    }
    title
    titleHTML
    ...IssuePullRequestTitle @arguments(labelPageSize: $labelPageSize)
    ...IssuePullRequestDescription
    ...IssuePullRequestStateIcon
  }
`

export type PullRequestItemProps = {
  itemKey: PullRequestItem$key
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
  showAuthorAvatar?: boolean
  showLeadingRightSideContent?: boolean
  showTimestamp?: boolean
  showRepository?: boolean
  sortingItemSelected?: string
  includeReactions?: boolean
} & Omit<PullRequestItemMetadataProps, 'itemKey'>

export const PullRequestItem = ({
  itemKey,
  metadataRef,
  isActive = false,
  isSelected,
  ref,
  href,
  showAuthorAvatar = false,
  showCommentCount,
  showCommentZeroCount,
  showAssignees,
  showTimestamp = true,
  showRepository = true,
  onSelect = noop,
  onClick = noop,
  getMetadataHref,
  reactionEmojiToDisplay,
  sortingItemSelected,
}: PullRequestItemProps & CommonItemProps) => {
  const data = useFragment(PullRequestItemQuery, itemKey)
  const titleValue = data && (data.titleHTML || data.title)

  const title = (
    <IssuePullRequestTitle
      value={titleValue}
      dataKey={data}
      href={href}
      ref={ref}
      repositoryOwner={data.repository.owner.login}
      repositoryName={data.repository.name}
      onClick={onClick}
      getLabelHref={label => getMetadataHref(QUERY_FIELDS.label, label)}
    />
  )
  const description = (
    <IssuePullRequestDescription
      repositoryOwner={data.repository.owner.login}
      repositoryName={data.repository.name}
      statusCheckRollup={data?.headCommit?.commit.statusCheckRollup}
      showAuthorAvatar={showAuthorAvatar}
      dataKey={data}
      showRepository={showRepository}
      showTimestamp={showTimestamp}
      sortingItemSelected={sortingItemSelected}
      getAuthorHref={(login: string) => getMetadataHref('author', login)}
    />
  )

  const lazyMetadata = (
    <LazyPullRequestItemMetadata
      pullId={data.id}
      metadataRef={metadataRef}
      getMetadataHref={getMetadataHref}
      reactionEmojiToDisplay={reactionEmojiToDisplay}
      showAssignees={showAssignees}
      showCommentCount={showCommentCount}
      showCommentZeroCount={showCommentZeroCount}
    />
  )
  return (
    <ListItem
      key={data.id}
      title={title}
      isActive={isActive}
      isSelected={isSelected}
      onSelect={onSelect}
      metadata={lazyMetadata}
      metadataContainerSx={{flexWrap: ['wrap', 'unset']}}
    >
      <ListItemLeadingContent>
        <IssuePullRequestStateIcon dataKey={data} />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <ListItemDescription>{description}</ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}

PullRequestItem.nodeType = 'pullRequest'

export function CheckRunStatus({
  statusCheckRollup,
  variant,
}: {
  statusCheckRollup: NonNullable<PullRequestItem$data['headCommit']>['commit']['statusCheckRollup']
  variant?: VariantType
}) {
  if (!statusCheckRollup) return null
  const checkRunTotalCount = statusCheckRollup.contexts?.checkRunCount
  const checkRunSuccessCount = statusCheckRollup.contexts?.checkRunCountsByState?.find(
    runCountByState => runCountByState.state === 'SUCCESS',
  )?.count
  const checkRunText = `${checkRunSuccessCount}/${checkRunTotalCount}`
  const statusRollup = statusCheckRollup.state.toLowerCase() || ''
  return (
    <Box as="span" sx={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', gap: 1, ml: 1}}>
      {' '}
      &middot; <ChecksStatusBadge disablePopover={true} statusRollup={statusRollup} />
      <span>{variant === 'default' && checkRunText}</span>
    </Box>
  )
}
