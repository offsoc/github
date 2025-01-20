import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {useListViewVariant} from '@github-ui/list-view/ListViewVariantContext'
import {CommentIcon} from '@primer/octicons-react'
import {graphql, useFragment, usePreloadedQuery, type PreloadedQuery} from 'react-relay'

import {Assignees} from './assignees/Assignees'
import {ClosedByPullRequestsReferences} from './closed_by_pull_requests_references/ClosedByPullRequestsReferences'
import type {IssueItemMetadata$key} from './__generated__/IssueItemMetadata.graphql'
import {QUERY_FIELDS} from '../constants/queries'
import {Reactions} from './Reactions'
import {TEST_IDS} from '../constants/test-ids'
import styles from './issue-item.module.css'
import {Suspense} from 'react'
import {IssuesIndexSecondaryGraphqlQuery} from './IssueRow'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export type IssueItemMetadataProps = {
  itemKey: IssueItemMetadata$key
  showAssignees?: boolean
  showCommentCount?: boolean
  showCommentZeroCount?: boolean
  showLinkedPullRequests?: boolean
  /**
   * Href getter for the metadata badge links
   * @param type - metadata type
   * @param name - name of the metadata
   * @returns URL to the metadata
   */
  getMetadataHref: (type: keyof typeof QUERY_FIELDS, name: string) => string
  reactionEmojiToDisplay?: {reaction: string; reactionEmoji: string}
}

export type LazyIssueItemMetadataProps = Omit<IssueItemMetadataProps, 'itemKey'> & {
  issueId: string
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
}

const IssueItemMetadataQuery = graphql`
  fragment IssueItemMetadata on Issue
  @argumentDefinitions(
    assigneePageSize: {type: "Int!", defaultValue: 10}
    includeReactions: {type: "Boolean!", defaultValue: false}
  ) {
    id
    # Used to check if reactions were loaded
    reactionGroups @include(if: $includeReactions) {
      __typename
    }
    ... on Reactable @include(if: $includeReactions) {
      ...Reactions @include(if: $includeReactions)
    }
    totalCommentsCount
    ...Assignees @arguments(assigneePageSize: $assigneePageSize)
    ...ClosedByPullRequestsReferences
  }
`

export function LazyIssueItemMetadata({metadataRef, ...props}: LazyIssueItemMetadataProps) {
  // We need this to render the loading state in ssr
  if (!metadataRef) return <LoadingMetadata {...props} />

  return (
    <Suspense fallback={<LoadingMetadata {...props} />}>
      <LazyIssueMetadataFetched {...props} metadataRef={metadataRef} />
    </Suspense>
  )
}

export function LoadingMetadata({
  showAssignees,
  showCommentCount = true,
  reactionEmojiToDisplay,
  showLinkedPullRequests = false,
}: Partial<Omit<IssueItemMetadataProps, 'itemKey'>>) {
  const showReactions = !!reactionEmojiToDisplay?.reaction
  return (
    <>
      {showLinkedPullRequests && (
        <ListItemMetadata sx={{width: ['auto', '45px']}} data-testid={TEST_IDS.listRowLinkedPullRequests}>
          <LoadingSkeleton variant="pill" width="xl" />
        </ListItemMetadata>
      )}
      <ListItemMetadata sx={{width: ['auto', '45px']}} data-testid={TEST_IDS.listRowComments}>
        {showCommentCount && <LoadingSkeleton variant="pill" width="xl" />}
      </ListItemMetadata>
      {showReactions && (
        <ListItemMetadata sx={{width: ['auto', '45px']}}>
          <LoadingSkeleton variant="pill" width="xl" />
        </ListItemMetadata>
      )}
      {showAssignees && (
        <ListItemMetadata sx={{width: ['auto', '45px']}} data-testid={TEST_IDS.listRowAssignees} alignment="right">
          <LoadingSkeleton variant="pill" width="lg" />
        </ListItemMetadata>
      )}
    </>
  )
}

function LazyIssueMetadataFetched({
  issueId,
  metadataRef,
  ...props
}: Omit<LazyIssueItemMetadataProps, 'metadataRef'> & {metadataRef: PreloadedQuery<IssueRowSecondaryQuery>}) {
  const {nodes} = usePreloadedQuery<IssueRowSecondaryQuery>(IssuesIndexSecondaryGraphqlQuery, metadataRef)
  const issueNode = nodes?.find(node => node?.id === issueId)

  if (!issueNode) return null

  return <IssueItemMetadata itemKey={issueNode} {...props} />
}

export const IssueItemMetadata = ({
  itemKey,
  getMetadataHref,
  reactionEmojiToDisplay,
  showAssignees,
  showCommentCount = true,
  showCommentZeroCount = false,
  showLinkedPullRequests = false,
}: IssueItemMetadataProps) => {
  const {variant} = useListViewVariant()
  const data = useFragment(IssueItemMetadataQuery, itemKey)
  const showReactions = !!reactionEmojiToDisplay?.reaction

  if (data.totalCommentsCount === undefined) {
    return (
      <LoadingMetadata
        reactionEmojiToDisplay={reactionEmojiToDisplay}
        showCommentCount
        showLinkedPullRequests
        showAssignees
      />
    )
  }

  const commentAriaLabel =
    data?.totalCommentsCount && data.totalCommentsCount > 0
      ? ` ${data.totalCommentsCount} comment${data.totalCommentsCount > 1 ? 's' : ''};`
      : ''
  const showCommentCountMetadata = showCommentCount || showCommentZeroCount
  const commentCount = showCommentCountMetadata && data.totalCommentsCount ? data.totalCommentsCount : 0

  return (
    <>
      {data && showLinkedPullRequests && (
        <ListItemMetadata sx={{width: ['auto', '45px']}} data-testid={TEST_IDS.listRowLinkedPullRequests}>
          <ClosedByPullRequestsReferences issueId={data.id} closedByPullRequestsReferencesKey={data} />
        </ListItemMetadata>
      )}
      <ListItemMetadata
        sx={{width: ['auto', '45px']}}
        aria-label={commentAriaLabel}
        data-testid={TEST_IDS.listRowComments}
      >
        {showCommentCountMetadata && (
          <div className={styles.commentCountContainer}>
            <CommentIcon size={16} /> <span className="ml-1">{commentCount}</span>
            <span className="sr-only">{commentCount === 1 ? ' comment' : ' comments'}</span>
          </div>
        )}
      </ListItemMetadata>
      {showReactions && (
        <ListItemMetadata sx={{width: ['auto', '45px']}}>
          {data.reactionGroups && (
            <Reactions
              dataKey={data}
              reactionEmojiToDisplay={reactionEmojiToDisplay}
              showCompactDensity={variant === 'compact'}
            />
          )}
        </ListItemMetadata>
      )}
      {showAssignees && data && (
        <ListItemMetadata sx={{width: ['auto', '45px']}} data-testid={TEST_IDS.listRowAssignees} alignment="right">
          <Assignees
            assigneeskey={data}
            getAssigneeHref={assignee => getMetadataHref(QUERY_FIELDS.assignee, assignee)}
          />
        </ListItemMetadata>
      )}
    </>
  )
}
