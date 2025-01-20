import {useAnalytics} from '@github-ui/use-analytics'
import {Box, Button} from '@primer/react'

import type {CommentingImplementation, SuggestedChange} from '../../types'

export function AddToExistingBatch({
  commentingImplementation,
  suggestedChange,
}: {
  suggestedChange: SuggestedChange
  commentingImplementation: CommentingImplementation
}) {
  const {sendAnalyticsEvent} = useAnalytics()
  return (
    <Box sx={{display: 'flex', flexDirection: 'row-reverse'}}>
      <Button
        variant="primary"
        onClick={() => {
          sendAnalyticsEvent('comments.add_suggested_change_to_batch', 'ADD_SUGGESTED_CHANGE_TO_BATCH_BUTTON')
          commentingImplementation.addSuggestedChangeToPendingBatch(suggestedChange)
        }}
      >
        Add suggestion to batch
      </Button>
    </Box>
  )
}
