import DefaultCopilotBadge from '@github-ui/copilot-chat/components/CopilotBadge'

interface CopilotBadgeProps {
  isLoading: boolean
  isError: boolean
}

const loadingBackground = 'var(--bgColor-inset, var(--color-bg-inset))'

const errorBackground = 'var(--bgColor-danger-muted, var(--color-danger-subtle))'
const errorBorderColor = 'var(--borderColor-danger-muted, var(--color-danger-muted))'
const errorFillColor = 'danger.fg'

const readyBackground = 'var(--bgColor-accent-muted, var(--color-bg-accent))'
const readyBorderColor = 'var(--borderColor-accent-muted, var(--color-accent-muted))'
const readyFillColor = 'accent.fg'

export const CopilotBadge = ({isLoading, isError}: CopilotBadgeProps) => (
  <DefaultCopilotBadge
    isLoading={isLoading}
    zIndex={1}
    bg={isLoading ? loadingBackground : isError ? errorBackground : readyBackground}
    fill={isError ? errorFillColor : readyFillColor}
    borderColor={isLoading ? undefined : isError ? errorBorderColor : readyBorderColor}
  />
)
