import {Box, Button, Text} from '@primer/react'
import {CodespacesIcon} from '@primer/octicons-react'
import {RunCodespaceButtonClicked} from '../../../../utils/playground-types'
import {sendEvent} from '@github-ui/hydro-analytics'

export default function CodespacesCard({openInCodespaceUrl}: {openInCodespaceUrl: string}) {
  return (
    <Box
      sx={{
        px: [0, 0, 3],
        pt: [4, 4, 3],
        pb: [0, 0, 3],
        display: 'flex',
        flexDirection: 'column',
        borderWidth: [0, 0, 1],
        borderStyle: 'solid',
        borderColor: 'border.default',
        borderRadius: [0, 0, 2],
        gap: 2,
      }}
    >
      <Text
        sx={{
          fontWeight: 'bold',
          fontSize: [3, 2, 2],
          borderBottomColor: 'border.default',
          borderBottomStyle: 'solid',
          borderBottomWidth: [1, 1, 0],
          pb: [2, 2, 0],
          mb: [0, 2, 2],
        }}
      >
        Run with codespaces
      </Text>
      <Text sx={{fontSize: 1, pb: 2}}>Seriously, you&apos;ll be up and running in seconds. It will be great.</Text>
      <Box sx={{display: ['contents', 'inline', 'grid'], my: [0, 2, 0]}}>
        <Button
          as="a"
          leadingVisual={CodespacesIcon}
          variant="primary"
          href={openInCodespaceUrl}
          onClick={() => sendEvent(RunCodespaceButtonClicked)}
        >
          Run codespace
        </Button>
      </Box>
    </Box>
  )
}
