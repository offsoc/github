// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useAnalytics} from '@github-ui/use-analytics'
import {CheckCircleFillIcon, CheckCircleIcon, XIcon} from '@primer/octicons-react'
import {Box, IconButton, Label, Spinner, Text} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import type {PropsWithChildren} from 'react'
import {Suspense} from 'react'

import type {CommentAuthor, MarkerNavigationImplementation, Thread, ThreadSummary} from '../types'
import {GlobalMarkerNavigation} from './GlobalMarkerNavigation'
import type {ReviewThreadProps} from './ReviewThread'
import {ReviewThread} from './ReviewThread'

function Emphasis({children}: PropsWithChildren) {
  return <Text sx={{fontWeight: 500, color: 'fg.default'}}>{children}</Text>
}

function MultineLineThreadBanner({thread}: {thread?: ThreadSummary}) {
  if (!thread?.diffSide || !thread.line || !thread.startLine || !thread.startDiffSide) return null
  const startSideString = thread.startDiffSide === 'LEFT' ? 'L' : 'R'
  const endSideString = thread.diffSide === 'LEFT' ? 'L' : 'R'
  return (
    <Text sx={{color: 'fg.muted'}}>
      · Comment on lines{' '}
      <Emphasis>
        {startSideString}
        {thread.startLine}
      </Emphasis>{' '}
      to{' '}
      <Emphasis>
        {endSideString}
        {thread.line}
      </Emphasis>
    </Text>
  )
}

export interface ReviewThreadDialogProps
  extends Pick<
    ReviewThreadProps,
    | 'batchingEnabled'
    | 'batchPending'
    | 'commentingImplementation'
    | 'repositoryId'
    | 'subjectId'
    | 'subject'
    | 'suggestedChangesConfig'
    | 'viewerData'
  > {
  filePath: string
  onClose: () => void
  onRefreshThread: (threadId: string) => void
  onThreadSelected: (threadId: string) => void
  thread: Thread
  threads: ThreadSummary[]
  threadsConnectionId?: string
  markerNavigationImplementation: MarkerNavigationImplementation
  ghostUser?: CommentAuthor
}

/**
 * The ReviewThreadDialog opens from the ActionBar when the user selects a conversation.
 */
export function ReviewThreadDialog({
  commentingImplementation,
  filePath,
  onClose,
  onRefreshThread,
  thread,
  threads,
  threadsConnectionId,
  markerNavigationImplementation,
  ghostUser,
  ...rest
}: ReviewThreadDialogProps) {
  const {sendAnalyticsEvent} = useAnalytics()
  const {resolveThread, unresolveThread, resolvingEnabled} = commentingImplementation
  const threadSummary = threads.find(current => current.id === thread.id)
  const hasComments = thread.commentsData.comments.length > 0

  const isThreadResolved = !!thread.isResolved
  const resolvedTokenText = 'Resolved'

  const {addToast} = useToastContext()

  const handleResolveThread = () => {
    resolveThread({
      thread,
      onCompleted: () => onRefreshThread(thread.id),
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to resolve thread',
        })
      },
    })

    sendAnalyticsEvent('comments.resolve_thread', 'RESOLVE_CONVERSATION_BUTTON')
  }

  const handleUnresolveThread = () => {
    unresolveThread({
      thread,
      onCompleted: () => onRefreshThread(thread.id),
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'Failed to unresolve thread',
        })
      },
    })

    sendAnalyticsEvent('comments.unresolve_thread', 'RESOLVE_CONVERSATION_BUTTON')
  }

  const commentsConnectionId = threadSummary?.commentsConnectionId

  if (!hasComments) return null

  return (
    <Box sx={{width: 'clamp(240px, 100vw, 540px)'}}>
      <Box
        sx={{
          borderBottom: '1px solid',
          borderBottomColor: 'border.default',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          background: 'canvas.default',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center'}}>
          <>
            <GlobalMarkerNavigation
              markerId={thread.id}
              markerNavigationImplementation={markerNavigationImplementation}
              onNavigate={onClose}
            />
            <MultineLineThreadBanner thread={threadSummary} />
          </>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'right',
              flexGrow: 1,
            }}
          >
            {isThreadResolved && (
              <Label variant="done" size="large">
                {resolvedTokenText}
              </Label>
            )}

            {resolvingEnabled && (
              <Tooltip
                text={isThreadResolved ? 'Unresolve conversation' : 'Resolve conversation'}
                type="label"
                direction="w"
                id="resolve-conversation"
              >
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  aria-labelledby="resolve-conversation"
                  unsafeDisableTooltip={true}
                  icon={isThreadResolved ? CheckCircleFillIcon : CheckCircleIcon}
                  // need to be specific in order to override default IconButton color
                  sx={{color: isThreadResolved ? 'var(--fgColor-done, var(--color-done-fg)) !important' : undefined}}
                  variant="invisible"
                  onClick={isThreadResolved ? handleUnresolveThread : handleResolveThread}
                />
              </Tooltip>
            )}
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              aria-label="Close thread"
              icon={XIcon}
              variant="invisible"
              onClick={onClose}
            />
          </Box>
        </Box>
      </Box>
      <Suspense
        fallback={
          <Box
            sx={{
              height: '90px',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'fg.muted',
              fontSize: 0,
            }}
          >
            <Spinner />
            <p>Loading comments</p>
          </Box>
        }
      >
        <ReviewThread
          commentingImplementation={commentingImplementation}
          commentsConnectionId={commentsConnectionId}
          filePath={filePath}
          onRefreshThread={onRefreshThread}
          thread={thread}
          threadsConnectionId={threadsConnectionId}
          {...rest}
          ghostUser={ghostUser}
        />
      </Suspense>
    </Box>
  )
}
