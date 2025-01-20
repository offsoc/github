import useSafeState from '@github-ui/use-safe-state'
import {GitMergeQueueIcon, StopIcon} from '@primer/octicons-react'
import {Button, CircleOcticon, Dialog, Flash, Link, Octicon, Spinner, Text} from '@primer/react'
import {useRelayEnvironment} from 'react-relay'

import {useMergeMethodContext} from '../../../contexts/MergeMethodContext'
import removePullRequestFromMergeQueue from '../../../mutations/dequeue-pull-request-mutation'
import {MergeBoxSectionHeader} from '../common/MergeBoxSectionHeader'
import type {MergeMethod, MergeQueueEntryState} from '../../../types'
import {useRef, useState} from 'react'
import {announce} from '@github-ui/aria-live'
import {useAnalytics} from '@github-ui/use-analytics'

export type RemoveFromQueueFunction = ({
  mergeMethod,
  onCompleted,
  onError,
}: {
  mergeMethod: MergeMethod
  onCompleted: () => void
  onError: (e: Error) => void
}) => void

type MergeButtonFocusProps = {
  focusPrimaryMergeButton: () => void
}

type MergeQueueSectionWithRelayProps = Omit<Props, 'onRemoveFromQueue'> & {id: string}

/**
 *
 * Wrapper component for the MergeQueueSection component
 */
export function MergeQueueSectionWithRelay({id, ...props}: MergeQueueSectionWithRelayProps) {
  const environment = useRelayEnvironment()
  const onRemoveFromQueue: RemoveFromQueueFunction = ({mergeMethod, onCompleted, onError}) => {
    removePullRequestFromMergeQueue({
      environment,
      input: {id},
      onCompleted,
      onError,
      mergeMethod,
    })
  }
  return <MergeQueueSection {...props} onRemoveFromQueue={onRemoveFromQueue} />
}

export type Props = {
  mergeQueue:
    | {
        url: string
      }
    | null
    | undefined
  mergeQueueEntry:
    | {
        position: number
        state: MergeQueueEntryState
      }
    | null
    | undefined
  viewerCanAddAndRemoveFromMergeQueue: boolean
} & Callbacks &
  MergeButtonFocusProps

type Callbacks = {
  onRemoveFromQueue: RemoveFromQueueFunction
}

/**
 *
 * Presentational component for the MergeQueueSection
 * Displays queue position details and allows user to dequeue the pull request
 */
export function MergeQueueSection({
  mergeQueue,
  mergeQueueEntry,
  viewerCanAddAndRemoveFromMergeQueue,
  onRemoveFromQueue,
  focusPrimaryMergeButton,
}: Props) {
  const isMergeEntryLocked = mergeQueueEntry?.state === 'LOCKED'
  const mergePosition = mergeQueueEntry?.position
  const mergeQueueUrl = mergeQueue?.url

  const returnConfirmationRef = useRef<HTMLButtonElement>(null)
  const [dequeueing, setDequeueing] = useSafeState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useSafeState<string | null>(null)
  const {mergeMethod} = useMergeMethodContext()

  const {sendAnalyticsEvent} = useAnalytics()

  const handleDequeue = () => {
    if (dequeueing) return
    setDequeueing(true)
    setErrorMessage(null)
    sendAnalyticsEvent(
      'merge_queue_section.dequeue_pull_request',
      'MERGEBOX_MERGE_QUEUE_SECTION_REMOVE_FROM_QUEUE_BUTTON',
    )

    onRemoveFromQueue({
      mergeMethod,
      onCompleted: () => {
        setDequeueing(false)
        setIsConfirmationDialogOpen(false)
        setTimeout(() => announce('The pull request was successfully removed from the queue.'), 1000)
        focusPrimaryMergeButton()
      },
      onError: (e: Error) => {
        setDequeueing(false)
        setIsConfirmationDialogOpen(false)
        setErrorMessage(e.message)
        returnConfirmationRef.current?.focus()
        setTimeout(() => announce('Failed to remove pull request from the merge queue'), 1000)
      },
    })
  }

  const handleOpenConfirmation = () => {
    setErrorMessage(null)
    setIsConfirmationDialogOpen(true)
  }

  return (
    <>
      <Dialog
        aria-labelledby="remove-from-queue-dialog-title"
        isOpen={isConfirmationDialogOpen}
        returnFocusRef={returnConfirmationRef}
        onDismiss={() => setIsConfirmationDialogOpen(false)}
      >
        <Dialog.Header id="remove-from-queue-dialog-title">Remove from the queue?</Dialog.Header>
        <div className="p-3">
          <span>
            Removing this pull request from the queue could impact other pull requests in the queue. Are you sure?
          </span>
          <div className="d-flex flex-justify-end mt-3">
            <Button
              className="mr-1"
              inactive={dequeueing}
              onClick={() => {
                if (!dequeueing) {
                  setIsConfirmationDialogOpen(false)
                  returnConfirmationRef.current?.focus()
                }
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" aria-busy={dequeueing} onClick={handleDequeue}>
              <div className="d-flex flex-row flex-items-center">
                {dequeueing && <Spinner size="small" sx={{mr: 2}} />}
                {dequeueing ? 'Removing' : 'Remove'} from the queue
              </div>
            </Button>
          </div>
        </div>
      </Dialog>
      {errorMessage && (
        <Flash className="mx-3 my-2" variant="danger">
          <Octicon className="mr-2" icon={StopIcon} />
          {errorMessage}
        </Flash>
      )}
      <MergeBoxSectionHeader
        title="Queued to merge..."
        icon={
          <CircleOcticon
            icon={() => <GitMergeQueueIcon size={16} />}
            className="bgColor-attention-emphasis fgColor-onEmphasis"
            size={32}
          />
        }
        rightSideContent={
          <>
            {viewerCanAddAndRemoveFromMergeQueue && !isMergeEntryLocked && (
              <Button ref={returnConfirmationRef} onClick={handleOpenConfirmation}>
                Remove from queue
              </Button>
            )}
          </>
        }
      >
        <MergeQueuePositionText position={mergePosition} resourcePath={mergeQueueUrl} />
      </MergeBoxSectionHeader>
    </>
  )
}

function MergeQueuePositionText({position, resourcePath}: {position?: number; resourcePath?: string}) {
  if (!position || !resourcePath) return <></>
  const pullsBeforeInQueue = position - 1

  if (pullsBeforeInQueue === 0) {
    return (
      <>
        <Text sx={{color: 'fg.muted'}}>This pull request is next up in the</Text>{' '}
        <Link inline href={resourcePath}>
          merge queue
        </Link>
        .
      </>
    )
  }

  if (pullsBeforeInQueue === 1) {
    return (
      <>
        <Text sx={{color: 'fg.muted'}}>There is {pullsBeforeInQueue} pull request ahead of this one in the</Text>{' '}
        <Link inline href={resourcePath}>
          merge queue
        </Link>
        .
      </>
    )
  }

  return (
    <>
      <Text sx={{color: 'fg.muted'}}>There are {pullsBeforeInQueue} pull requests ahead of this one in the</Text>{' '}
      <Link inline href={resourcePath}>
        merge queue
      </Link>
      .
    </>
  )
}
