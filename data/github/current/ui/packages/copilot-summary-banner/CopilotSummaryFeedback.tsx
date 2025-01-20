import {ThumbsdownIcon, ThumbsupIcon} from '@primer/octicons-react'
import {Box, IconButton, Tooltip} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'

export interface CopilotSummaryFeedbackProps {
  onClick: (feedback: 'positive' | 'negative') => void
  useCase: 'summary' | 'text completion' | 'summary or text completion'
}

export const CopilotSummaryFeedback = (props: CopilotSummaryFeedbackProps) => {
  return (
    <Box sx={{display: 'flex'}}>
      <Tooltip id="copilot-summary-good-response" aria-label={`Good ${props.useCase}`} direction="ne" noDelay>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          className="copilot-summary-feedback-icon"
          aria-label={`Good ${props.useCase} response`}
          icon={ThumbsupIcon}
          size="small"
          variant="invisible"
          onClick={() => props.onClick('positive')}
          sx={{svg: {color: 'fg.muted', margin: 0}}}
          {...testIdProps('summary-good-response-button')}
        />
      </Tooltip>
      <Tooltip id="copilot-summary-bad-response" aria-label={`Bad ${props.useCase}`} noDelay>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          className="copilot-summary-feedback-icon"
          aria-label={`Bad ${props.useCase} response`}
          icon={ThumbsdownIcon}
          size="small"
          variant="invisible"
          onClick={() => props.onClick('negative')}
          sx={{svg: {color: 'fg.muted', margin: 0}}}
          {...testIdProps('summary-bad-response-button')}
        />
      </Tooltip>
    </Box>
  )
}
