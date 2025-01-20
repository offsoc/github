import {AlertIcon, CommentIcon, TrashIcon} from '@primer/octicons-react'
import {ActionList, Box, Button, Flash, IconButton, Octicon, RelativeTime, Spinner} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {useCallback, useMemo, useRef, useState} from 'react'

import {threadName} from '../utils/copilot-chat-helpers'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'

export function ThreadListView() {
  const state = useChatState()
  const manager = useChatManager()
  const threads = useMemo(() => manager.sortThreads(state.threads), [state.threads, manager])
  const handleCreateThread = useCallback(() => {
    void manager.createThread()
  }, [manager])

  const [openDeleteConfirmationThreadId, setOpenDeleteConfirmationThreadId] = useState<string | null>(null)
  const returnFocusRef = useRef(null)

  const ListView = () => {
    return (
      <>
        {threads.map(thread => {
          return (
            <Box sx={{display: 'flex'}} key={thread.id}>
              <ActionList.Item key={thread.id} onSelect={() => manager.selectThread(thread)}>
                <ActionList.LeadingVisual>
                  <CommentIcon />
                </ActionList.LeadingVisual>
                {threadName(thread)}
                <ActionList.TrailingVisual>
                  <RelativeTime date={new Date(Date.parse(thread.updatedAt))} format="relative" />
                </ActionList.TrailingVisual>
              </ActionList.Item>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                data-testid={`delete-thread-button-${thread.id}`}
                ref={returnFocusRef}
                onClick={() => setOpenDeleteConfirmationThreadId(thread.id)}
                sx={{p: 2, mr: 2}}
                variant="invisible"
                icon={TrashIcon}
                aria-label={`Delete conversation: "${threadName(thread)}"`}
                tooltipDirection="nw"
              />
              {openDeleteConfirmationThreadId === thread.id && (
                <div data-testid={`delete-thread-dialog-${thread.id}`}>
                  <Dialog
                    title="Delete conversation"
                    width="small"
                    onClose={() => setOpenDeleteConfirmationThreadId(null)}
                    returnFocusRef={returnFocusRef}
                    footerButtons={[
                      {
                        buttonType: 'default',
                        content: 'Cancel',
                        onClick: () => setOpenDeleteConfirmationThreadId(null),
                      },
                      {
                        buttonType: 'danger',
                        content: 'Delete',
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick: async () => {
                          await manager.deleteThreadKeepSelection(thread)
                          setOpenDeleteConfirmationThreadId(null)
                        },
                        autoFocus: true,
                      },
                    ]}
                  >
                    Are you sure? This can’t be undone.
                  </Dialog>
                </div>
              )}
            </Box>
          )
        })}
      </>
    )
  }

  const ErrorView = () => {
    return (
      <Box
        sx={{
          p: 3,
        }}
      >
        <Flash variant="warning">
          <Octicon icon={AlertIcon} />
          {state.threadsLoading.state === 'error'
            ? state.threadsLoading.error
            : 'Something went wrong. Please try again later.'}
        </Flash>
      </Box>
    )
  }

  if (state.threadsLoading.state === 'loading' && state.threads.size === 0) {
    return (
      <Box
        sx={{
          p: 3,
          height: '100%',
          display: 'grid',
          alignItems: 'center',
          alignContent: 'center',
          flexDirection: 'column',
          justifyItems: 'center',
          gap: 2,
        }}
      >
        <Spinner />
        Loading threads…
      </Box>
    )
  }

  return (
    <>
      {
        // Show an error if there are no threads because we should show the new thread view instead of the list UI
        state.threadsLoading.state === 'error' ? (
          <ErrorView />
        ) : (
          <>
            {state.threads.size > 0 && (
              <ActionList sx={{overflowY: 'auto'}}>
                <ActionList.Group>
                  <ActionList.GroupHeading as="h3">Active conversations</ActionList.GroupHeading>
                  <ListView />
                </ActionList.Group>
              </ActionList>
            )}

            {state.threads.size === 0 && (
              <Box sx={{p: 3, color: 'fg.subtle'}}>
                <p className="mb-3">There are no conversations at the moment.</p>
                <Button onClick={handleCreateThread} block>
                  Start a new conversation
                </Button>
              </Box>
            )}
          </>
        )
      }
    </>
  )
}
