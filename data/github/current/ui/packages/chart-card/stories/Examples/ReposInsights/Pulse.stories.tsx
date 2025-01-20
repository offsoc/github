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

export const CommitsPerUser: StoryObj<ChartCardProps> = {
  args: {
    size: 'medium',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <ChartCard {...args}>
      <ChartCard.Title>Commits per user</ChartCard.Title>
      <ChartCard.Chart
        series={[
          {
            name: 'Commits',
            data: [502, 489, 461, 437],
            type: 'column',
          },
        ]}
        xAxisTitle="Users"
        xAxisOptions={{categories: ['tbenning', 'smockle', 'andrialexandrou', 'ansballard']}}
        yAxisTitle="Commits"
        type="column"
      />
    </ChartCard>
  ),
}
CommitsPerUser.storyName = 'Pulse — Commits Per User (Bar Chart)'
