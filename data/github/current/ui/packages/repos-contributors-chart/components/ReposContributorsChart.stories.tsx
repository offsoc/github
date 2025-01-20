import type {Meta} from '@storybook/react'
import ReposContributorsChart, {type ReposContributorsChartProps} from './ReposContributorsChart'
import contributorsData from '../test-utils/small-data'
import type {RawContributor} from '../repos-contributors-chart-types'
import {mergeWeeksFromContributors} from '../helpers/merge-weeks-from-contributors'
import {transformWeek} from '../helpers/transform-weeks'
import {computeMetricsFromWeeks} from '../helpers/compute-metrics-from-weeks'

const contributors = contributorsData as RawContributor[]
const {totals, metrics} = computeMetricsFromWeeks(mergeWeeksFromContributors(contributors))

const meta = {
  title: 'Recipes/ReposContributorsChart',
  component: ReposContributorsChart,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    selectedMetric: {
      control: 'radio',
      options: ['commits', 'additions', 'deletions'],
    },
  },
} satisfies Meta<typeof ReposContributorsChart>

export default meta

const defaultArgs: Partial<ReposContributorsChartProps> = {
  weeks: contributors[contributors.length - 1]!.weeks.map(transformWeek),
  selectedMetric: 'commits',
  totals,
  metrics,
}

export const ReposContributorsChartSingleExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ReposContributorsChartProps) => <ReposContributorsChart {...args} />,
}

export const ReposContributorsChartFullExample = {
  args: {
    ...defaultArgs,
    weeks: mergeWeeksFromContributors(contributors),
  },
  render: (args: ReposContributorsChartProps) => <ReposContributorsChart {...args} />,
}
