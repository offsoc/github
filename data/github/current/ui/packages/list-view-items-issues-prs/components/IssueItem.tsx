import {noop} from '@github-ui/noop'
import {graphql, useFragment, type PreloadedQuery} from 'react-relay'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItem} from '@github-ui/list-view/ListItem'

import type {IssueItem$key} from './__generated__/IssueItem.graphql'
import {LazyIssueItemMetadata, type IssueItemMetadataProps} from './IssueItemMetadata'
import {IssueTypeIndicator} from './IssueTypeIndicator'
import {IssuePullRequestDescription} from './IssuePullRequestDescription'
import {LazyIssuePullRequestStateIcon} from './IssuePullRequestStateIcon'
import {IssuePullRequestTitle} from './IssuePullRequestTitle'
import {QUERY_FIELDS} from '../constants/queries'
import type {CommonItemProps} from '../constants/types'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'
import styles from './issue-item.module.css'

// This component represents a single 'basic' issue displayed in the list
// It styles a given issue using the ListItem component

export const IssueItemQuery = graphql`
  fragment IssueItem on Issue @argumentDefinitions(labelPageSize: {type: "Int!", defaultValue: 10}) {
    id
    __typename
    title
    titleHtml: titleHTML # alias resolves a type conflict with Issue and IssuePullRequestTitle titleHTML
    ...IssuePullRequestTitle @arguments(labelPageSize: $labelPageSize)
    ...IssuePullRequestDescription
    ...IssuePullRequestStateIcon
    ...IssueTypeIndicator
  }
`

type IssueItemProps = {
  itemKey: IssueItem$key
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
  showLeadingRightSideContent?: boolean
  showTimeStamp?: boolean
  showRepository?: boolean
  sortingItemSelected?: string
  includeReactions?: boolean
  isActive?: boolean
  onFocus?: () => void
  repositoryOwner: string
  repositoryName: string
} & Omit<IssueItemMetadataProps, 'itemKey'> &
  CommonItemProps

export const IssueItem = ({
  itemKey,
  metadataRef,
  isSelected,
  isActive = false,
  showCommentCount,
  showCommentZeroCount,
  showAssignees = true,
  showTimeStamp: showTimestamp = true,
  showRepository = true,
  onSelect = noop,
  onFocus = noop,
  onClick = noop,
  getMetadataHref,
  reactionEmojiToDisplay,
  sortingItemSelected,
  ref,
  href,
  repositoryOwner,
  repositoryName,
}: IssueItemProps) => {
  const data = useFragment(IssueItemQuery, itemKey)

  const titleValue = data && (data.titleHtml || data.title)

  const title = (
    <IssuePullRequestTitle
      value={titleValue}
      dataKey={data}
      repositoryOwner={repositoryOwner}
      repositoryName={repositoryName}
      ref={ref}
      href={href}
      onClick={onClick}
      getLabelHref={label => getMetadataHref(QUERY_FIELDS.label, label)}
    />
  )
  const description = (
    <IssuePullRequestDescription
      repositoryOwner={repositoryOwner}
      repositoryName={repositoryName}
      dataKey={data}
      showRepository={showRepository}
      showTimestamp={showTimestamp}
      sortingItemSelected={sortingItemSelected}
      getAuthorHref={(login: string) => getMetadataHref('author', login)}
    />
  )

  const lazyMetadata = (
    <LazyIssueItemMetadata
      issueId={data.id}
      metadataRef={metadataRef}
      getMetadataHref={getMetadataHref}
      showAssignees={showAssignees}
      reactionEmojiToDisplay={reactionEmojiToDisplay}
      showCommentCount={showCommentCount}
      showCommentZeroCount={showCommentZeroCount}
      showLinkedPullRequests
    />
  )

  return (
    <ListItem
      key={data.id}
      title={title}
      isSelected={isSelected}
      isActive={isActive}
      onSelect={onSelect}
      onFocus={onFocus}
      metadata={lazyMetadata}
      metadataContainerSx={{flexWrap: ['wrap', 'unset']}}
    >
      <ListItemLeadingContent className={styles.leadingContent}>
        <LazyIssuePullRequestStateIcon dataKey={data} metadataRef={metadataRef} issueId={data.id} />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <ListItemDescription>
          <IssueTypeIndicator dataKey={data} getIssueTypeHref={(name: string) => getMetadataHref('type', name)} />
          {description}
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
IssueItem.nodeType = 'issue'
