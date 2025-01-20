import {testIdProps} from '@github-ui/test-id-props'
import {ClockIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import {memo, type RefObject, useCallback, useRef, useState} from 'react'
import {readInlineData, usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {useLoadMergeBoxQuery_pullRequest$key} from '../hooks/__generated__/useLoadMergeBoxQuery_pullRequest.graphql'

import {LoadMergeBoxQuery, MergeBoxFragment, useLoadMergeBoxQuery} from '../hooks/use-load-merge-box-query'
import {MergeabilitySidesheet} from './MergeabilitySidesheet'
import type {MergeStatusButtonData} from '../types'
import type {useLoadMergeBoxQuery as useLoadMergeBoxQueryType} from '../hooks/__generated__/useLoadMergeBoxQuery.graphql'
import {presentationForStatus, mergeabilityStatusFromRelay, Status} from '../helpers/mergeability-status'

/**
 * Loads the merge-related data and provides a fallback state for the merge status button
 */
export const MergeStatusButtonWithSuspense = memo(function MergeStatusButtonWithSuspense({
  pullRequestId,
}: {
  pullRequestId: string
}) {
  const {query} = useLoadMergeBoxQuery({pullRequestId})
  const mergeStatusButtonRef = useRef<HTMLButtonElement>(null)
  const [mergeabilitySidesheetIsOpen, setMergeabilitySidesheetIsOpen] = useState(false)
  const toggleMergeabilitySidesheet = useCallback(
    (isOpen: boolean) => {
      setMergeabilitySidesheetIsOpen(isOpen)
    },
    [setMergeabilitySidesheetIsOpen],
  )

  const sidesheet = (
    <MergeabilitySidesheet
      mergeStatusButtonRef={mergeStatusButtonRef}
      mergeabilitySidesheetIsOpen={mergeabilitySidesheetIsOpen}
      pullRequestId={pullRequestId}
      toggleMergeabilitySidesheet={toggleMergeabilitySidesheet}
    />
  )

  if (!query)
    return (
      <>
        <Button ref={mergeStatusButtonRef} leadingVisual={ClockIcon} onClick={() => toggleMergeabilitySidesheet(true)}>
          Status: Calculating mergeability…
        </Button>
        {sidesheet}
      </>
    )

  return (
    <>
      <MergeStatusButtonWrapper
        mergeStatusButtonRef={mergeStatusButtonRef}
        toggleMergeabilitySidesheet={toggleMergeabilitySidesheet}
        query={query}
      />
      {sidesheet}
    </>
  )
})

interface MergeStatusButtonCommonProps {
  mergeStatusButtonRef: RefObject<HTMLButtonElement> | null
  toggleMergeabilitySidesheet: (isOpen: boolean) => void
}

/**
 * A button that displays the merge status of a pull request.
 * Opens the mergeability sidesheet.
 */
function MergeStatusButtonWrapper({
  query,
  ...rest
}: {query: PreloadedQuery<useLoadMergeBoxQueryType>} & MergeStatusButtonCommonProps) {
  const data = usePreloadedQuery<useLoadMergeBoxQueryType>(LoadMergeBoxQuery, query)

  if (!data.pullRequest) return null
  // eslint-disable-next-line no-restricted-syntax
  const pullRequest = readInlineData<useLoadMergeBoxQuery_pullRequest$key>(MergeBoxFragment, data.pullRequest)
  // TODO: Remove this check after we switch to reading from TanStack and can guarantee these fields will not be undefined
  if (!pullRequest.state || !pullRequest.mergeRequirements) return null

  return (
    <MergeStatusButton
      isDraft={!!pullRequest.isDraft}
      state={pullRequest.state}
      isInMergeQueue={!!pullRequest.isInMergeQueue}
      mergeRequirements={pullRequest.mergeRequirements}
      viewerDidAuthor={!!pullRequest.viewerDidAuthor}
      {...rest}
    />
  )
}

export function MergeStatusButton({
  isDraft,
  state,
  isInMergeQueue,
  mergeRequirements,
  viewerDidAuthor,
  mergeStatusButtonRef,
  toggleMergeabilitySidesheet,
}: MergeStatusButtonData & MergeStatusButtonCommonProps) {
  if (!mergeStatusButtonRef) return null

  const status = mergeabilityStatusFromRelay({isDraft, state, isInMergeQueue, mergeRequirements, viewerDidAuthor})
  // Don't render merge status button if failure is non-actionable (repo is not writeable, etc.)
  if (status === Status.NonactionableFailure) return null

  const presentation = presentationForStatus(status)
  const isPrimary = status === Status.Mergeable && viewerDidAuthor

  return (
    <Button
      ref={mergeStatusButtonRef}
      leadingVisual={presentation.icon}
      variant={isPrimary ? 'primary' : 'default'}
      {...testIdProps('merge-status-button')}
      sx={{
        color: isPrimary ? 'fg.primary' : 'fg.default',
        '[data-component="leadingVisual"]': {
          color: isPrimary ? 'fg.primary' : presentation.iconColor,
        },
      }}
      onClick={() => {
        toggleMergeabilitySidesheet?.(true)
      }}
    >
      <Box as="span" sx={{display: ['flex', 'flex', 'flex', 'none']}}>
        View status
      </Box>
      <Box as="span" sx={{gap: 1, display: ['none', 'none', 'none', 'flex']}}>
        {status !== Status.Mergeable && (
          <Box as="span" sx={{color: 'fg.muted', fontWeight: 'normal'}}>
            Status:{' '}
          </Box>
        )}
        {presentation.title}
      </Box>
    </Button>
  )
}
