import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {SecurityCenterPagination} from '../SecurityCenterPagination'
import {getSecurityCenterPaginationProps} from '../test-utils/mock-data'

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: new URL('http://localhost/risk', 'http://localhost'),
  })
})

test('Renders the SecurityCenterPagination', () => {
  const props = getSecurityCenterPaginationProps()
  render(<SecurityCenterPagination {...props} />)
  expect(screen.getByRole('navigation')).toBeTruthy()
  const nextButton: HTMLAnchorElement = screen.getByText('Next')
  expect(nextButton).toBeTruthy()
  expect(nextButton.href).toBe('http://localhost/risk?page=2')
  expect(screen.getByText(props.pageCount.toString())).toBeTruthy()
})

test('Renders the correct number of pages', () => {
  const props = {...getSecurityCenterPaginationProps(), pageCount: 15}
  render(<SecurityCenterPagination {...props} />)
  expect(screen.getByRole('navigation')).toBeTruthy()
  expect(screen.getByText(props.pageCount.toString())).toBeTruthy()
})

describe('SecurityCenterPagination', () => {
  test('should request page count data', async () => {
    const mockData = {
      data: {
        activeCount: 123,
        archivedCount: 456,
        totalPages: 4,
      },
    }
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({'Content-Type': 'application/json'}),
      json: async () => mockData,
    } as Response)

    const props = {
      ...getSecurityCenterPaginationProps(),
      pageCountsUrl: '/orgs/github/security/coverage/counts',
    }
    render(<SecurityCenterPagination {...props} />)

    const navigation = await screen.findByRole('navigation')
    expect(navigation).toBeTruthy()
    const nextButton: HTMLAnchorElement = screen.getByText('Next')
    expect(nextButton).toBeTruthy()
    expect(nextButton.href).toBe('http://localhost/risk?page=2')
    expect(screen.getByText(mockData.data.totalPages)).toBeTruthy()
  })

  test('should render simple pager on graceful error', async () => {
    const mockData = {
      data: null,
    }
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({'Content-Type': 'application/json'}),
      json: async () => mockData,
    } as Response)

    const props = {
      ...getSecurityCenterPaginationProps(),
      currentPage: 4,
      pageCountsUrl: '/orgs/github/security/coverage/counts',
    }
    render(<SecurityCenterPagination {...props} />)

    const navigation = await screen.findByRole('navigation')
    expect(navigation).toBeTruthy()
    const nextButton: HTMLAnchorElement = await screen.findByText('Next')
    expect(nextButton).toBeTruthy()
    expect(nextButton.href).toBe('http://localhost/risk?page=5')
    expect(screen.queryByText(props.currentPage + 1)).toBeFalsy()
  })

  test('should render simple pager on error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response)

    const props = {
      ...getSecurityCenterPaginationProps(),
      currentPage: 4,
      pageCountsUrl: '/orgs/github/security/coverage/counts',
    }
    render(<SecurityCenterPagination {...props} />)

    const navigation = await screen.findByRole('navigation')
    expect(navigation).toBeTruthy()
    const nextButton: HTMLAnchorElement = screen.getByText('Next')
    expect(nextButton).toBeTruthy()
    expect(nextButton.href).toBe('http://localhost/risk?page=5')
    expect(screen.queryByText(props.currentPage + 1)).toBeFalsy()
  })
})
