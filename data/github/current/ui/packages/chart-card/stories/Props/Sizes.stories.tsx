import type {Meta} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../ChartCard'
import type {Size} from '../../shared'

const meta = {
  title: 'Recipes/ChartCard/Props',
  component: ChartCard,
  parameters: {
    controls: {disable: true, exclude: /.*/g}, // Hide controls, since this story’s purpose is to show all variations
    options: {showPanel: false},
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const Sizes = {
  render: (args: ChartCardProps) => (
    <div className="d-flex flex-column gap-2">
      {['small', 'medium', 'large', 'xl', 'sparkline'].map(size => (
        <ChartCard {...args} size={size as Size} key={size}>
          <ChartCard.Title>{`Accessible chart | ${size}`}</ChartCard.Title>
          <ChartCard.Description>Chart of issues over time</ChartCard.Description>
          <ChartCard.Chart
            series={[
              {
                name: 'Issues',
                data: [1, 2, 1, 4, 3, 6, 5, 3, 2, 12],
                type: 'line',
              },
            ]}
            xAxisTitle={'Time'}
            yAxisTitle={'Issues'}
            plotOptions={{
              series: {
                pointStart: 2012,
              },
            }}
            type={'line'}
          />
        </ChartCard>
      ))}
    </div>
  ),
}
