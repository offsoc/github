import type {ThreadSummary} from '@github-ui/conversations'
import {Markers, StartConversation} from '@github-ui/conversations'
import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'
import {noop} from '@github-ui/noop'
import {CommentIcon, PlusIcon} from '@primer/octicons-react'
import {Button, ButtonGroup, IconButton} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {usePullRequestContext} from '../../../contexts/PullRequestContext'
import {usePullRequestMarkersContext} from '../../../contexts/PullRequestMarkersContext'
import {usePullRequestCommenting} from '../../../hooks/use-pull-request-commenting'
import usePullRequestPageAppPayload from '../../../hooks/use-pull-request-page-app-payload'
import type {
  FileConversationsButton_diffEntry$data,
  FileConversationsButton_diffEntry$key,
} from './__generated__/FileConversationsButton_diffEntry.graphql'
import type {FileConversationsButton_viewer$key} from './__generated__/FileConversationsButton_viewer.graphql'

function threadSummary(threadsData: FileConversationsButton_diffEntry$data['threads']): ThreadSummary[] {
  const lineThreads =
    threadsData.edges?.flatMap(thread => {
      const id = thread?.node?.id
      const firstAuthor = thread?.node?.comments.edges?.[0]?.node?.author
      const commentCount = thread?.node?.comments.totalCount ?? 0
      const commentsConnectionId = thread?.node?.comments.__id
      return id && firstAuthor
        ? [{id, author: firstAuthor, commentCount, commentsConnectionId, isOutdated: !!thread.node.isOutdated}]
        : []
    }) ?? []

  return lineThreads
}

