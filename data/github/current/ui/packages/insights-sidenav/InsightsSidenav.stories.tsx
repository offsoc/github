import type {Meta} from '@storybook/react'
import {InsightsSidenav, type InsightsSidenavProps} from './InsightsSidenav'

const meta = {
  title: 'InsightsSidenav',
  component: InsightsSidenav,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof InsightsSidenav>

export default meta

const defaultArgs: Partial<InsightsSidenavProps> = {
  selectedKey: 'dependency_insights',
  showDependencies: true,
  showActionsUsageMetrics: true,
  showApi: true,
  urls: {
    dependency_insights: '#',
    actions_usage_metrics: '#',
    api: '#',
  },
}

export const InsightsSidenavExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: InsightsSidenavProps) => <InsightsSidenav {...args} />,
}
