import type {CopilotSummaryErrorBannerProps} from '../CopilotSummaryErrorBanner'

export function getCopilotSummaryErrorBannerProps(): CopilotSummaryErrorBannerProps {
  return {
    bannerMessage: 'Copilot encountered a temporary error.',
    isServerError: true,
  }
}
