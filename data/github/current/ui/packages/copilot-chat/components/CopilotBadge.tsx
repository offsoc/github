import {AlertFillIcon, CopilotIcon} from '@primer/octicons-react'
import {Box, Spinner} from '@primer/react'
import type React from 'react'

export interface CopilotBadgeProps {
  isLoading?: boolean
  isError?: boolean
  hasUnreadMessages?: boolean
  zIndex?: number
  fill?: string
  bg?: string
  borderColor?: string
  customIcon?: React.ReactNode
}

export default function CopilotBadge(props: CopilotBadgeProps) {
  const {isLoading, isError, hasUnreadMessages, zIndex, fill, bg, borderColor, customIcon} = props
  return (
    <Box
      sx={{
        borderRadius: '100%',
        position: 'relative',
        bg: bg ? bg : isError ? 'attention.subtle' : 'canvas.subtle',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: borderColor ? borderColor : isError ? 'attention.muted' : 'border.default',
        color: fill ? fill : isLoading ? 'accent.fg' : 'fg.default',
        zIndex: zIndex ? zIndex : -1,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          display: isLoading ? 'flex' : 'none',
        }}
      >
        <Spinner
          size="medium"
          sx={{
            width: 24,
            height: 24,
            color: 'accent.fg',
          }}
        />
      </Box>
      {hasUnreadMessages && (
        <Box
          className="unread-indicator"
          sx={{width: '10px', height: '10px', left: '16px', top: '-2px', borderColor: 'canvas.default'}}
        />
      )}
      {customIcon ? customIcon : <CopilotIcon size={12} />}
      {isError ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            transform: 'translate(4px,4px)',
            color: 'attention.fg',
          }}
        >
          <AlertFillIcon size={12} />
        </Box>
      ) : null}
    </Box>
  )
}
