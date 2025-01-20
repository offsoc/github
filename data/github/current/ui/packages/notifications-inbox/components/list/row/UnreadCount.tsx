import {Box, Text} from '@primer/react'
import type {FC} from 'react'

/// Render unread counter. This is used in both the compact and default view
const UnreadCounter: FC<{unreadItemsCount: number}> = ({unreadItemsCount}) => {
  // Do not render if there are no unread items
  if (unreadItemsCount <= 0) return null
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '24px',
        borderRadius: '4px',
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'var(--buttonCounter-outline-bgColor-disabled, var(--color-btn-outline-disabled-counter-bg))',
        backgroundColor: 'var(--buttonCounter-outline-bgColor-rest, var(--color-btn-outline-counter-bg))',
        p: 1,
      }}
    >
      <Text
        as="span"
        className="text-mono"
        sx={{fontWeight: 'normal', fontSize: '11px', flexShrink: 0, color: 'accent.fg', lineHeight: '1'}}
      >
        {unreadItemsCount > 99 ? '99+' : unreadItemsCount}
      </Text>
    </Box>
  )
}

export default UnreadCounter
