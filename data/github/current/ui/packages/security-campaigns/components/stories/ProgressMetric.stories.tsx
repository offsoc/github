import type {Meta} from '@storybook/react'
import {ProgressMetric, type ProgressMetricProps} from '../ProgressMetric'

const meta = {
  title: 'Apps/Security Campaigns/Progress metric',
  component: ProgressMetric,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof ProgressMetric>

export default meta

const overdueDateInPast = () => {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date
}

const defaultArgs: Partial<ProgressMetricProps> = {
  openCount: 10,
  closedCount: 5,
  isSuccess: true,
  endsAt: (() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  })(),
  createdAt: (() => {
    const date = new Date()
    date.setDate(date.getDate() - 2)
    return date
  })(),
}

export const WithNoProgress = {
  args: {
    ...defaultArgs,
    openCount: 100,
    closedCount: 0,
  },
  render: (args: ProgressMetricProps) => <ProgressMetric {...args} />,
}

export const WithCampaignStartedSomeDaysAgo = {
  args: {
    ...defaultArgs,
  },
  render: (args: ProgressMetricProps) => <ProgressMetric {...args} />,
}

export const WithOverdueCampaign = {
  args: {
    ...defaultArgs,
    endsAt: overdueDateInPast(),
  },
  render: (args: ProgressMetricProps) => <ProgressMetric {...args} />,
}

export const withCampaignStartedToday = {
  args: {
    ...defaultArgs,
    createdAt: new Date(),
  },
  render: (args: ProgressMetricProps) => <ProgressMetric {...args} />,
}

export const WithCompletedCampaign = {
  args: {
    ...defaultArgs,
    openCount: 0,
    closedCount: 10,
  },
  render: (args: ProgressMetricProps) => <ProgressMetric {...args} />,
}

export const WithOverdueCampaignButCompleted = {
  args: {
    ...defaultArgs,
    endsAt: overdueDateInPast(),
    openCount: 0,
    closedCount: 10,
  },
  render: (args: ProgressMetricProps) => <ProgressMetric {...args} />,
}
