import type {Meta} from '@storybook/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ChartCard, type ChartCardProps} from '../../ChartCard'
import {Label} from '@primer/react'
import {useMemo} from 'react'

const meta = {
  title: 'Recipes/ChartCard/Stress Cases',
  component: ChartCard,
  parameters: {
    controls: {expanded: true, sort: 'requiredFirst'},
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

function ChartWithThousandsOfDataPointsComponent(args: ChartCardProps) {
  /** An array of 10,000 tuples. Each tuple contains a date and a random number of commits on that date. */
  const thousandsOfDataPoints = useMemo(() => {
    const dataPoints: Array<[number, number]> = []
    for (
      let date = Date.now(), value = Math.floor(Math.random() * 40);
      dataPoints.length <= 10000;
      date = date - 86400000, value = Math.max(0, value + Math.floor(Math.random() * 10) - 5)
    ) {
      dataPoints.push([date, value])
    }
    return dataPoints
  }, [])
  const totalCommits = useMemo(
    () => thousandsOfDataPoints.reduce((total, [, value]) => total + value, 0),
    [thousandsOfDataPoints],
  )
  return (
    <ChartCard {...args}>
      <ChartCard.LeadingVisual>
        <GitHubAvatar src="https://avatars.githubusercontent.com/u/90379286?s=60&amp;v=4" size={40} />
      </ChartCard.LeadingVisual>
      <ChartCard.Title as="h4" sx={{fontSize: 1}}>
        accessibility-bot
      </ChartCard.Title>
      <ChartCard.Description sx={{fontSize: 1}}>{totalCommits.toLocaleString()} commits</ChartCard.Description>
      <ChartCard.TrailingVisual>
        <Label>#1</Label>
      </ChartCard.TrailingVisual>
      <ChartCard.Chart
        series={[
          {
            type: 'areaspline',
            name: 'Commits',
            data: thousandsOfDataPoints,
          },
        ]}
        xAxisTitle="Time"
        xAxisOptions={{
          type: 'datetime',
        }}
        yAxisTitle="Commits"
        plotOptions={{
          series: {
            marker: {
              enabled: false,
            },
          },
        }}
        type="areaspline"
      />
    </ChartCard>
  )
}
export const ChartWithThousandsOfDataPoints = {
  args: {
    size: 'medium',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => <ChartWithThousandsOfDataPointsComponent {...args} />,
}
