import type {Meta, StoryObj} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../../ChartCard'

const meta = {
  title: 'Recipes/ChartCard/Examples/Org Insights',
  component: ChartCard,
  parameters: {
    controls: {disable: true, exclude: /.*/g}, // Hide controls, since this story should already be using the correct values
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const OpenSecurityAdvisories: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Open Security Advisories</ChartCard.Title>
      <ChartCard.Chart
        series={[
          {
            name: 'Usage',
            data: [2100, 9000, 7600, 1700],
            type: 'column',
            colorByPoint: true,
          },
        ]}
        colors={[
          'var(--data-gray-color-emphasis, var(--data-gray-color))',
          'var(--data-yellow-color-emphasis, var(--data-yellow-color))',
          'var(--data-orange-color-emphasis, var(--data-orange-color))',
          'var(--data-red-color-emphasis, var(--data-red-color))',
        ]}
        xAxisTitle={'Time'}
        yAxisTitle={'Billing'}
        xAxisOptions={{
          title: {
            text: null,
          },
          categories: ['Low', 'Medium', 'High', 'Critical'],
          gridLineWidth: 0,
        }}
        yAxisOptions={{
          gridLineDashStyle: 'Solid',
          title: {
            text: null,
          },
        }}
        type={'column'}
      />
    </ChartCard>
  ),
}
OpenSecurityAdvisories.storyName = 'Open Security Advisories (Bar Chart)'
