import type {Meta, StoryObj} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../../ChartCard'

const meta = {
  title: 'Recipes/ChartCard/Examples/Security',
  component: ChartCard,
  parameters: {
    controls: {disable: true, exclude: /.*/g}, // Hide controls, since this story should already be using the correct values
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const OpenAlertsByAge: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Open Alerts by Age</ChartCard.Title>
      <ChartCard.Chart
        series={[
          {
            name: '<30 days',
            data: [700, 500, 1000, 500, 1000, 500, 1000, 500],
            type: 'areaspline',
          },
          {
            name: '31 - 59 days',
            data: [1000, 500, 1000, 500, 1000, 500, 1000, 500],
            type: 'areaspline',
          },
          {
            name: '60 - 89 days',
            data: [500, 1000, 500, 1000, 500, 1000, 500, 1000],
            type: 'areaspline',
          },
          {
            name: '90+ days',
            data: [13000, 13000, 13000, 12800, 12800, 12600, 12500, 12500],
            type: 'areaspline',
          },
        ]}
        xAxisTitle={'Time'}
        yAxisTitle={'Number of open alerts'}
        xAxisOptions={{
          title: {
            text: null,
          },
          type: 'datetime',
          labels: {
            format: '{value:%b %e}',
          },
          gridLineDashStyle: 'ShortDash',
        }}
        yAxisOptions={{
          gridLineDashStyle: 'ShortDash',
          title: {
            text: null,
          },
          labels: {
            formatter: amount => amount.value.toLocaleString(),
          },
          min: 0,
          max: 16000,
          tickInterval: 2000,
        }}
        plotOptions={{
          series: {
            pointStart: Date.UTC(2024, 1, 10, 0, 0, 0, 0),
            pointInterval: 4 * 24 * 3600 * 1000, // four days
            stacking: 'normal',
            marker: {
              enabled: false,
            },
          },
        }}
        type={'areaspline'}
        overrideOptionsNotRecommended={{
          legend: {
            reversed: true,
            verticalAlign: 'top',
            align: 'left',
            layout: 'horizontal',
          },
        }}
      />
    </ChartCard>
  ),
}
OpenAlertsByAge.storyName = 'Open Alerts by Age (Areaspline Chart)'