export default function FileConversationsButton({
  diffEntry,
  onActivateGlobalMarkerNavigation,
  activeGlobalMarkerID,
  viewer,
}: {
  diffEntry: FileConversationsButton_diffEntry$key
  onActivateGlobalMarkerNavigation: () => void
  activeGlobalMarkerID: string | undefined
  viewer: FileConversationsButton_viewer$key
}) {
  const diffEntryData = useFragment(
    graphql`
      fragment FileConversationsButton_diffEntry on PullRequestDiffEntry {
        path
        outdatedThreads: threads(first: 50, subjectType: LINE, outdatedFilter: ONLY_OUTDATED) {
          __id
          # eslint-disable-next-line relay/unused-fields
          totalCount
          totalCommentsCount
          # eslint-disable-next-line relay/unused-fields
          edges {
            node {
              id
              isOutdated
              comments(first: 50) {
                __id
                totalCount
                edges {
                  node {
                    author {
                      avatarUrl(size: 48)
                      login
                    }
                  }
                }
              }
            }
          }
        }
        threads(first: 50, subjectType: FILE) @connection(key: "FileConversationsButton_threads") {
          __id
          # eslint-disable-next-line relay/unused-fields
          totalCount
          totalCommentsCount
          # eslint-disable-next-line relay/unused-fields
          edges {
            node {
              id
              isOutdated
              comments(first: 50) {
                __id
                totalCount
                edges {
                  node {
                    author {
                      avatarUrl(size: 48)
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    diffEntry,
  )

  const viewerData = useFragment(
    graphql`
      fragment FileConversationsButton_viewer on User {
        login
        avatarUrl(size: 48)
      }
    `,
    viewer,
  )

  const {pullRequestId, repositoryId, viewerPendingReviewId, viewerCanComment} = usePullRequestContext()

  const fileLevelCommentsCount = diffEntryData.threads.totalCommentsCount || 0
  const outdatedCommentsCount = diffEntryData.outdatedThreads.totalCommentsCount || 0
  const commentsCount = fileLevelCommentsCount + outdatedCommentsCount
  const {ghostUser} = usePullRequestPageAppPayload()

  const threads = useMemo(() => {
    const fileLevelThreads = threadSummary(diffEntryData.threads)
    const outdatedThreads = threadSummary(diffEntryData.outdatedThreads)

    return [...fileLevelThreads, ...outdatedThreads]
  }, [diffEntryData.threads, diffEntryData.outdatedThreads])

  const conversationsListButtonRef = useRef<HTMLButtonElement>(null)
  const addCommentButtonRef = useRef<HTMLButtonElement>(null)

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [isMarkerListOpen, setIsMarkerListOpen] = useState(false)
  const handleConversationListOpen = useCallback(() => {
    ensurePreviousActiveDialogIsClosed()
    if (threads.length === 1 && threads[0]) {
      setSelectedThreadId(threads[0].id)
    } else {
      setIsMarkerListOpen(true)
    }
  }, [threads])
  const [isStartConversationDialogOpen, setIsStartConversationDialogOpen] = useState(false)

  const fileConversationsButtonAriaLabel = () => {
    let viewText = 'View file comments and outdated comments.'
    viewText += ` This file has ${fileLevelCommentsCount} comment${fileLevelCommentsCount !== 1 ? 's' : ''}`
    viewText += ` and ${outdatedCommentsCount} outdated comment${outdatedCommentsCount !== 1 ? 's' : ''}.`
    return viewText
  }

  const commentingImplementation = usePullRequestCommenting()
  const markerNavigationImplementation = usePullRequestMarkersContext()

  /** Open review thread for global marker navigation */
  useEffect(() => {
    if (activeGlobalMarkerID) {
      const threadIds = threads.map(l => l.id)
      if (threadIds.includes(activeGlobalMarkerID)) {
        setSelectedThreadId(activeGlobalMarkerID)
        onActivateGlobalMarkerNavigation()
      }
    }
  }, [activeGlobalMarkerID, threads, selectedThreadId, setSelectedThreadId, onActivateGlobalMarkerNavigation])

  const markerNavigationWithGlobalThreadProps = useMemo(() => {
    return {
      ...markerNavigationImplementation,
      activeGlobalMarkerID,
    }
  }, [markerNavigationImplementation, activeGlobalMarkerID])

  const openStartConversationDialog = useCallback(() => {
    ensurePreviousActiveDialogIsClosed()
    setIsStartConversationDialogOpen(true)
  }, [setIsStartConversationDialogOpen])

  const closeStartConversationDialog = useCallback(
    () => setIsStartConversationDialogOpen(false),
    [setIsStartConversationDialogOpen],
  )

  const handleAddComment = ({
    onCompleted,
    text,
    onError,
    submitBatch,
  }: {
    filePath: string
    text: string
    onCompleted?: (threadId: string, commentDatabaseId?: number) => void
    onError: (error: Error) => void
    submitBatch?: boolean
  }) => {
    const handleCompleted = (threadId: string, commentDatabaseId?: number) => {
      onCompleted?.(threadId, commentDatabaseId)
      setSelectedThreadId(threadId)
    }

    commentingImplementation.addFileLevelThread({
      text,
      onCompleted: handleCompleted,
      onError,
      submitBatch,
      filePath: diffEntryData.path,
      threadsConnectionId: diffEntryData?.threads.__id,
    })
  }

  return (
    <>
      {commentsCount < 1 && viewerCanComment && (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          ref={addCommentButtonRef}
          aria-label={`Add a file comment`}
          icon={CommentIcon}
          sx={{mr: 2, color: 'fg.muted', flexShrink: 0}}
          unsafeDisableTooltip={true}
          onClick={openStartConversationDialog}
        />
      )}
      {commentsCount > 0 && (
        <ButtonGroup sx={{mr: 2}}>
          <Button
            ref={conversationsListButtonRef}
            aria-label={fileConversationsButtonAriaLabel()}
            count={commentsCount}
            leadingVisual={CommentIcon}
            sx={{mr: 2, flexShrink: 0}}
            onClick={handleConversationListOpen}
          />
          {viewerCanComment && (
            // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
            <IconButton
              ref={addCommentButtonRef}
              aria-label={`Add a file comment`}
              icon={PlusIcon}
              sx={{flexShrink: 0}}
              unsafeDisableTooltip={true}
              onClick={openStartConversationDialog}
            />
          )}
        </ButtonGroup>
      )}
      {commentsCount > 0 && (
        <Markers
          annotations={[]}
          batchPending={!!viewerPendingReviewId}
          batchingEnabled={commentingImplementation.batchingEnabled}
          commentingImplementation={commentingImplementation}
          conversationAnchorRef={conversationsListButtonRef}
          conversationListAnchorRef={conversationsListButtonRef}
          conversationListThreads={threads}
          filePath={diffEntryData.path}
          ghostUser={ghostUser}
          isMarkerListOpen={isMarkerListOpen}
          markerNavigationImplementation={markerNavigationWithGlobalThreadProps}
          repositoryId={repositoryId}
          returnFocusRef={conversationsListButtonRef}
          selectedThreadId={selectedThreadId}
          subjectId={pullRequestId}
          onAnnotationSelected={noop}
          onCloseConversationDialog={() => setSelectedThreadId(null)}
          onCloseConversationList={() => setIsMarkerListOpen(false)}
          onThreadSelected={threadId => setSelectedThreadId(threadId)}
        />
      )}
      <StartConversation
        anchorRef={addCommentButtonRef}
        batchPending={!!viewerPendingReviewId}
        batchingEnabled={commentingImplementation.batchingEnabled}
        commentBoxConfig={commentingImplementation.commentBoxConfig}
        fileLevelComment={true}
        filePath={diffEntryData.path}
        isLeftSide={undefined}
        isOpen={isStartConversationDialogOpen}
        repositoryId={repositoryId}
        returnFocusRef={addCommentButtonRef}
        subjectId={pullRequestId}
        threadsConnectionId={diffEntryData.threads.__id}
        viewerData={{
          login: viewerData.login,
          avatarUrl: viewerData.avatarUrl,
        }}
        onAddComment={handleAddComment}
        onCloseCommentDialog={closeStartConversationDialog}
      />
    </>
  )
}
