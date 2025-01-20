import {useAnalytics} from '@github-ui/use-analytics'
import {Box, Button, Label} from '@primer/react'
import {type RefObject, useCallback, useRef} from 'react'

import type {CommentingImplementation, SuggestedChange} from '../../types'

export function CommitOrRemoveFromBatch({
  commentingImplementation,
  onOpenDialog,
  suggestedChange,
}: {
  commentingImplementation: CommentingImplementation
  onOpenDialog: (returnFocusRef?: RefObject<HTMLElement>) => void
  suggestedChange: SuggestedChange
}) {
  const returnFocusRef = useRef<HTMLButtonElement>(null)
  const handleCommitBatchClick = useCallback(() => {
    onOpenDialog(returnFocusRef)
  }, [onOpenDialog])

  const batchCount = commentingImplementation.pendingSuggestedChangesBatch.length
  const {sendAnalyticsEvent} = useAnalytics()

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', flexDirection: 'row'}}>
      <Label variant="attention" sx={{my: 'auto'}}>
        Pending in batch
      </Label>
      <Box sx={{display: 'flex', gap: 2}}>
        <Button
          size="medium"
          variant="danger"
          onClick={() => {
            commentingImplementation.removeSuggestedChangeFromPendingBatch(suggestedChange)
            sendAnalyticsEvent(
              'comments.remove_suggested_change_from_batch',
              'REMOVE_SUGGESTED_CHANGE_FROM_BATCH_BUTTON',
            )
          }}
        >
          Remove from batch
        </Button>
        <Button
          ref={returnFocusRef}
          size="medium"
          count={batchCount}
          variant="primary"
          onClick={handleCommitBatchClick}
        >
          {`Apply suggestion${batchCount > 1 ? 's' : ''}`}
        </Button>
      </Box>
    </Box>
  )
}
