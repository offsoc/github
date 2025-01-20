import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EnterpriseServerStats} from '../EnterpriseServerStats'
import {getEnterpriseServerStatsProps} from '../test-utils/mock-data'
import {TimePeriod} from '../types'

const mockUseChartData = jest
  .fn()
  .mockImplementation((...args: unknown[]) => ({loading: true, error: undefined, title: 'Title', statKey: args[0]}))
jest.mock('../hooks/use-chart-data', () => {
  const {StatKey} = jest.requireActual('../hooks/use-chart-data')

  return {
    StatKey,
    useChartData: (...args: unknown[]) => mockUseChartData(...args),
  }
})

describe('EnterpriseServerStats component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Renders 5 chart titles while data is loading', () => {
    mockUseChartData.mockImplementation((...args: unknown[]) => {
      const [statKey] = args
      return {loading: true, error: undefined, title: `${statKey} Chart Title`, statKey}
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} />)

    const chartTitles = screen.queryAllByRole('heading', {level: 3})
    expect(chartTitles).toHaveLength(5)
    expect(chartTitles[0]).toHaveTextContent('issues Chart Title')
    expect(chartTitles[1]).toHaveTextContent('pulls Chart Title')
    expect(chartTitles[2]).toHaveTextContent('repos Chart Title')
    expect(chartTitles[3]).toHaveTextContent('users Chart Title')
    expect(chartTitles[4]).toHaveTextContent('orgs Chart Title')
  })

  test('Renders a loading indicator per chart while data is loading', () => {
    mockUseChartData.mockImplementation((...args: unknown[]) => {
      const [statKey] = args
      return {loading: true, error: undefined, title: 'Chart Title', statKey}
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} />)

    expect(screen.queryAllByTestId('loading-indicator')).toHaveLength(5)
  })

  test('Requests charts for the correct enterprise with the requested server and time period', () => {
    mockUseChartData.mockImplementation((...args: unknown[]) => {
      const [statKey] = args
      return {loading: true, error: undefined, title: `${statKey} Chart Title`, statKey}
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} timePeriod={TimePeriod.Month} />)

    expect(mockUseChartData).toHaveBeenCalledTimes(5)
    expect(mockUseChartData).toHaveBeenCalledWith('issues', {
      enterpriseSlug: 'enterprise-slug',
      server: 'server-id',
      period: TimePeriod.Month,
    })
    expect(mockUseChartData).toHaveBeenCalledWith('pulls', {
      enterpriseSlug: 'enterprise-slug',
      server: 'server-id',
      period: TimePeriod.Month,
    })
    expect(mockUseChartData).toHaveBeenCalledWith('repos', {
      enterpriseSlug: 'enterprise-slug',
      server: 'server-id',
      period: TimePeriod.Month,
    })
    expect(mockUseChartData).toHaveBeenCalledWith('users', {
      enterpriseSlug: 'enterprise-slug',
      server: 'server-id',
      period: TimePeriod.Month,
    })
    expect(mockUseChartData).toHaveBeenCalledWith('orgs', {
      enterpriseSlug: 'enterprise-slug',
      server: 'server-id',
      period: TimePeriod.Month,
    })
  })

  test('Renders 5 line-charts when data is done loading', () => {
    mockUseChartData.mockImplementation((...args: unknown[]) => {
      const [statKey] = args
      return {loading: false, error: undefined, title: `${statKey} Chart Title`, statKey, data: {}}
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} />)

    expect(screen.queryAllByTestId('line-chart')).toHaveLength(5)
  })

  test('Renders hero stats when data is done loading', () => {
    mockUseChartData.mockImplementation((...args: unknown[]) => {
      const [statKey] = args
      let heroStatsCount = 0
      switch (statKey) {
        case 'issues':
        case 'pulls':
          heroStatsCount = 1
          break
        case 'repos':
        case 'users':
          heroStatsCount = 2
          break
        case 'orgs':
          heroStatsCount = 3
          break
      }
      const heroStats = []
      for (let i = 1; i <= heroStatsCount; i++) {
        heroStats.push({label: `${statKey} hero stat label ${i}`, percentChange: i * 1.5, total: i * 1001})
      }
      return {
        loading: false,
        error: undefined,
        title: `${statKey} chart with ${heroStatsCount} heroStats`,
        statKey,
        data: {series: {columns: [], rows: []}, heroStats},
      }
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} timePeriod={TimePeriod.Month} />)

    expect(screen.queryAllByText('issues hero stat label 1')).toHaveLength(1)

    expect(screen.queryAllByText('pulls hero stat label 1')).toHaveLength(1)

    expect(screen.queryAllByText('repos hero stat label 1')).toHaveLength(1)
    expect(screen.queryAllByText('repos hero stat label 2')).toHaveLength(1)

    expect(screen.queryAllByText('users hero stat label 1')).toHaveLength(1)
    expect(screen.queryAllByText('users hero stat label 2')).toHaveLength(1)

    expect(screen.queryAllByText('orgs hero stat label 1')).toHaveLength(1)
    expect(screen.queryAllByText('orgs hero stat label 2')).toHaveLength(1)
    expect(screen.queryAllByText('orgs hero stat label 3')).toHaveLength(1)

    // Charts with at least 1 hero stat
    expect(screen.queryAllByText('1,001')).toHaveLength(5)
    expect(screen.queryAllByText('1.5%')).toHaveLength(5)

    // Charts with at least 2 hero stats
    expect(screen.queryAllByText('2,002')).toHaveLength(3)
    expect(screen.queryAllByText('3%')).toHaveLength(3)

    // Charts with at least 3 hero stats
    expect(screen.queryAllByText('3,003')).toHaveLength(1)
    expect(screen.queryAllByText('4.5%')).toHaveLength(1)
  })

  test('Does not render undefined percent change for hero stats', () => {
    mockUseChartData.mockImplementation((...args: unknown[]) => {
      const [statKey] = args
      return {
        loading: false,
        error: undefined,
        title: 'Title',
        statKey,
        data: {heroStats: [{label: `Label`, total: 1234}]},
      }
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} />)

    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  test('Passes error to any `line-chart` where a data fetch error occurs', () => {
    mockUseChartData.mockImplementationOnce((...args: unknown[]) => {
      const [statKey] = args
      return {loading: false, error: 'Network Error', title: `${statKey} Title`, statKey, data: {}}
    })
    render(<EnterpriseServerStats {...getEnterpriseServerStatsProps()} />)

    const charts = screen.queryAllByTestId('line-chart')
    expect(charts[0]?.getAttribute('error')).toContain('Could not load issues Title data')
    expect(charts[1]?.getAttribute('error')).toBeNull()
    expect(charts[2]?.getAttribute('error')).toBeNull()
    expect(charts[3]?.getAttribute('error')).toBeNull()
    expect(charts[4]?.getAttribute('error')).toBeNull()
  })
})
