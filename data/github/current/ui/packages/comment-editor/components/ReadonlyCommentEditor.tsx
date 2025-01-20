import type {Icon} from '@primer/octicons-react'
import {Box, Text} from '@primer/react'

type ReadonlyCommentEditorProps = {
  reason: string
  ['data-testid']?: string
  icon?: Icon
}

export function ReadonlyCommentEditor({reason, icon: Icon, ...props}: ReadonlyCommentEditorProps) {
  return (
    <Box
      className="blankslate"
      sx={{
        border: '1px solid',
        borderColor: 'neutral.muted',
        borderRadius: 2,
        backgroundColor: 'canvas.default',
        boxShadow: 'shadow.small',
      }}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'fg.muted',
        }}
      >
        {Icon && <Icon size={24} />}
        <Text sx={{mt: 2}}>{reason}</Text>
      </Box>
    </Box>
  )
}
