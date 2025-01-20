import {Box} from '@primer/react'
import {memo} from 'react'

import type {Milestone as IMilestone} from '../../../api/common-contracts'
import {LinkCell} from './link-cell'

interface MilestoneProps {
  milestone: IMilestone | undefined
  isDisabled?: boolean
}

export const Milestone: React.FC<MilestoneProps> = memo(function Milestone({milestone, isDisabled}) {
  return (
    <Box sx={{alignItems: 'center', overflow: 'hidden', flex: '1', height: '20px', display: 'flex'}}>
      {milestone && (
        <LinkCell href={milestone.url} muted isDisabled={isDisabled}>
          {milestone.title}
        </LinkCell>
      )}
    </Box>
  )
})
