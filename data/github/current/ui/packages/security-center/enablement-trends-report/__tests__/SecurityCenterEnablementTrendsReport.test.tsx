import {useSso} from '@github-ui/use-sso'
import {act, renderHook, screen, waitFor} from '@testing-library/react'

import {render} from '../../test-utils/Render'
import type {Dataset} from '../components/EnablementTrendChart'
import type {TableColumn, TableRow} from '../components/EnablementTrendTable'
import type {EnablementTrendDataState} from '../hooks/use-enablement-trend-data'
import {
  calculatePreviousDateRange,
  SecurityCenterEnablementTrendsReport,
  useEnablementTrendDatasets,
  useEnablementTrendTableData,
  usePeriodEnablementPercentage,
} from '../SecurityCenterEnablementTrendsReport'
import {getEnablementTrendData, getSecurityCenterEnablementTrendsReportProps} from '../test-utils/mock-data'

jest.mock('@github-ui/use-sso')

beforeEach(() => {
  jest.mocked(useSso).mockImplementation(() => ({ssoOrgs: [], baseAvatarUrl: ''}))
})

describe('SecurityCenterEnablementTrendsReport', () => {
  it('should render', () => {
    const props = getSecurityCenterEnablementTrendsReportProps()
    render(<SecurityCenterEnablementTrendsReport {...props} />)
    expect(screen.getByText('Enablement trends')).toBeInTheDocument()
  })

  it('should render with explicit date range', () => {
    const props = getSecurityCenterEnablementTrendsReportProps()
    props.initialDateSpan = {from: '2021-01-01', to: '2021-12-31'}
    render(<SecurityCenterEnablementTrendsReport {...props} />)
    expect(screen.getByText('Enablement trends')).toBeInTheDocument()
  })

  it('should render sso selector when needed', () => {
    const ssoOrgs = [
      {id: '1', name: 'Contoso', login: 'fabrikam'},
      {id: '2', name: 'Fabrikam', login: 'fabrikam'},
    ]
    jest.mocked(useSso).mockImplementation(() => ({ssoOrgs, baseAvatarUrl: ''}))
    const props = getSecurityCenterEnablementTrendsReportProps()
    render(<SecurityCenterEnablementTrendsReport {...props} />)
    expect(screen.getByText('Enablement trends')).toBeInTheDocument()
    expect(screen.getByTestId('sso-banner')).toBeInTheDocument()
  })

  describe('useEnablementTrendDatasets', () => {
    it('should return empty datasets when enablementData is not ready', async () => {
      const dataState: EnablementTrendDataState = {kind: 'loading'}
      let datasets: Dataset[] | null = null

      renderHook(() =>
        act(() => {
          datasets = useEnablementTrendDatasets(dataState, 'dependabot')
        }),
      )

      await waitFor(() =>
        expect(datasets).toStrictEqual([
          {label: 'Dependabot', data: []},
          {label: 'Security updates', data: []},
        ]),
      )
    })

    it('should return dependabot datasets', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}

      let datasets: Dataset[] | null = null
      renderHook(() =>
        act(() => {
          datasets = useEnablementTrendDatasets(dataState, 'dependabot')
        }),
      )

      await waitFor(() =>
        expect(datasets).toStrictEqual([
          {
            label: 'Dependabot',
            data: [
              {x: '2024-01-01', y: 25},
              {x: '2024-01-02', y: 20},
            ],
          },
          {
            label: 'Security updates',
            data: [
              {x: '2024-01-01', y: 37.5},
              {x: '2024-01-02', y: 30},
            ],
          },
        ]),
      )
    })

    it('should return code scanning datasets', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}

      let datasets: Dataset[] | null = null
      renderHook(() =>
        act(() => {
          datasets = useEnablementTrendDatasets(dataState, 'code-scanning')
        }),
      )

      await waitFor(() =>
        expect(datasets).toStrictEqual([
          {
            label: 'Code scanning',
            data: [
              {x: '2024-01-01', y: 50},
              {x: '2024-01-02', y: 40},
            ],
          },
        ]),
      )
    })

    it('should return secret scanning datasets', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}

      let datasets: Dataset[] | null = null
      renderHook(() =>
        act(() => {
          datasets = useEnablementTrendDatasets(dataState, 'secret-scanning')
        }),
      )

      await waitFor(() =>
        expect(datasets).toStrictEqual([
          {
            label: 'Secret scanning',
            data: [
              {x: '2024-01-01', y: 75},
              {x: '2024-01-02', y: 60},
            ],
          },
          {
            label: 'Push protection',
            data: [
              {x: '2024-01-01', y: 87.5},
              {x: '2024-01-02', y: 70},
            ],
          },
        ]),
      )
    })
  })

  describe('useEnablementTrendTableData', () => {
    it('should return columns but empty rows when enablementData is not ready', async () => {
      const dataState: EnablementTrendDataState = {kind: 'loading'}
      let columns: TableColumn[] | null = null
      let rows: TableRow[] | null = null

      renderHook(() =>
        act(() => {
          ;({columns, rows} = useEnablementTrendTableData(dataState, 'dependabot'))
        }),
      )

      await waitFor(() =>
        expect(columns).toStrictEqual([
          {label: 'Dependabot enabled', field: 'dependabotAlertsEnabled'},
          {label: 'Security updates enabled', field: 'dependabotSecurityUpdatesEnabled'},
        ]),
      )
      await waitFor(() => expect(rows).toStrictEqual([]))
    })

    it('should return rows for dependabot', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}
      let columns: TableColumn[] | null = null
      let rows: TableRow[] | null = null

      renderHook(() =>
        act(() => {
          ;({columns, rows} = useEnablementTrendTableData(dataState, 'dependabot'))
        }),
      )

      await waitFor(() =>
        expect(columns).toStrictEqual([
          {label: 'Dependabot enabled', field: 'dependabotAlertsEnabled'},
          {label: 'Security updates enabled', field: 'dependabotSecurityUpdatesEnabled'},
        ]),
      )
      await waitFor(() =>
        expect(rows).toStrictEqual([
          {
            id: '2024-01-02',
            date: '2024-01-02',
            totalRepositories: 10,
            dependabotAlertsEnabled: 2,
            dependabotSecurityUpdatesEnabled: 3,
          },
          {
            id: '2024-01-01',
            date: '2024-01-01',
            totalRepositories: 8,
            dependabotAlertsEnabled: 2,
            dependabotSecurityUpdatesEnabled: 3,
          },
        ]),
      )
    })

    it('should return rows for code scanning', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}
      let columns: TableColumn[] | null = null
      let rows: TableRow[] | null = null

      renderHook(() =>
        act(() => {
          ;({columns, rows} = useEnablementTrendTableData(dataState, 'code-scanning'))
        }),
      )

      await waitFor(() =>
        expect(columns).toStrictEqual([{label: 'Code scanning enabled', field: 'codeScanningEnabled'}]),
      )
      await waitFor(() =>
        expect(rows).toStrictEqual([
          {
            id: '2024-01-02',
            date: '2024-01-02',
            totalRepositories: 10,
            codeScanningEnabled: 4,
          },
          {
            id: '2024-01-01',
            date: '2024-01-01',
            totalRepositories: 8,
            codeScanningEnabled: 4,
          },
        ]),
      )
    })

    it('should return rows for secret scanning', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}
      let columns: TableColumn[] | null = null
      let rows: TableRow[] | null = null

      renderHook(() =>
        act(() => {
          ;({columns, rows} = useEnablementTrendTableData(dataState, 'secret-scanning'))
        }),
      )

      await waitFor(() =>
        expect(columns).toStrictEqual([
          {label: 'Secret scanning enabled', field: 'secretScanningEnabled'},
          {label: 'Push protection enabled', field: 'secretScanningPushProtectionEnabled'},
        ]),
      )
      await waitFor(() =>
        expect(rows).toStrictEqual([
          {
            id: '2024-01-02',
            date: '2024-01-02',
            totalRepositories: 10,
            secretScanningEnabled: 6,
            secretScanningPushProtectionEnabled: 7,
          },
          {
            id: '2024-01-01',
            date: '2024-01-01',
            totalRepositories: 8,
            secretScanningEnabled: 6,
            secretScanningPushProtectionEnabled: 7,
          },
        ]),
      )
    })
  })

  describe('calculatePreviousDateRange', () => {
    it('should return a two-day range prior to the provided start date', () => {
      const originalRange = {from: new Date('2024-01-17'), to: new Date('2024-02-16')}
      const previousRange = calculatePreviousDateRange(originalRange)

      expect(previousRange.from).toEqual(new Date('2024-01-15'))
      expect(previousRange.to).toEqual(new Date('2024-01-16'))
    })

    it('should ignore the end date of the provided range', () => {
      const originalRange = {from: new Date('2024-01-17'), to: new Date('1900-01-01')}
      const previousRange = calculatePreviousDateRange(originalRange)

      expect(previousRange.from).toEqual(new Date('2024-01-15'))
      expect(previousRange.to).toEqual(new Date('2024-01-16'))
    })

    it('should handle month boundaries', () => {
      const originalRange = {from: new Date('2024-02-01'), to: new Date('2199-12-31')}
      const previousRange = calculatePreviousDateRange(originalRange)

      expect(previousRange.from).toEqual(new Date('2024-01-30'))
      expect(previousRange.to).toEqual(new Date('2024-01-31'))
    })

    it('should handle year boundaries', () => {
      const originalRange = {from: new Date('2024-01-01'), to: new Date('2199-12-31')}
      const previousRange = calculatePreviousDateRange(originalRange)

      expect(previousRange.from).toEqual(new Date('2023-12-30'))
      expect(previousRange.to).toEqual(new Date('2023-12-31'))
    })
  })

  describe('usePeriodEnablementPercentage', () => {
    it('should return the enabled percentage on the last date', async () => {
      const trendData = getEnablementTrendData()
      const dataState: EnablementTrendDataState = {kind: 'ready', data: trendData}

      let enabledPercentage: number | null = null
      renderHook(() =>
        act(() => {
          enabledPercentage = usePeriodEnablementPercentage(dataState, 'dependabot')
        }),
      )

      await waitFor(() => expect(enabledPercentage).toStrictEqual(20))
    })

    it('should return empty 0 when enablementData is not ready', async () => {
      const dataState: EnablementTrendDataState = {kind: 'loading'}

      let enabledPercentage: number | null = null
      renderHook(() =>
        act(() => {
          enabledPercentage = usePeriodEnablementPercentage(dataState, 'secret-scanning')
        }),
      )

      await waitFor(() => expect(enabledPercentage).toStrictEqual(0))
    })
  })
})
