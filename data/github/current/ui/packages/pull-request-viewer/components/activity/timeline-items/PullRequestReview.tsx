import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import type {HighlightedEvent} from '@github-ui/timeline-items/HighlightedEvent'
import {TimelineRowBorder} from '@github-ui/timeline-items/TimelineRowBorder'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {ChevronDownIcon, ChevronRightIcon, CommentDiscussionIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'
import type {RefObject} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {
  PullRequestReview_pullRequestReview$data,
  PullRequestReview_pullRequestReview$key,
} from './__generated__/PullRequestReview_pullRequestReview.graphql'
import type {Thread_viewer$key} from './pull-request-review/__generated__/Thread_viewer.graphql'
import {PullRequestReviewHeaderAndComment} from './pull-request-review/PullRequestReviewHeaderAndComment'
import {ReviewComment} from './pull-request-review/ReviewComment'
import {Thread} from './pull-request-review/Thread'

function reviewCommentCount(
  threadsAndReplies: PullRequestReview_pullRequestReview$data['pullRequestThreadsAndReplies'],
) {
  if (!threadsAndReplies?.edges) return 0

  let count = 0
  for (const edge of threadsAndReplies.edges) {
    const item = edge?.node
    switch (item?.__typename) {
      case 'PullRequestThread':
        count += item.comments.totalCount
        break
      case 'PullRequestReviewComment':
        count += 1
        break
    }
  }

  return count
}

const reviewCollapsedStateStorageKey = (id: string) => `timeline-pull-request-review-collapsed-state-${id}`

export type PullRequestReviewProps = {
  addDivider?: boolean
  anchorBaseUrl?: string
  queryRef: PullRequestReview_pullRequestReview$key
  onLinkClick?: (event: MouseEvent) => void
  onChange?: () => void
  onEditCancel?: () => void
  onReply?: (quotedComment: string) => void
  onSave?: () => void
  commentBoxConfig?: CommentBoxConfig
  refAttribute?: RefObject<HTMLDivElement>
  highlightedCommentId?: string
  navigate: (url: string) => void
  highlightedEvent?: HighlightedEvent
  viewer: Thread_viewer$key
}

export function PullRequestReview({addDivider, queryRef, highlightedEvent, viewer, ...props}: PullRequestReviewProps) {
  const data = useFragment(
    graphql`
      fragment PullRequestReview_pullRequestReview on PullRequestReview {
        ...PullRequestReviewHeaderAndComment_pullRequestReview
        # eslint-disable-next-line relay/unused-fields
        __id
        databaseId
        bodyText
        id
        pullRequestThreadsAndReplies(first: 100) @connection(key: "PullRequestReview_pullRequestThreadsAndReplies") {
          edges {
            node {
              __typename
              ... on PullRequestThread {
                id
                ...Thread_pullRequestThread
                comments(first: 50) {
                  totalCount
                }
              }
              ... on PullRequestReviewComment {
                id
                ...ReviewComment_pullRequestReviewComment
              }
            }
          }
        }
      }
    `,
    queryRef,
  )

  const [isCollapsed, setIsCollapsed] = useLocalStorage(reviewCollapsedStateStorageKey(data.id), false)

  const reviewCommentItemsCount = reviewCommentCount(data.pullRequestThreadsAndReplies)
  const threadCount = data.pullRequestThreadsAndReplies?.edges?.length ?? 0
  const hasReviewComments = !!reviewCommentItemsCount
  const isHighlighted =
    'pullrequestreview' === highlightedEvent?.prefix && highlightedEvent?.id === String(data.databaseId)

  const hasBodyText = !!data.bodyText
  const isReviewWithoutContents = !hasBodyText && !hasReviewComments

  return (
    <TimelineRowBorder
      addDivider={!!addDivider && !isReviewWithoutContents}
      isHighlighted={isHighlighted}
      isMajor={!isReviewWithoutContents}
      item={data}
      sx={{pb: 0}}
    >
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <PullRequestReviewHeaderAndComment isMajor={!isReviewWithoutContents} review={data} {...props} />
        {hasReviewComments && (
          <Box
            sx={{
              borderTop: hasBodyText ? '1px solid' : 'none',
              pt: hasBodyText ? 2 : 0,
              borderTopColor: 'border.subtle',
              backgroundColor: 'canvas.default',
              pb: 2,
              borderBottomRightRadius: 2,
              borderBottomLeftRadius: 2,
            }}
          >
            {threadCount > 1 && (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  pt: hasBodyText ? 0 : 2,
                  px: 2,
                }}
              >
                <Button
                  leadingVisual={CommentDiscussionIcon}
                  size="small"
                  sx={{color: 'fg.muted'}}
                  trailingVisual={isCollapsed ? ChevronRightIcon : ChevronDownIcon}
                  variant="invisible"
                  aria-label={`${
                    isCollapsed ? 'Expand' : 'Collapse'
                  } ${reviewCommentItemsCount} review comments in ${threadCount} threads`}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <Text sx={{color: 'fg.default'}}>{reviewCommentItemsCount}</Text> comments in{' '}
                  <Text sx={{color: 'fg.default'}}>{threadCount}</Text> threads
                </Button>
              </Box>
            )}
            {!isCollapsed && (
              <Box
                sx={{
                  p: 3,
                  py: 2,
                  pt: threadCount > 1 ? 2 : 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  flexShrink: 1,
                  position: 'relative',
                }}
              >
                {data.pullRequestThreadsAndReplies?.edges?.map(edge => {
                  const item = edge?.node
                  if (!item) return null

                  switch (item.__typename) {
                    case 'PullRequestReviewComment':
                      return <ReviewComment key={item.id} comment={item} />
                    case 'PullRequestThread':
                      return <Thread key={item.id} thread={item} viewer={viewer} />
                    default:
                      return null
                  }
                })}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </TimelineRowBorder>
  )
}
