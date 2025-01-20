import type {CopilotMarkdownToolbarButtonProps} from '../CopilotMarkdownToolbarButton'

export function getCopilotMarkdownToolbarButtonProps(): CopilotMarkdownToolbarButtonProps {
  return {
    anchorId: 'copilot-md-menu-anchor-abcdef',
    userLogin: 'testuser',
    ghostPilotAvailable: true,
    ghostPilotEnrolled: true,
    pullRequestSummaryEnabled: true,
  }
}
