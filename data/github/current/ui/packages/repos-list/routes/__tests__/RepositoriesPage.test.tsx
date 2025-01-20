import {setupExpectedAsyncErrorHandler} from '@github-ui/filter/test-utils'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor, within} from '@testing-library/react'
import type {PropsWithChildren} from 'react'

import {getRepositoriesRoutePayload, userInfo} from '../../test-utils/mock-data'
import type {RepositoriesPayload} from '../../types/repos-list-types'
import {RepositoriesPage} from '../RepositoriesPage'

jest.useFakeTimers()
jest.setTimeout(4_500)

describe('RepositoriesPage', () => {
  beforeEach(() => {
    setupExpectedAsyncErrorHandler()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Renders the RepositoriesPage', () => {
    const routePayload = getRepositoriesRoutePayload()
    render(<RepositoriesPage />, {
      routePayload,
    })

    expect(screen.getByText('Repositories', {selector: 'h2'})).toBeInTheDocument()
    expect(screen.getByRole('combobox', {name: 'Search repositories'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'New repository'})).toBeInTheDocument()
    expect(screen.getByRole('navigation', {name: 'Pagination'})).toBeInTheDocument()
  })

  test('hides the search, filter, and new repo controls when searchable is false', () => {
    const routePayload = getRepositoriesRoutePayload()
    render(<RepositoriesPage />, {
      routePayload: {...routePayload, searchable: false},
    })
    expect(screen.queryByRole('textbox', {name: 'Search repositories'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Type: All'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'New repository'})).not.toBeInTheDocument()
  })

  test('hides new repo button if user cannot create', async () => {
    const routePayload: RepositoriesPayload = {
      ...getRepositoriesRoutePayload(),
      userInfo: {...userInfo, canCreateRepository: false},
    }

    render(<RepositoriesPage />, {routePayload})

    expect(screen.queryByRole('link', {name: 'New repository'})).not.toBeInTheDocument()
  })

  test('renders correct count label total', async () => {
    const routePayload: RepositoriesPayload = {
      ...getRepositoriesRoutePayload(),
      repositoryCount: 1,
    }

    render(<RepositoriesPage />, {routePayload})

    expect(screen.getByText('1 repository')).toBeInTheDocument()
  })

  test('renders types button and dialog (narrow viewport)', async () => {
    const {user} = render(<RepositoriesPage />, {
      routePayload: getRepositoriesRoutePayload(),
      search: '?q=visibility:public archived:false',
    })

    const typesButton = screen.getByRole('button', {name: 'Public repositories'})
    expect(typesButton).toBeInTheDocument()

    await user.click(typesButton) // Open dialog

    const dialog = within(screen.getByRole('dialog'))
    const allFilterLink = dialog.getByRole('link', {name: 'All'})
    expect(allFilterLink).toBeInTheDocument()
    expect(allFilterLink).toHaveAttribute('href', '?q=')

    const publicFilterLink = dialog.getByRole('link', {name: 'Public'})
    expect(publicFilterLink).toBeInTheDocument()
    expect(publicFilterLink).toHaveAttribute('href', '?q=visibility:public archived:false')
    expect(publicFilterLink).toHaveAttribute('aria-current', 'page')
  })

  test('updates query when another ordering is selected in the dropdown', async () => {
    const {user} = render(<RepositoriesPage />, {
      routePayload: getRepositoriesRoutePayload(),
      wrapper: WrapperWithA11yMessage,
    })

    const sortDropdown = screen.getByRole('button', {name: 'Sort by Last pushed descending'})
    expect(sortDropdown).toBeInTheDocument()
    await user.click(sortDropdown)
    await user.click(screen.getByRole('menuitemradio', {name: 'Name'}))

    const searchBox = screen.getByRole('combobox', {name: 'Search repositories'})
    expect(searchBox).toHaveValue('sort:name-asc')

    // We need to wait for the async parsing to finish, otherwise the test will fail afterwards
    await waitFor(() => {
      const styledInput = screen.getByTestId('styled-input-content')
      // eslint-disable-next-line testing-library/no-node-access
      expect(styledInput.querySelector('.delimiter')).toBeInTheDocument()
    })

    await jest.runOnlyPendingTimersAsync()
    expect(screen.getByTestId('sr-message')).toHaveTextContent(
      '2 repositories found. List is sorted by Last pushed in descending order.',
    )
  })

  test('performs search on submit', async () => {
    mockFetch.mockRoute(/\/repos_list/)

    const {user} = render(<RepositoriesPage />, {
      routePayload: getRepositoriesRoutePayload(),
    })

    const searchBox = screen.getByRole('combobox', {name: 'Search repositories'})
    await user.type(searchBox, 'repo-name')

    expectMockFetchCalledTimes(/\/repos_list/, 0)
    await user.type(searchBox, '{Enter}')
    expectMockFetchCalledTimes(/\/repos_list/, 1)
  })

  test('renders correctly formatted count label', async () => {
    const routePayload: RepositoriesPayload = {
      ...getRepositoriesRoutePayload(),
      repositoryCount: 60_000,
    }

    render(<RepositoriesPage />, {routePayload, wrapper: WrapperWithA11yMessage})

    expect(screen.getByText('60k repositories')).toBeInTheDocument()

    await jest.runOnlyPendingTimersAsync()
    expect(screen.getByTestId('sr-message')).toHaveTextContent(
      '60k repositories found. List is sorted by Last pushed in descending order.',
    )
  })

  describe('no repositories blankslate message', () => {
    const noReposPayload: RepositoriesPayload = {
      ...getRepositoriesRoutePayload(),
      repositories: [],
    }

    test('hides pagination if no pages', () => {
      render(<RepositoriesPage />, {
        routePayload: {...noReposPayload, pageCount: 0},
      })
      expect(screen.queryByRole('navigation', {name: 'Pagination'})).not.toBeInTheDocument()
    })

    test('shows pagination if no results but there are other pages', () => {
      render(<RepositoriesPage />, {
        routePayload: {...noReposPayload, pageCount: 3},
      })
      expect(screen.getByRole('navigation', {name: 'Pagination'})).toBeInTheDocument()
    })

    test('no matches if no repos without any filter', async () => {
      render(<RepositoriesPage />, {routePayload: noReposPayload, wrapper: WrapperWithA11yMessage})

      await expect(screen.findByText('This organization has no public repositories.')).resolves.toBeInTheDocument()

      await jest.runOnlyPendingTimersAsync()
      expect(screen.getByTestId('sr-message')).toHaveTextContent('This organization has no public repositories.')
    })

    test('no matches if filtering by query', async () => {
      setupExpectedAsyncErrorHandler()

      render(<RepositoriesPage />, {routePayload: noReposPayload, search: '?q=test'})

      await expect(screen.findByText('No repositories matched your search.')).resolves.toBeInTheDocument()
    })

    test('no more repos if current page is greater than total pages', () => {
      const routePayload: RepositoriesPayload = {
        ...noReposPayload,
        pageCount: 1,
      }

      render(<RepositoriesPage />, {routePayload, search: '?page=100'})
      expect(screen.getByText('No more repositories. Visit a lower page.')).toBeInTheDocument()
    })
  })
})

function WrapperWithA11yMessage({children}: PropsWithChildren) {
  return (
    <>
      <div id="js-global-screen-reader-notice" aria-live="polite" aria-atomic="true" data-testid="sr-message" />
      {children}
    </>
  )
}
