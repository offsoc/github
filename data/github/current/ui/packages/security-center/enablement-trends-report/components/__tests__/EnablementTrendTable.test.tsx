import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {EnablementTrendTable, type EnablementTrendTableProps} from '../EnablementTrendTable'

describe('EnablementTrendTable', () => {
  it('renders the comopnent with data', () => {
    const props: EnablementTrendTableProps = {
      state: 'ready',
      columns: [
        {label: 'Alerts enabled', field: 'dependabotAlertsEnabled'},
        {label: 'Security updates enabled', field: 'dependabotSecurityUpdatesEnabled'},
      ],
      rows: [
        {
          id: 1,
          date: '2022-01-01',
          totalRepositories: 1,
          dependabotAlertsEnabled: 1,
          dependabotSecurityUpdatesEnabled: 1,
        },
        {
          id: 2,
          date: '2022-01-02',
          totalRepositories: 1,
          dependabotAlertsEnabled: 1,
          dependabotSecurityUpdatesEnabled: 1,
        },
      ],
    }
    render(<EnablementTrendTable {...props} />)

    expect(screen.getAllByRole('columnheader').map(x => x.textContent)).toStrictEqual([
      'Date',
      'Alerts enabled',
      'Security updates enabled',
    ])
    expect(screen.getAllByRole('row')).toHaveLength(3) // includes thead row
    expect(screen.getAllByRole('cell')).toHaveLength(6)
  })

  it('shows a loading spinner when state is loading', () => {
    const props: EnablementTrendTableProps = {
      state: 'loading',
      columns: [
        {label: 'Alerts enabled', field: 'dependabotAlertsEnabled'},
        {label: 'Security updates enabled', field: 'dependabotSecurityUpdatesEnabled'},
      ],
      rows: [],
    }
    render(<EnablementTrendTable {...props} />)

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map(x => x.textContent)).toStrictEqual([
      'Date',
      'Alerts enabled',
      'Security updates enabled',
    ])
    expect(screen.getAllByRole('row')).toHaveLength(2) // includes thead row
    expect(screen.getAllByRole('cell')).toHaveLength(3)
  })

  it('renders nothing when state is error', () => {
    const props: EnablementTrendTableProps = {
      state: 'error',
      columns: [
        {label: 'Alerts enabled', field: 'dependabotAlertsEnabled'},
        {label: 'Security updates enabled', field: 'dependabotSecurityUpdatesEnabled'},
      ],
      rows: [],
    }
    render(<EnablementTrendTable {...props} />)
    expect(screen.getByTestId('error-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('error-indicator')).toBeEmptyDOMElement()
  })

  it('renders nothing when state is no-data', () => {
    const props: EnablementTrendTableProps = {
      state: 'no-data',
      columns: [
        {label: 'Alerts enabled', field: 'dependabotAlertsEnabled'},
        {label: 'Security updates enabled', field: 'dependabotSecurityUpdatesEnabled'},
      ],
      rows: [],
    }
    render(<EnablementTrendTable {...props} />)
    expect(screen.getByTestId('no-data-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('no-data-indicator')).toBeEmptyDOMElement()
  })
})
