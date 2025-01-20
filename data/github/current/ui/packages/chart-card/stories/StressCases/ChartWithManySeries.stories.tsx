import type {Meta} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../ChartCard'

const meta = {
  title: 'Recipes/ChartCard/Stress Cases',
  component: ChartCard,
  parameters: {
    controls: {expanded: true, sort: 'requiredFirst'},
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const ChartWithManySeries = {
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
            name: 'Pull Requests',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10],
            type: 'line',
          },
          {
            name: 'Pull Requests 2',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 2),
            type: 'line',
          },
          {
            name: 'Pull Requests 3',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 4),
            type: 'line',
          },
          {
            name: 'Pull Requests 4',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 6),
            type: 'line',
          },
          {
            name: 'Pull Requests 5',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 8),
            type: 'line',
          },
          {
            name: 'Pull Requests 6',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 10),
            type: 'line',
          },
          {
            name: 'Pull Requests 7',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 12),
            type: 'line',
          },
          {
            name: 'Pull Requests 8',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 14),
            type: 'line',
          },
          {
            name: 'Pull Requests 9',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 16),
            type: 'line',
          },
          {
            name: 'Pull Requests 10',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 18),
            type: 'line',
          },
          {
            name: 'Pull Requests 11',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 20),
            type: 'line',
          },
          {
            name: 'Pull Requests 12',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10].map(x => x + 22),
            type: 'line',
          },
        ]}
        xAxisTitle={'Time'}
        yAxisTitle={'Pull Requests'}
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
