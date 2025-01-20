import {ReviewThread, StaticUnifiedDiffPreview} from '@github-ui/conversations'
import {configureSuggestedChangesFromThreadWithDiffLines} from '@github-ui/diff-lines/use-suggested-changes'
import {useNavigate} from '@github-ui/use-navigate'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {Box} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {usePullRequestContext} from '../../../../contexts/PullRequestContext'
import {makeThread} from '../../../../hooks/use-fetch-thread'
import {usePullRequestCommenting} from '../../../../hooks/use-pull-request-commenting'
import usePullRequestPageAppPayload from '../../../../hooks/use-pull-request-page-app-payload'
import type {Thread_pullRequestThread$key} from './__generated__/Thread_pullRequestThread.graphql'
import type {Thread_viewer$key} from './__generated__/Thread_viewer.graphql'
import {ThreadHeader} from './ThreadHeader'

const reviewThreadCollapsedStateStorageKey = (id: string) => `timeline-pull-request-review-thread-collapsed-state-${id}`

type ThreadProps = {
  thread: Thread_pullRequestThread$key
  viewer: Thread_viewer$key
}

export function Thread({thread, viewer}: ThreadProps) {
  const data = useFragment(
    graphql`
      fragment Thread_pullRequestThread on PullRequestThread {
        ...ThreadHeader_pullRequestThread
        # eslint-disable-next-line relay/unused-fields
        id
        currentDiffResourcePath
        # eslint-disable-next-line relay/unused-fields
        isOutdated
        isResolved
        path
        # eslint-disable-next-line relay/unused-fields
        subject {
          ... on PullRequestDiffThread {
            originalStartLine
            originalEndLine
            startLine
            endLine
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
        # eslint-disable-next-line relay/unused-fields
        subjectType
        # eslint-disable-next-line relay/unused-fields
        viewerCanReply
        # eslint-disable-next-line relay/unused-fields
        comments(first: 50) {
          __id
          edges {
            node {
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...useFetchThread_PullRequestReviewComment
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...ReactionViewerGroups
            }
          }
        }
      }
    `,
    thread,
  )

  const viewerData = useFragment(
    graphql`
      fragment Thread_viewer on User {
        avatarUrl
        login
        isSiteAdmin
        pullRequestUserPreferences {
          tabSize
          diffView
        }
      }
    `,
    viewer,
  )

  const {
    pullRequestId,
    repositoryId,
    viewerCanComment,
    viewerCanApplySuggestion,
    state,
    isInMergeQueue,
    viewerPendingReviewId,
  } = usePullRequestContext()
  const navigate = useNavigate()

  const [isCollapsed, setIsCollapsed] = useLocalStorage(reviewThreadCollapsedStateStorageKey(data.id), data.isResolved)
  const threadData = makeThread(data)
  const commentingImplementation = usePullRequestCommenting()
  const {ghostUser} = usePullRequestPageAppPayload()
  const shouldRenderDiffLinePreview = (threadData?.subject?.diffLines ?? []).length > 0

  const suggestedChangesConfig = threadData ? configureSuggestedChangesFromThreadWithDiffLines(threadData) : undefined

  return (
    <Box
      sx={{
        backgroundColor: 'canvas.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ThreadHeader
        isCollapsed={isCollapsed}
        thread={data}
        onNavigateToDiffThread={() => data.currentDiffResourcePath && navigate(data.currentDiffResourcePath)}
        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
      />
      {!isCollapsed && threadData && (
        <>
          {shouldRenderDiffLinePreview && (
            <Box sx={{overflowX: 'auto', borderBottom: '1px solid', borderBottomColor: 'border.subtle'}}>
              <StaticUnifiedDiffPreview
                diffTableSx={{borderStyle: 'none'}}
                hideHeaderDetails={true}
                sx={{m: 0, borderStyle: 'none'}}
                tabSize={viewerData.pullRequestUserPreferences.tabSize || 4}
                thread={threadData}
              />
            </Box>
          )}
          <ReviewThread
            batchPending={!!viewerPendingReviewId}
            batchingEnabled={commentingImplementation.batchingEnabled}
            commentAnchorPrefix="discussion_r"
            commentingImplementation={commentingImplementation}
            filePath={data.path}
            ghostUser={ghostUser}
            hideDiffPreview={true}
            repositoryId={repositoryId}
            shouldLimitHeight={false}
            subjectId={pullRequestId}
            suggestedChangesConfig={suggestedChangesConfig}
            thread={threadData}
            subject={{
              isInMergeQueue,
              state,
            }}
            viewerData={{
              avatarUrl: viewerData.avatarUrl,
              diffViewPreference: viewerData.pullRequestUserPreferences.diffView,
              isSiteAdmin: viewerData.isSiteAdmin,
              login: viewerData.login,
              tabSizePreference: viewerData.pullRequestUserPreferences.tabSize,
              viewerCanComment: !!viewerCanComment,
              viewerCanApplySuggestion: !!viewerCanApplySuggestion,
            }}
          />
        </>
      )}
    </Box>
  )
}
