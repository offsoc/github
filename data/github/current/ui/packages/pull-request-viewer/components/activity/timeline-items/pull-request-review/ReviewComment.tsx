import {ReviewThreadComment} from '@github-ui/conversations'
import {useNavigate} from '@github-ui/use-navigate'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {Box} from '@primer/react'
import {graphql, readInlineData, useFragment} from 'react-relay'

import {usePullRequestContext} from '../../../../contexts/PullRequestContext'
import type {useFetchThread_PullRequestReviewComment$key} from '../../../../hooks/__generated__/useFetchThread_PullRequestReviewComment.graphql'
import {PullRequestCommentFragment} from '../../../../hooks/use-fetch-thread'
import {usePullRequestCommenting} from '../../../../hooks/use-pull-request-commenting'
import usePullRequestPageAppPayload from '../../../../hooks/use-pull-request-page-app-payload'
import type {ReviewComment_pullRequestReviewComment$key} from './__generated__/ReviewComment_pullRequestReviewComment.graphql'
import {ConversationHeader} from './ConversationHeader'

const reviewCommentCollapsedStateStorageKey = (id: string) =>
  `timeline-pull-request-review-comment-collapsed-state-${id}`

type ReviewCommentProps = {
  comment: ReviewComment_pullRequestReviewComment$key
}

export function ReviewComment({comment}: ReviewCommentProps) {
  const data = useFragment(
    graphql`
      fragment ReviewComment_pullRequestReviewComment on PullRequestReviewComment {
        id
        currentDiffResourcePath
        path
        pullRequestThread {
          id
          isOutdated
          isResolved
        }
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...ReactionViewerGroups
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...useFetchThread_PullRequestReviewComment
      }
    `,
    comment,
  )

  const {pullRequestId, repositoryId} = usePullRequestContext()
  const {ghostUser} = usePullRequestPageAppPayload()
  const navigate = useNavigate()

  const [isCollapsed, setIsCollapsed] = useLocalStorage(reviewCommentCollapsedStateStorageKey(data.id), false)
  const commentingImplementation = usePullRequestCommenting()

  // eslint-disable-next-line no-restricted-syntax
  const commentData = readInlineData<useFetchThread_PullRequestReviewComment$key>(PullRequestCommentFragment, data)

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'shadow.small',
      }}
    >
      <ConversationHeader
        isCollapsed={isCollapsed}
        isOutdated={!!data.pullRequestThread?.isOutdated}
        isResolved={!!data.pullRequestThread?.isResolved}
        path={data.path}
        onNavigateToDiffThread={() => data.currentDiffResourcePath && navigate(data.currentDiffResourcePath)}
        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />
      {!isCollapsed && (
        <div>
          <ReviewThreadComment
            isAnchorable
            anchorPrefix="discussion_r"
            comment={commentData}
            commentingImplementation={commentingImplementation}
            filePath={data.path}
            ghostUser={ghostUser}
            index={0}
            isThreadResolved={!!data.pullRequestThread?.isResolved}
            repositoryId={repositoryId}
            subjectId={pullRequestId}
            threadId={data.pullRequestThread?.id ?? ''}
          />
        </div>
      )}
    </Box>
  )
}
