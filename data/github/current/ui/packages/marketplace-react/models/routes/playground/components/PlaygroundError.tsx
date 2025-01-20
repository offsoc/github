import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Octicon} from '@primer/react'
import {usePlaygroundManager} from '../../../utils/playground-manager'

export type PlaygroundErrorProps = {
  message: string
  showResetButton: boolean
}

export function PlaygroundError(props: PlaygroundErrorProps) {
  const manager = usePlaygroundManager()

  return (
    <Box data-testid="playground-error" sx={{py: 2}}>
      <Flash
        variant="warning"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'min-content 1fr minmax(0, auto)',
          gridTemplateRows: 'min-content',
          gridTemplateAreas: `'visual message actions'`,
          '@media screen and (max-width: 543.98px)': {
            gridTemplateColumns: 'min-content 1fr',
            gridTemplateRows: 'min-content min-content',
            gridTemplateAreas: `
        'visual message'
        '.      actions'
      `,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            alignSelf: 'center',
            gridArea: 'visual',
          }}
        >
          <Octicon icon={AlertIcon} />
        </Box>
        <Box
          sx={{
            fontSize: 1,
            lineHeight: '1.5',
            alignSelf: 'center',
            gridArea: 'message',
          }}
        >
          {props.message}
        </Box>
        {props.showResetButton && (
          <Box
            sx={{
              gridArea: 'actions',
              '@media screen and (max-width: 543.98px)': {
                alignSelf: 'start',
                margin: 'var(--base-size-8) 0 0 var(--base-size-8)',
              },
            }}
          >
            <Button onClick={() => manager.resetHistory(true)}>Reset chat</Button>
          </Box>
        )}
      </Flash>
    </Box>
  )
}
