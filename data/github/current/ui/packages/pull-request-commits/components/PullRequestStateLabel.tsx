import {StateLabel, type StateLabelProps} from '@primer/react'
import {useMemo} from 'react'
import {clsx} from 'clsx'

const STATE_LABEL_DATA = {
  open: {
    description: 'Open',
    status: 'pullOpened',
  },
  closed: {
    description: 'Closed',
    status: 'pullClosed',
  },
  queued: {
    description: 'Queued',
    status: 'pullQueued',
  },
  merged: {
    description: 'Merged',
    status: 'pullMerged',
  },
  draft: {
    description: 'Draft',
    status: 'draft',
  },
}

export type PullRequestState = keyof typeof STATE_LABEL_DATA

interface PullRequestStateLabelProps {
  className?: string
  state: PullRequestState
}

export function PullRequestStateLabel({className, state}: PullRequestStateLabelProps) {
  const stateLabel = useMemo(() => STATE_LABEL_DATA[state], [state])

  return (
    <StateLabel className={clsx('flex-self-start', className)} status={stateLabel.status as StateLabelProps['status']}>
      {stateLabel.description}
    </StateLabel>
  )
}
