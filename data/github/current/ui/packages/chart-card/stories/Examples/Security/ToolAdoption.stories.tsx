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

export const ToolAdoption: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Tool adoption</ChartCard.Title>
      <ChartCard.Description>The percentage of repositories with at least one feature enabled.</ChartCard.Description>
      <ChartCard.Chart
        series={[
          {
            name: 'Alerts',
            data: [100, 100, 100, 100, 99.7, 100, 100, 100, 100],
            type: 'line',
            dashStyle: 'ShortDash',
          },
          {
            name: 'Security updates',
            data: [100, 99.2, 100, 100, 100, 100, 99.5, 100, 100],
            type: 'line',
            dashStyle: 'ShortDash',
          },
        ]}
        xAxisTitle={'Time'}
        yAxisTitle={'Repositores enabled (%)'}
        xAxisOptions={{
          gridLineDashStyle: 'ShortDash',
          title: {
            text: null,
          },
          type: 'datetime',
          labels: {
            format: '{value:%b %e}',
          },
        }}
        yAxisOptions={{
          gridLineDashStyle: 'ShortDash',
          min: 0,
          max: 100,
          tickInterval: 20,
        }}
        type={'line'}
        plotOptions={{
          series: {
            pointStart: Date.UTC(2024, 1, 10, 0, 0, 0, 0),
            pointInterval: 4 * 24 * 3600 * 1000, // four days
            marker: {
              enabled: false,
            },
          },
        }}
      />
    </ChartCard>
  ),
}
ToolAdoption.storyName = 'Tool Adoption (Line Chart)'
