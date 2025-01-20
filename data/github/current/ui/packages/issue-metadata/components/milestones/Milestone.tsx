import type {MilestonePickerMilestone$data} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import {noop} from '@github-ui/noop'
import {ActionList, Box} from '@primer/react'

import {TEST_IDS} from '../../constants/test-ids'
import {ProgressIcon} from './ProgressIcon'
import {MilestoneDescription} from '@github-ui/item-picker/MilestoneDescription'

type MilestoneProps = {
  milestone?: MilestonePickerMilestone$data | null
  anchorProps?: React.HTMLAttributes<HTMLElement>
}

export function Milestone({milestone, anchorProps}: MilestoneProps) {
  return (
    <>
      {milestone ? (
        <ActionList.LinkItem
          href={milestone.url || '#'}
          target="_blank"
          key={milestone.id}
          data-testid={TEST_IDS.milestoneContainer}
          {...anchorProps}
          onClick={noop}
        >
          <ActionList.LeadingVisual>
            <ProgressIcon progress={milestone.progressPercentage / 100} />
          </ActionList.LeadingVisual>
          {milestone.title}
          <ActionList.Description variant="block">
            <MilestoneDescription
              closed={milestone.closed}
              closedAt={milestone.closedAt}
              progressPercentage={milestone.progressPercentage}
              dueOn={milestone.dueOn}
              showProgressPercentage={true}
            />
          </ActionList.Description>
        </ActionList.LinkItem>
      ) : (
        <Box sx={{height: '0px', p: 0, m: 0, border: '0', visibility: 'hidden'}} {...anchorProps} />
      )}
    </>
  )
}
