import {Dialog} from '@primer/react/experimental'
import {Box, Text} from '@primer/react'
import {CopyIcon} from '@primer/octicons-react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'

export type BranchNextStepLocalProps = {
  branch: string | null
  onClose: () => void
}

export const BranchNextStepLocal = ({branch, onClose}: BranchNextStepLocalProps) => {
  const content = `git fetch origin
git checkout ${branch}`

  return (
    <Dialog width="large" height="auto" title={'Checkout in your local repository'} onClose={onClose}>
      <Text
        sx={{
          color: 'fg.muted',
          fontSize: 12,
        }}
      >
        Run the following commands in your local clone.
      </Text>
      <Box
        sx={{
          backgroundColor: 'canvas.subtle',
          marginTop: 3,
          padding: '8px 8px 8px 8px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text sx={{fontFamily: 'mono', fontSize: 12, whiteSpace: 'pre-wrap'}}>{content}</Text>
        <CopyToClipboardButton
          textToCopy={content}
          ariaLabel={'Copy to clipboard'}
          icon={CopyIcon}
          tooltipProps={{direction: 'w'}}
        />
      </Box>
    </Dialog>
  )
}
