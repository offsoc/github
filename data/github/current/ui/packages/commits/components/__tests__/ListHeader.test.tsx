import {render} from '@github-ui/react-core/test-utils'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {act, screen, waitFor} from '@testing-library/react'

import {deferredAuthorData, getCommitsRoutePayload} from '../../test-utils/mock-data'
import {ListHeader} from '../Commits/ListHeader'

jest.mock('react', () => {
  const React = jest.requireActual('react')
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.Suspense = ({children}: {children: any}) => children
  return React
})

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

beforeEach(() => {
  mockVerifiedFetchJSON.mockResolvedValue({
    ok: true,
    statusText: 'OK',
    json: async () => {
      return deferredAuthorData
    },
  })
})

test('Renders the Breadcrumbs for a file', async () => {
  const routePayload = getCommitsRoutePayload()
  routePayload.filters.currentBlobPath = 'testing123/route123/path123/shouldbehere123/blah.py'

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    render(
      <ListHeader
        repo={routePayload.repo}
        refInfo={routePayload.refInfo}
        path={routePayload.filters.currentBlobPath}
        author={routePayload.filters.author}
        contributorsUrl={routePayload.metadata.deferredContributorUrl}
        since={routePayload.filters.since}
        until={routePayload.filters.until}
      />,
    )
  })

  const first = screen.getByText('testing123')
  const second = screen.getByText('route123')
  const third = screen.getByText('path123')
  const fourth = screen.getByText('shouldbehere123')
  expect(first).toBeInTheDocument()
  expect(first).toHaveAttribute('href', '/monalisa/smile/commits/main/testing123')
  expect(second).toBeInTheDocument()
  expect(second).toHaveAttribute('href', '/monalisa/smile/commits/main/testing123/route123')
  expect(third).toBeInTheDocument()
  expect(third).toHaveAttribute('href', '/monalisa/smile/commits/main/testing123/route123/path123')
  expect(fourth).toBeInTheDocument()
  expect(fourth).toHaveAttribute('href', '/monalisa/smile/commits/main/testing123/route123/path123/shouldbehere123')
})

describe('commit person picker usage', () => {
  test('the person picker works as expected', async () => {
    const routePayload = getCommitsRoutePayload()
    routePayload.filters.pagination.hasPreviousPage = false
    routePayload.filters.pagination.endCursor = ''

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <ListHeader
          repo={routePayload.repo}
          refInfo={routePayload.refInfo}
          path={routePayload.filters.currentBlobPath}
          author={routePayload.filters.author}
          contributorsUrl={routePayload.metadata.deferredContributorUrl}
          since={routePayload.filters.since}
          until={routePayload.filters.until}
        />,
      )
    })

    const personPickerButton = screen.getByTestId('user-selector-button')
    expect(personPickerButton).toBeInTheDocument()
    expect(personPickerButton.textContent).toBe('monalisa')

    await act(() => {
      personPickerButton.click()
    })

    const allUsersButton = screen.getByText('View commits for all users')
    // eslint-disable-next-line testing-library/no-node-access
    expect(allUsersButton.parentElement?.parentElement).toHaveAttribute('href', '/')
    const differentUserButton = screen.getByText('collaborator-1')

    await act(() => {
      differentUserButton.click()
    })

    expect(navigateFn).toHaveBeenCalledWith('/?author=collaborator-1')
  })

  test('the person picker does not list an author if none is provided', async () => {
    const routePayload = getCommitsRoutePayload()
    routePayload.filters.pagination.hasPreviousPage = false
    routePayload.filters.pagination.endCursor = ''
    routePayload.filters.author = null

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <ListHeader
          repo={routePayload.repo}
          refInfo={routePayload.refInfo}
          path={routePayload.filters.currentBlobPath}
          author={routePayload.filters.author}
          contributorsUrl={routePayload.metadata.deferredContributorUrl}
          since={routePayload.filters.since}
          until={routePayload.filters.until}
        />,
      )
    })

    const personPickerButton = screen.getByTestId('user-selector-button')
    expect(personPickerButton).toBeInTheDocument()
    expect(personPickerButton.textContent).toBe('All users')
  })
})

describe('commit date picker usage', () => {
  beforeAll(() => {
    // Set the date manually to prevent flakiness
    jest.useFakeTimers().setSystemTime(new Date(2023, 11, 15))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('the date picker works as expected', async () => {
    const routePayload = getCommitsRoutePayload()
    routePayload.filters.pagination.hasPreviousPage = false
    routePayload.filters.pagination.endCursor = ''

    const {user} = render(
      <ListHeader
        repo={routePayload.repo}
        refInfo={routePayload.refInfo}
        path={routePayload.filters.currentBlobPath}
        author={routePayload.filters.author}
        contributorsUrl={routePayload.metadata.deferredContributorUrl}
        since={routePayload.filters.since}
        until={routePayload.filters.until}
      />,
    )

    await waitFor(async () => {
      await screen.findByTestId('date-picker-commits')
    })

    expect(screen.getByText('Sep 1 - Sep 27')).toBeInTheDocument()
    const datePickerButton = screen.getByTestId('date-picker-commits')
    expect(datePickerButton).toBeInTheDocument()

    await user.click(datePickerButton)

    const firstDate = screen.getByTestId('day-09/24/2023')
    expect(firstDate).toBeInTheDocument()
    const secondDate = screen.getByTestId('day-09/25/2023')
    expect(secondDate).toBeInTheDocument()

    await user.click(firstDate)

    expect(screen.getByText('Sep 24 -')).toBeInTheDocument()

    await user.click(secondDate)

    expect(screen.getByText('Sep 24 - Sep 25')).toBeInTheDocument()

    await user.click(datePickerButton)

    const clearButton = screen.getByText('Clear')
    expect(clearButton).toBeInTheDocument()

    await user.click(clearButton)

    expect(navigateFn).toHaveBeenCalledWith('/')
    expect(screen.getByText('All time')).toBeInTheDocument()
    expect(navigateFn).toHaveBeenCalledWith('/?since=2023-09-24&until=2023-09-25')
  })
})
