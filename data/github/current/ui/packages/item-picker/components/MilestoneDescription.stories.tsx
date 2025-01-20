import type {MilestoneDescriptionProps} from './MilestoneDescription'
import {MilestoneDescription} from './MilestoneDescription'
import type {Meta} from '@storybook/react'

const pastDateTime = () => {
  const date = new Date()
  date.setDate(date.getDate() - 2)
  return date.toISOString()
}

const futureDateTime = () => {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  return date.toISOString()
}

const meta = {
  title: 'MilestoneDescription',
  component: MilestoneDescription,
} satisfies Meta<MilestoneDescriptionProps>

export default meta

const args = {
  closed: false,
  dueOn: null,
  progressPercentage: null,
  closedAt: null,
  showProgressPercentage: true,
}

export const NoDueDate = {args}

export const FutureDueDate = {
  args: {...args, dueOn: futureDateTime(), progressPercentage: 30},
}

export const PastDueDate = {args: {...args, dueOn: pastDateTime()}}

export const ClosedMilestone = {args: {...args, closed: true, closedAt: pastDateTime()}}
