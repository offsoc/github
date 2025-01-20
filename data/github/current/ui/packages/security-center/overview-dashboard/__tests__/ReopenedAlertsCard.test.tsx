import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {screen} from '@testing-library/react'

import {JSON_HEADER} from '../../common/utils/fetch-json'
import {render} from '../../test-utils/Render'
import {ReopenedAlertsCard} from '../components/ReopenedAlertsCard'

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

describe('ReopenedAlertsCard', () => {
  const query = 'archived: false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  it('renders the component with the correct props', () => {
    render(<ReopenedAlertsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Reopened alerts')).toBeInTheDocument()
  })

  it('fetches and displays the correct data without parallel loading', async () => {
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', false)

    const mockData = {
      count: 1337,
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<ReopenedAlertsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('1,337')).toBeInTheDocument()
  })

  it('fetches and displays the correct data with parallel loading', async () => {
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', true)

    const mockData = {
      count: 1,
    }

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<ReopenedAlertsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('displays a no data state on error without parallel loading', async () => {
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', false)

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<ReopenedAlertsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays a no data state on error with parallel loading', async () => {
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', true)

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: false,
      headers: new Headers(JSON_HEADER),
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      ok: true,
      headers: new Headers(JSON_HEADER),
    } as Response)

    render(<ReopenedAlertsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })

  it('displays error state when html is returned from server instead of json', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: async () => '<DOCUMENT',
      ok: true,
      headers: new Headers({'Content-Type': 'text/html'}),
    } as Response)

    render(<ReopenedAlertsCard query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByText('Data could not be loaded right now')).toBeInTheDocument()
  })
})
