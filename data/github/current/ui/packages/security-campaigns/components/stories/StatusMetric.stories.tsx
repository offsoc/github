import type {Meta} from '@storybook/react'
import {StatusMetric, type StatusMetricProps} from '../StatusMetric'

const meta = {
  title: 'Apps/Security Campaigns/Status metric',
  component: StatusMetric,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof StatusMetric>

export default meta

const dueDateinPast = () => {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date
}

const dueDateinFuture = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date
}
const defaultArgs: Partial<StatusMetricProps> = {
  endsAt: dueDateinFuture(),
  isCompleted: false,
}

export const WithInProgressStatus = {
  args: defaultArgs,
  render: (args: StatusMetricProps) => <StatusMetric {...args} />,
}

export const WithOverdueStatus = {
  args: {
    ...defaultArgs,
    endsAt: dueDateinPast(),
  },
  render: (args: StatusMetricProps) => <StatusMetric {...args} />,
}

export const WithCompletedStatusAndOverdue = {
  args: {
    ...defaultArgs,
    endsAt: dueDateinPast(),
    isCompleted: true,
  },
  render: (args: StatusMetricProps) => <StatusMetric {...args} />,
}

export const withCompletedButNotOverdue = {
  args: {
    ...defaultArgs,
    isCompleted: true,
    endsAt: dueDateinFuture(),
  },
  render: (args: StatusMetricProps) => <StatusMetric {...args} />,
}
