import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import {AdvisoriesTableV2} from '../../advisories-table/AdvisoriesTableV2'
import useAdvisoriesQuery from '../use-advisories-query'

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('../use-advisories-query')
function mockUseAdvisoriesQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useAdvisoriesQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSucess: true,
    data: {},
    ...result,
  })
}

describe('AdvisoriesTableV2', () => {
  const query = 'archived:false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  it('renders the component with the correct props', () => {
    mockUseAdvisoriesQuery({
      isSuccess: true,
      data: {
        advisories: [
          {
            summary: 'foo',
            cveId: 'bar',
            ghsaId: 'baz',
            ecosystem: 'qux',
            openAlerts: 1,
            severity: 'CRITICAL',
          },
        ],
      },
    })

    render(<AdvisoriesTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Advisory')).toBeInTheDocument()
    expect(screen.getByText('CVE ID')).toBeInTheDocument()
    expect(screen.getByText('Ecosystem')).toBeInTheDocument()
    expect(screen.getByText('Open alerts')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    mockUseAdvisoriesQuery({
      isSuccess: true,
      data: {
        advisories: [
          {
            summary: 'foo',
            cveId: 'bar',
            ghsaId: 'baz',
            ecosystem: 'qux',
            openAlerts: 10,
            severity: 'CRITICAL',
          },
        ],
      },
    })

    render(<AdvisoriesTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByText('foo')).toHaveAttribute('href', '/advisories/baz')
    expect(screen.getByText('bar')).toBeInTheDocument()
    expect(screen.getByText('qux')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('displays N/A for empty CVE ID', async () => {
    mockUseAdvisoriesQuery({
      isSuccess: true,
      data: {
        advisories: [
          {
            summary: 'foo',
            ghsaId: 'baz',
            ecosystem: 'qux',
            openAlerts: 10,
            severity: 'CRITICAL',
          },
        ],
      },
    })

    render(<AdvisoriesTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByText('foo')).toHaveAttribute('href', '/advisories/baz')
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('qux')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('displays an error state on error', async () => {
    mockUseAdvisoriesQuery({
      isSuccess: false,
      isError: true,
    })

    render(<AdvisoriesTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })

  it('displays an empty state on no data', async () => {
    mockUseAdvisoriesQuery({
      isSuccess: true,
      data: {
        advisories: [],
      },
    })

    render(<AdvisoriesTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('empty')).toBeInTheDocument()
  })
})
