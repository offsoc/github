import type {Icon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'

type ReadonlyCommentBoxProps = {
  reason: string
  ['data-testid']?: string
  icon?: Icon
}

export function ReadonlyCommentBox({reason, icon: Icon, ...props}: ReadonlyCommentBoxProps) {
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
        <SafeHTMLText sx={{mt: 2}} html={reason as SafeHTMLString} />
      </Box>
    </Box>
  )
}
