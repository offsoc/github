import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ChartCard} from '../ChartCard'

interface CreateChartProps {
  className?: string
}

function createChartCard({className}: CreateChartProps = {}) {
  return render(
    <ChartCard className={className}>
      <ChartCard.Title>Accessible Chart</ChartCard.Title>
      <ChartCard.Description>Chart of issues over time</ChartCard.Description>
      <ChartCard.Chart
        series={[
          {
            name: 'Issues',
            data: [1, 2, 1, 4, 3, 6, 5, 3, 2, 12],
            type: 'line',
          },
          {
            name: 'Pull Requests',
            data: [3, 12, 5, 7, 6, 11, 2, 9, 1, 10],
            type: 'line',
          },
        ]}
        xAxisTitle={'Time'}
        xAxisOptions={{
          type: 'datetime',
          labels: {
            format: 'Jan {value}',
          },
        }}
        yAxisTitle={'Issues'}
        yAxisOptions={{
          labels: {
            formatter: ({value}) => `${value} issues`,
          },
        }}
        plotOptions={{
          series: {
            pointStart: 2012,
          },
        }}
        type={'line'}
      />
    </ChartCard>,
  )
}

test('ChartCard renders Highcharts', () => {
  createChartCard()

  const renderedChartCard = screen.getByTestId('chart-card')
  expect(renderedChartCard).toBeInTheDocument()
  expect(renderedChartCard.innerHTML).toContain('class="highcharts-container "')
})

test('CSS classes can be passed to ChartCard', () => {
  createChartCard({className: 'my-custom-class'})
  const renderedChartCard = screen.getByTestId('chart-card')
  expect(renderedChartCard).toBeInTheDocument()
  expect(renderedChartCard).toHaveClass('my-custom-class')
})
