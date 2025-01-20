/* eslint eslint-comments/no-use: off */
import {Box} from '@primer/react'

export const InboxUnreadIndicator = ({isReadByViewer}: {isReadByViewer: boolean}) => {
  if (isReadByViewer) {
    return null
  }
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: 100,
        backgroundColor: 'accent.fg',
      }}
    />
  )
}
