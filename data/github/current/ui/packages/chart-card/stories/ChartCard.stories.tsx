import type {Meta, StoryObj} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../ChartCard'

const meta = {
  title: 'Recipes/ChartCard',
  component: ChartCard,
  parameters: {
    controls: {expanded: true, sort: 'requiredFirst'},
  },
} satisfies Meta<typeof ChartCard>

export default meta

export const Example: StoryObj<ChartCardProps> = {
  args: {
    size: 'medium',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Accessible Chart</ChartCard.Title>
      <ChartCard.Description>Chart of issues over time</ChartCard.Description>
      <ChartCard.Chart
        series={[
          {
            name: 'Issues',
            data: [1, 2, 1, 4, 3, 6, 5, 3, 2, 12],
            type: 'line',
          },
          {
            name: 'Pull Requests',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10],
            type: 'line',
          },
        ]}
        xAxisTitle={'Time'}
        xAxisOptions={{
          type: 'datetime',
          labels: {
            format: 'Jan {value}',
          },
        }}
        yAxisTitle={'Issues'}
        yAxisOptions={{
          labels: {
            formatter: ({value}) => `${value} issues`,
          },
        }}
        plotOptions={{
          series: {
            pointStart: 2012,
          },
        }}
        type={'line'}
      />
    </ChartCard>
  ),
}
Example.storyName = 'ChartCard'
