import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {useListViewVariant} from '@github-ui/list-view/ListViewVariantContext'
import {CommentIcon} from '@primer/octicons-react'
import {graphql, useFragment, usePreloadedQuery, type PreloadedQuery} from 'react-relay'

import {Assignees} from './assignees/Assignees'
import type {PullRequestItemMetadata$key} from './__generated__/PullRequestItemMetadata.graphql'
import {QUERY_FIELDS} from '../constants/queries'
import {Reactions} from './Reactions'
import {TEST_IDS} from '../constants/test-ids'
import {LoadingMetadata} from './IssueItemMetadata'
import type {IssueRowSecondaryQuery} from './__generated__/IssueRowSecondaryQuery.graphql'
import {Suspense} from 'react'
import {IssuesIndexSecondaryGraphqlQuery} from './IssueRow'

export type PullRequestItemMetadataProps = {
  itemKey: PullRequestItemMetadata$key
  showAssignees?: boolean
  showCommentCount?: boolean
  showCommentZeroCount?: boolean
  /**
   * Href getter for the metadata badge links
   * @param type - metadata type
   * @param name - name of the metadata
   * @returns URL to the metadata
   */
  getMetadataHref: (type: keyof typeof QUERY_FIELDS, metadataName: string) => string
  reactionEmojiToDisplay?: {reaction: string; reactionEmoji: string}
}

export type LazyPullItemMetadataProps = Omit<PullRequestItemMetadataProps, 'itemKey'> & {
  pullId: string
  metadataRef?: PreloadedQuery<IssueRowSecondaryQuery> | null
}

const PullRequestItemMetadataQuery = graphql`
  fragment PullRequestItemMetadata on PullRequest
  @argumentDefinitions(
    assigneePageSize: {type: "Int!", defaultValue: 10}
    includeReactions: {type: "Boolean!", defaultValue: false}
  ) {
    totalCommentsCount
    # Used to check if reactions were loaded
    reactionGroups @include(if: $includeReactions) {
      __typename
    }
    ... on Reactable @include(if: $includeReactions) {
      ...Reactions @include(if: $includeReactions)
    }
    ...Assignees @arguments(assigneePageSize: $assigneePageSize)
  }
`
export const LazyPullRequestItemMetadata = ({metadataRef, ...props}: LazyPullItemMetadataProps) => {
  // We need this to render the loading state in ssr
  if (!metadataRef) return <LoadingMetadata {...props} />

  return (
    <Suspense fallback={<LoadingMetadata {...props} />}>
      <LazyPullMetadataFetched {...props} metadataRef={metadataRef} />
    </Suspense>
  )
}

function LazyPullMetadataFetched({
  pullId,
  metadataRef,
  ...props
}: Omit<LazyPullItemMetadataProps, 'metadataRef'> & {metadataRef: PreloadedQuery<IssueRowSecondaryQuery>}) {
  const {nodes} = usePreloadedQuery<IssueRowSecondaryQuery>(IssuesIndexSecondaryGraphqlQuery, metadataRef)
  const pullNode = nodes?.find(node => node?.id === pullId)

  if (!pullNode) return null

  return <PullRequestItemMetadata itemKey={pullNode} {...props} />
}

const PullRequestItemMetadata = ({
  itemKey,
  getMetadataHref,
  reactionEmojiToDisplay,
  showAssignees = true,
  showCommentCount = true,
  showCommentZeroCount = false,
}: PullRequestItemMetadataProps) => {
  const {variant} = useListViewVariant()
  const data = useFragment(PullRequestItemMetadataQuery, itemKey)

  const commentAriaLabel =
    data?.totalCommentsCount && data.totalCommentsCount > 0
      ? ` ${data.totalCommentsCount} comment${data.totalCommentsCount > 1 ? 's' : ''};`
      : ''
  const showReactions = !!reactionEmojiToDisplay?.reaction
  const showCommentCountMetadata =
    (showCommentCount && !!data.totalCommentsCount) || (showCommentCount && showCommentZeroCount)

  return (
    <>
      <ListItemMetadata
        sx={{width: ['auto', '45px']}}
        aria-label={commentAriaLabel}
        data-testid={TEST_IDS.listRowComments}
      >
        {showCommentCountMetadata && (
          <>
            <CommentIcon size={16} /> {data.totalCommentsCount ? data.totalCommentsCount : 0}
          </>
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

      <ListItemMetadata alignment="right" sx={{width: ['auto', '45px']}}>
        {showAssignees && data && (
          <Assignees
            assigneeskey={data}
            getAssigneeHref={assignee => getMetadataHref(QUERY_FIELDS.assignee, assignee)}
          />
        )}
      </ListItemMetadata>
    </>
  )
}
