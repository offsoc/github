import {CommentLoading} from '@github-ui/commenting/CommentLoading'
import {CommentDivider} from '@github-ui/commenting/CommentDivider'
import {Box} from '@primer/react'

import {TEST_IDS} from '../constants/test-ids'

const sx = {
  display: 'flex',
  height: 50,
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
  border: '1px solid',
  borderColor: 'border.muted',
  borderRadius: 2,
  backgroundColor: 'canvas.default',
  boxShadow: 'shadow.small',
  overflowX: 'auto',
  scrollMarginTop: '100px',
  flexGrow: 1,
  marginLeft: 40,
}

export const HighlightedTimelineLoading = () => {
  return (
    <div data-testid={TEST_IDS.highlightedTimelineLoading}>
      <CommentDivider />
      <Box sx={sx} />
      <CommentDivider />
      <CommentLoading />
      <CommentDivider />
      <Box sx={sx} />
    </div>
  )
}
