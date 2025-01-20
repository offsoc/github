import type {Meta, StoryObj} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../../ChartCard'

const meta = {
  title: 'Recipes/ChartCard/Examples/Repos Insights',
  component: ChartCard,
  parameters: {
    controls: {disable: true, exclude: /.*/g}, // Hide controls, since this story should already be using the correct values
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const ContributionActivity: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Contribution activity</ChartCard.Title>
      <ChartCard.Description>Count of total contribution activity to Discussions, Issues and PRs</ChartCard.Description>
      <ChartCard.Chart
        series={[
          {
            name: 'Discussions',
            data: [70, 30, 55, 70, 35, 0],
            type: 'line',
          },
          {
            name: 'Issues',
            data: [3, 1, 2, 3, 4, 0],
            type: 'line',
            dashStyle: 'ShortDash',
          },
          {
            name: 'Pull Requests',
            data: [2, 1, 3, 5, 4, 0],
            type: 'line',
            dashStyle: 'Dash',
          },
        ]}
        xAxisTitle={'Timeline'}
        yAxisTitle={'Quantity'}
        xAxisOptions={{
          type: 'datetime',
          labels: {
            format: '{value:%b %e}',
          },
          gridLineDashStyle: 'Dash',
        }}
        yAxisOptions={{
          gridLineDashStyle: 'Solid',
        }}
        plotOptions={{
          series: {
            pointStart: Date.UTC(2024, 1, 8, 0, 0, 0, 0),
            pointInterval: 7 * 24 * 3600 * 1000, // seven days
            marker: {
              enabled: false,
            },
          },
        }}
        type={'line'}
      />
    </ChartCard>
  ),
}
ContributionActivity.storyName = 'Community — Contribution Activity (Line Chart)'
