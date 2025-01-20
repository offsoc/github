import {useRef, useState} from 'react'
import {Box, Button, Heading, Text} from '@primer/react'
import {GearIcon} from '@primer/octicons-react'
import {graphql, useFragment} from 'react-relay'
import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {ItemPickerMilestones} from './ItemPickerMilestones'
import type {SubmittedMilestone} from './types'

import type {ItemPickerMilestonesBox_SelectedMilestonesFragment$key} from './__generated__/ItemPickerMilestonesBox_SelectedMilestonesFragment.graphql'

export type ItemPickerMilestonesBoxProps = {
  owner: string
  repo: string
  selectedMilestonesKey: ItemPickerMilestonesBox_SelectedMilestonesFragment$key | null
  sx?: BetterSystemStyleObject
  title: string
  onSubmit?: (selectedItem: SubmittedMilestone | null) => void
}

export function ItemPickerMilestonesBox({selectedMilestonesKey, ...props}: ItemPickerMilestonesBoxProps) {
  const milestonesButtonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const milestone = useFragment(
    graphql`
      fragment ItemPickerMilestonesBox_SelectedMilestonesFragment on Milestone {
        ...ItemPickerMilestones_SelectedMilestoneFragment
        title
        url
        dueOn
        progressPercentage
      }
    `,
    selectedMilestonesKey,
  )

  return (
    <>
      <Button
        ref={milestonesButtonRef}
        variant="invisible"
        size="small"
        trailingAction={GearIcon}
        block
        sx={{
          '[data-component=buttonContent]': {flex: '1 1 auto', justifyContent: 'left'},
          mb: 1,
        }}
        onClick={() => {
          setOpen(!open)
        }}
        {...testIdProps('item-picker-milestones-box-edit-milestones-button')}
      >
        <Heading as="h3" sx={{color: 'fg.muted', fontSize: 0}}>
          Milestones
        </Heading>
        <span className="sr-only">Edit Milestones</span>
      </Button>

      <div {...testIdProps('item-picker-milestones-box-milestones')}>
        {milestone ? (
          <Button
            as="a"
            href={milestone.url}
            target="_blank"
            variant="invisible"
            sx={{
              width: '100%',
              height: 'auto',
              py: 2,
              '[data-component=buttonContent]': {justifyContent: 'left'},
            }}
          >
            <Box sx={{display: 'flex', width: '100%'}}>
              <Box sx={{display: 'flex', alignItems: 'center', mr: 2}}>
                <ProgressIcon progress={milestone.progressPercentage / 100} />
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <Text sx={{color: 'fg.default', fontWeight: 600}}>{milestone.title}</Text>
                <Text sx={{color: 'fg.muted', fontWeight: 'normal'}}>{getDueDescription(milestone.dueOn)}</Text>
              </Box>
            </Box>
          </Button>
        ) : (
          <Text sx={{color: 'fg.muted', px: 2}}>No Milestone</Text>
        )}
      </div>

      <ItemPickerMilestones
        {...props}
        open={open}
        setOpen={setOpen}
        milestonesButtonRef={milestonesButtonRef}
        selectedMilestonesKey={milestone ?? null}
      />
    </>
  )
}

const getDueDescription = (dueDate?: string | null) => {
  if (!dueDate) return 'No due date'
  const dueOn = new Date(Date.parse(dueDate))
  return `Due on ${dueOn.toLocaleString('default', {month: 'short'})} ${dueOn.getDate()}`
}

const ProgressIcon = ({progress}: {progress: number}) => {
  return (
    <svg role="presentation" width="16" height="16" data-circumference="38" style={{transform: 'rotate(-90deg)'}}>
      {progress < 1 ? null : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0206 11.1074C9.68518 11.3949 9.18014 11.3561 8.8926 11.0206L5.8926 7.52061C5.62055 7.20322 5.63873 6.72989 5.93432 6.4343L7.43432 4.9343C7.74674 4.62188 8.25327 4.62188 8.56569 4.9343C8.87811 5.24672 8.87811 5.75325 8.56569 6.06567L7.58953 7.04182L10.1074 9.97935C10.3949 10.3148 10.3561 10.8198 10.0206 11.1074Z"
          fill="var(--fgColor-done, var(--color-done-fg))"
        />
      )}

      <circle
        stroke="var(--borderColor-default, var(--color-border-default))"
        strokeWidth="2"
        fill="transparent"
        cx="50%"
        cy="50%"
        r="6"
      />
      <circle
        style={{transition: 'stroke-dashoffset 0.35s'}}
        stroke="var(--fgColor-done, var(--color-done-fg))"
        strokeWidth="2"
        strokeDasharray={38}
        strokeDashoffset={38 - progress * 38}
        strokeLinecap="round"
        fill="transparent"
        cx="50%"
        cy="50%"
        r="6"
      />
    </svg>
  )
}
