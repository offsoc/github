import {ReviewThreadComment, StaticUnifiedDiffPreview} from '@github-ui/conversations'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {ChevronRightIcon} from '@primer/octicons-react'
import {AvatarStack, Box, Button, type SxProp} from '@primer/react'
import {memo, useCallback} from 'react'
import {graphql, readInlineData, useFragment} from 'react-relay'

import {usePullRequestContext} from '../../contexts/PullRequestContext'
import type {useFetchThread_PullRequestReviewComment$key} from '../../hooks/__generated__/useFetchThread_PullRequestReviewComment.graphql'
import {makeThread, PullRequestCommentFragment} from '../../hooks/use-fetch-thread'
import {usePullRequestCommenting} from '../../hooks/use-pull-request-commenting'
import usePullRequestPageAppPayload from '../../hooks/use-pull-request-page-app-payload'
import {ThreadHeader} from '../activity/timeline-items/pull-request-review/ThreadHeader'
import type {
  ThreadPreview_pullRequestThread$data,
  ThreadPreview_pullRequestThread$key,
} from './__generated__/ThreadPreview_pullRequestThread.graphql'
import type {ThreadPreview_viewer$key} from './__generated__/ThreadPreview_viewer.graphql'

function panelThreadCollapsedStateStorageKey(id: string) {
  return `panel-thread-collapsed-state-${id}`
}

function extractCommentAuthors(threadData: ThreadPreview_pullRequestThread$data): Author[] {
  const uniqueAuthors = new Set<string>()
  const extractedAuthors = threadData.threadPreviewComments.edges?.slice(1).reduce((authors, commentData) => {
    if (commentData?.node?.author && !uniqueAuthors.has(commentData.node.author.login)) {
      authors.push({
        avatarUrl: commentData.node.author.avatarUrl,
        login: commentData.node.author.login,
      })
      uniqueAuthors.add(commentData.node.author.login)
    }

    return authors
  }, [] as Author[])

  return extractedAuthors ?? []
}

interface Author {
  avatarUrl: string
  login: string
}

function Authors({authors}: {authors: Author[]}) {
  if (authors.length < 1) return null

  return (
    <AvatarStack>
      {authors.map(({login, avatarUrl}) => (
        <GitHubAvatar key={login} alt={login} size={18} src={avatarUrl} />
      ))}
    </AvatarStack>
  )
}

type ThreadPreviewProps = {
  onNavigateToDiffThread: (threadId: string) => void
  thread: ThreadPreview_pullRequestThread$key
  viewer: ThreadPreview_viewer$key
} & SxProp

/**
 * Renders a preview of a thread in a pull request.
 * It displays the thread's header, the difflines that the
 * thread is associated with, and the first comment of the thread.
 */
export const ThreadPreview = memo(function ThreadPreview({
  onNavigateToDiffThread,
  sx,
  thread,
  viewer,
}: ThreadPreviewProps) {
  const threadData = useFragment(
    graphql`
      fragment ThreadPreview_pullRequestThread on PullRequestThread {
        ...ThreadHeader_pullRequestThread
        id
        isOutdated
        isResolved
        path
        # eslint-disable-next-line relay/unused-fields
        subject {
          ... on PullRequestDiffThread {
            originalStartLine
            originalEndLine
            startDiffSide
            endDiffSide
            diffLines(maxContextLines: 3) {
              __id
              left
              right
              html
              text
              type
            }
          }
        }
        threadPreviewComments: comments(first: 50) {
          edges {
            node {
              author {
                login
                avatarUrl
              }
            }
          }
        }
        firstComment: comments(first: 1) {
          edges {
            node {
              id
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...useFetchThread_PullRequestReviewComment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...MarkdownEditHistoryViewer_comment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...ReactionViewerGroups
              # eslint-disable-next-line relay/unused-fields
              repository {
                isPrivate
              }
              # eslint-disable-next-line relay/unused-fields
              reference: pullRequest {
                number
              }
            }
          }
        }
      }
    `,
    thread,
  )

  const viewerData = useFragment(
    graphql`
      fragment ThreadPreview_viewer on User {
        pullRequestUserPreferences {
          tabSize
        }
      }
    `,
    viewer,
  )

  // eslint-disable-next-line no-restricted-syntax
  const firstComment = readInlineData<useFetchThread_PullRequestReviewComment$key>(
    PullRequestCommentFragment,
    threadData.firstComment?.edges?.[0]?.node ?? null,
  )

  const threadId = threadData.id
  const isOutdated = threadData.isOutdated
  const commentId = firstComment?.id
  const filePath = threadData.path

  const navigateToThread = useCallback(() => {
    onNavigateToDiffThread(threadId)
  }, [onNavigateToDiffThread, threadId])

  const commentingImplementation = usePullRequestCommenting()
  const {ghostUser} = usePullRequestPageAppPayload()
  const {pullRequestId, repositoryId} = usePullRequestContext()
  const [isCollapsed, setIsCollapsed] = useLocalStorage(panelThreadCollapsedStateStorageKey(threadId), false)

  const authors = extractCommentAuthors(threadData)
  const authorsCount = authors.length
  const repliesText = authorsCount === 0 ? 'No replies' : `${authorsCount} ${authorsCount === 1 ? 'reply' : 'replies'}`
  const threads = makeThread(threadData)

  if (!commentingImplementation || !firstComment || !threads) return null

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <ThreadHeader
        isCollapsed={isCollapsed}
        thread={threadData}
        onNavigateToDiffThread={navigateToThread}
        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />
      {!isCollapsed && (
        <>
          <Box sx={{overflowX: 'auto', borderBottom: '1px solid', borderBottomColor: 'border.muted'}}>
            <StaticUnifiedDiffPreview
              diffTableSx={{borderStyle: 'none'}}
              hideHeaderDetails={true}
              sx={{m: 0, borderStyle: 'none'}}
              tabSize={viewerData.pullRequestUserPreferences.tabSize || 4}
              thread={threads}
            />
          </Box>
          <div>
            <ReviewThreadComment
              key={commentId}
              hideActions
              comment={firstComment}
              commentingImplementation={commentingImplementation}
              filePath={filePath}
              ghostUser={ghostUser}
              index={0}
              isAnchorable={false}
              isOutdated={isOutdated}
              isThreadResolved={threadData.isResolved}
              repositoryId={repositoryId}
              subjectId={pullRequestId}
              threadId={threadId}
            />
          </div>
          <Box sx={{mb: 2, px: 2}}>
            <Button
              aria-label="View thread in diff"
              size="small"
              trailingVisual={ChevronRightIcon}
              variant="invisible"
              onClick={navigateToThread}
            >
              <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: 'start'}}>
                <span>{repliesText}</span>
                <Authors authors={authors} />
              </Box>
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
})
