import type {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'

import {render} from '../../../../test-utils/Render'
import {SastTableV2} from '../../sast-table/SastTableV2'
import useSastQuery from '../use-sast-query'

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('../use-sast-query')
function mockuseSastQuery<TResult>(result: Partial<UseQueryResult<TResult>>): void {
  ;(useSastQuery as jest.Mock).mockReturnValue({
    isPending: false,
    isError: false,
    isSucess: true,
    data: {},
    ...result,
  })
}

describe('SastTableV2', () => {
  const query = 'archived:false'
  const startDate = '2022-01-01'
  const endDate = '2023-01-31'

  it('renders the component with the correct props', () => {
    mockuseSastQuery({
      isSuccess: true,
      data: {
        data: [
          {
            countOpenAlerts: 10,
            cwes: ['foo', 'bar'],
            name: 'baz',
            severity: 'CRITICAL',
          },
        ],
      },
    })

    render(<SastTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Common Weakness Enumerator')).toBeInTheDocument()
    expect(screen.getByText('Open alerts')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
  })

  it('fetches and displays the correct data', async () => {
    mockuseSastQuery({
      isSuccess: true,
      data: {
        data: [
          {
            countOpenAlerts: 10,
            cwes: ['foo', 'bar'],
            name: 'baz',
            severity: 'CRITICAL',
          },
        ],
      },
    })

    render(<SastTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(screen.getByText('foo')).toBeInTheDocument()
    expect(screen.getByText('baz')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('displays an error state on error', async () => {
    mockuseSastQuery({
      isSuccess: false,
      isError: true,
    })

    render(<SastTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('error')).toBeInTheDocument()
  })

  it('displays an empty state on no data', async () => {
    mockuseSastQuery({
      isSuccess: true,
      data: {
        data: [],
      },
    })

    render(<SastTableV2 query={query} startDate={startDate} endDate={endDate} />)

    expect(await screen.findByTestId('empty')).toBeInTheDocument()
  })
})
