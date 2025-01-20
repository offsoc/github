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

export const AlertActivity: StoryObj<ChartCardProps> = {
  args: {
    size: 'large',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Alert activity</ChartCard.Title>
      <ChartCard.Chart
        series={[
          {
            name: 'New',
            data: [200, 50, 150, 5, 500, 25, 10],
            type: 'column',
            color: 'var(--bgColor-success-muted)',
            borderColor: 'var(--bgColor-success-emphasis)',
            borderWidth: 2,
            borderRadius: 0,
          },
          {
            name: 'Closed',
            data: [-5, -40, -20, -50, -275, -175, -100],
            type: 'column',
            color: 'var(--bgColor-done-muted)',
            borderColor: 'var(--bgColor-done-emphasis)',
            borderWidth: 2,
            borderRadius: 0,
          },
          {
            name: 'Net alert activity',
            data: [195, 10, 130, -45, 225, -150, -99],
            type: 'line',
            dashStyle: 'LongDash',
          },
        ]}
        xAxisTitle={'Number of alerts'}
        yAxisTitle={'Time period'}
        xAxisOptions={{
          title: {
            text: null,
          },
          categories: [
            'Feb 10 - Feb 13',
            'Feb 14 - Feb 17',
            'Feb 18 - Feb 21',
            'Feb 22 - Feb 25',
            'Feb 26 - Mar 1',
            'Mar 2 - Mar 6',
            'Mar 7 - Mar 11',
          ],
          gridLineWidth: 0,
        }}
        yAxisOptions={{
          gridLineDashStyle: 'ShortDash',
          title: {
            text: null,
          },
          max: 600,
          min: -400,
        }}
        type={'column'}
        plotOptions={{
          column: {
            stacking: 'normal',
            groupPadding: 0.1,
          },
        }}
      />
    </ChartCard>
  ),
}
AlertActivity.storyName = 'Alert Activity (Bar Chart)'
