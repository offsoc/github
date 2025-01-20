/* eslint eslint-comments/no-use: off */
import {Box} from '@primer/react'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import type {SafeHTMLString} from '@github-ui/safe-html'

type Props = {
  body: SafeHTMLString
}

const NotificationDefaultViewBody = ({body}: Props) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        order: [1, 1, 1, 1, 0],
      }}
      data-hpc
    >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <MarkdownViewer
          disabled={true}
          verifiedHTML={body}
          markdownValue={body}
          onChange={() => {
            // This is required but no action is needed in the current state
            return
          }}
        />
      </Box>
    </Box>
  )
}

export default NotificationDefaultViewBody
