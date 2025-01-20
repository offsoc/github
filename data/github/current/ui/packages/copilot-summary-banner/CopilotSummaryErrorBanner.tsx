import {CopilotErrorIcon, CopilotWarningIcon} from '@primer/octicons-react'
import {Box, Flash, Text} from '@primer/react'

export interface CopilotSummaryErrorBannerProps {
  bannerMessage: string
  isServerError: boolean
}

export function CopilotSummaryErrorBanner({bannerMessage, isServerError}: CopilotSummaryErrorBannerProps) {
  return (
    <Flash
      sx={{border: 'none', backgroundColor: 'transparent', padding: 0, paddingLeft: 1}}
      data-testid="copilot-summary-error-banner"
      variant="danger"
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <Box
          sx={{
            borderRadius: '100%',
            position: 'relative',
            bg: 'danger.subtle',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 2,
            border: '1px solid',
            borderColor: 'danger.fg',
          }}
          data-testid="copilot-summary-error-banner-icon"
        >
          {isServerError ? <CopilotErrorIcon size={12} /> : <CopilotWarningIcon size={12} />}
        </Box>
        <Text
          sx={{color: 'danger.fg', fontSize: 0, fontWeight: 500, paddingLeft: 1}}
          data-testid="copilot-summary-error-banner-message"
        >
          {bannerMessage}
        </Text>
      </Box>
    </Flash>
  )
}
