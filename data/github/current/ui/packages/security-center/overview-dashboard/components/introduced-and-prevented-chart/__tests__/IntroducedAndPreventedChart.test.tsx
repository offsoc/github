import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import {IntroducedAndPreventedChart} from '../IntroducedAndPreventedChart'
import {useIntroducedAndPreventedChartData} from '../use-introduced-and-prevented-chart-data'

jest.mock('../use-introduced-and-prevented-chart-data')
function mockUseIntroducedAndPreventedChartData<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useIntroducedAndPreventedChartData as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSuccess: true,
    data: [],
    ...result,
  })
}

describe('IntroducedAndPreventedChart', () => {
  const props = {
    query: 'archived:false',
    startDate: '2022-01-01',
    endDate: '2023-01-31',
  }

  it('renders the loading spinner', () => {
    mockUseIntroducedAndPreventedChartData({
      isPending: true,
    })

    render(<IntroducedAndPreventedChart {...props} />)

    expect(screen.getByText('Introduced vs. Prevented')).toBeInTheDocument()
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  it('should render', async () => {
    mockUseIntroducedAndPreventedChartData({
      isSuccess: true,
      data: [
        {label: 'Introduced', data: [{x: '2024-01-01', y: 1}]},
        {label: 'Prevented', data: [{x: '2024-01-01', y: 2}]},
      ],
    })

    render(<IntroducedAndPreventedChart {...props} />)

    expect(screen.getByText('Introduced vs. Prevented')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })

  it('displays a error state', async () => {
    mockUseIntroducedAndPreventedChartData({
      isError: true,
    })

    render(<IntroducedAndPreventedChart {...props} />)

    expect(screen.getByText('Introduced vs. Prevented')).toBeInTheDocument()
    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })

  it('displays a no data state', async () => {
    mockUseIntroducedAndPreventedChartData({
      data: [],
    })

    render(<IntroducedAndPreventedChart {...props} />)

    expect(screen.getByText('Introduced vs. Prevented')).toBeInTheDocument()
    expect(await screen.findByTestId('no-data')).toBeInTheDocument()
  })
})
