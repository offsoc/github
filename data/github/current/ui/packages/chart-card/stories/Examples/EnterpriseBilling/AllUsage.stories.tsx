import type {Meta, StoryObj} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../../ChartCard'

const meta = {
  title: 'Recipes/ChartCard/Examples/Enterprise Billing',
  component: ChartCard,
  parameters: {
    controls: {disable: true, exclude: /.*/g}, // Hide controls, since this story should already be using the correct values
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const AllUsage: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>All usage (w/o cost centers)</ChartCard.Title>
      <ChartCard.Description>Mar 1 - Mar 31, 2024</ChartCard.Description>
      <ChartCard.Chart
        series={[
          {
            name: 'Usage',
            data: [2500, 2700, 2700, 5000, 9700, 12500, 15100, 18000, 20000, 21000, 22000],
            lineWidth: 2,
            type: 'areaspline',
            color: 'var(--data-green-color-emphasis, var(--data-green-color))',
          },
        ]}
        xAxisTitle={'Time'}
        yAxisTitle={'Billing'}
        xAxisOptions={{
          type: 'datetime',
          labels: {
            format: '{value:%b %e}',
          },
          title: {
            text: null,
          },
          gridLineDashStyle: 'Solid',
        }}
        yAxisOptions={{
          labels: {
            format: '${value:,.2f}',
          },
          gridLineDashStyle: 'Solid',
          title: {
            text: null,
          },
        }}
        plotOptions={{
          series: {
            pointStart: Date.UTC(2024, 2, 1, 0, 0, 0, 0),
            pointInterval: 24 * 3600 * 1000, // one day
            marker: {
              enabled: false,
            },
          },
        }}
        type={'areaspline'}
        overrideOptionsNotRecommended={{
          tooltip: {
            pointFormat:
              // eslint-disable-next-line github/unescaped-html-literal
              '<tr><td style="padding-top:var(--base-size-4)"><span style="color:{point.color}">●</span> {series.name}</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>${point.y:,.2f}</strong></td></tr>',
          },
        }}
      />
    </ChartCard>
  ),
}
AllUsage.storyName = 'All Usage (Areaspline Chart)'
