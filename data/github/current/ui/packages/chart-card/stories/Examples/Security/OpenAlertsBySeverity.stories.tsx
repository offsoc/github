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

export const OpenAlertsBySeverity: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Open Alerts by Severity</ChartCard.Title>
      <ChartCard.Chart
        series={[
          {
            name: 'Critical',
            data: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
            type: 'areaspline',
            color: 'var(--data-red-color-emphasis, var(--data-red-color))',
            dashStyle: 'Dot',
          },
          {
            name: 'High',
            data: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000],
            type: 'areaspline',
            color: 'var(--data-orange-color-emphasis, var(--data-orange-color))',
            dashStyle: 'Dash',
          },
          {
            name: 'Medium',
            data: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
            type: 'areaspline',
            color: 'var(--data-yellow-color-emphasis, var(--data-yellow-color))',
            dashStyle: 'Solid',
          },
          {
            name: 'Low',
            data: [1400, 1400, 1400, 1400, 1400, 1900, 1900, 1900],
            type: 'areaspline',
            color: 'var(--data-gray-color-emphasis, var(--data-gray-color))',
            dashStyle: 'LongDash',
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
OpenAlertsBySeverity.storyName = 'Open Alerts by Severity (Areaspline Chart)'
