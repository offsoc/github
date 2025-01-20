import {Button, Tooltip} from '@primer/react'

import {LABELS} from './constants/labels'

export type CreateIssueButtonLoadingProps = {
  label: string
  size?: 'small' | 'medium'
}

export const CreateIssueButtonLoading = ({
  label,
  size = 'medium',
}: CreateIssueButtonLoadingProps): JSX.Element | null => {
  return (
    <Tooltip aria-label={LABELS.loadingTooltip}>
      <Button size={size} disabled>
        {label}
      </Button>
    </Tooltip>
  )
}
