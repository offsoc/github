import {AlertFillIcon, CopilotIcon} from '@primer/octicons-react'
import {Box, Spinner, Text} from '@primer/react'

const waitingMessage = 'Summarizing changes… this might take a minute'

export interface CopilotProgressIndicatorProps {
  isError?: boolean
  isLoading: boolean
}

export const CopilotProgressIndicator = (props: CopilotProgressIndicatorProps) => {
  return props.isLoading ? (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
      <Box
        sx={{
          position: 'relative',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-testid="copilot-summary-error-banner-icon"
      >
        <Spinner size="small" data-testid="copilot-spinner" />
      </Box>
      <Text sx={{color: 'fg.subtle', fontSize: 0, fontWeight: 500, paddingLeft: 1}}>{waitingMessage}</Text>
    </Box>
  ) : (
    <Box
      sx={{
        borderRadius: '100%',
        position: 'relative',
        bg: props.isError ? 'attention.subtle' : 'canvas.subtle',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        border: '1px solid',
        borderColor: props.isError ? 'attention.muted' : 'border.default',
        color: props.isLoading ? 'accent.fg' : 'fg.default',
      }}
      data-testid="copilot-spinner"
    >
      <CopilotIcon />
      {props.isError ? (
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
