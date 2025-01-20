import {act, screen, waitFor} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'
import {renderWithClient} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {expectMockFetchCalledTimes, mockFetch} from '@github-ui/mock-fetch'
import {dispatchAliveTestMessage} from '@github-ui/use-alive/test-utils'
import type {RelayPullRequest} from '../../types'

import {MergeBoxTestComponent as TestComponent, BASE_PAGE_DATA_URL} from '../../test-utils/MergeBoxTestComponent'
import {
  checksSectionSomeFailedState,
  checksSectionPendingState,
  checksSectionPassingState,
  checksSectionNoChecksState,
} from '../../test-utils/mocks/checks-section-mocks'
import {unsignedCommitHeadShaChannel} from '../../test-utils/mocks/alive-channels-mock'
import {defaultPullRequest} from '../../test-utils/query-data'

const statusChecksPageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.statusChecks}`

// Reset the Tanstack Query Client Cache between tests to ensure that we don't use stale data.
afterEach(() => {
  queryClient.clear()
  jest.clearAllTimers()
})

const defaultViewer = {login: 'monalisa'}

describe('Checks section', () => {
  test('it does not render if no checks are present', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    renderWithClient(
      <TestComponent environment={environment} pullRequest={defaultPullRequest} viewer={defaultViewer} />,
    )

    await waitFor(() => expect(screen.queryByLabelText(/checks/)).not.toBeInTheDocument())
    expectMockFetchCalledTimes(statusChecksPageDataRoute, 1)
  })

  test('it renders the status check groups', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionSomeFailedState)
    renderWithClient(
      <TestComponent environment={environment} pullRequest={defaultPullRequest} viewer={defaultViewer} />,
    )

    await screen.findByText('1 successful check')
    screen.getByText('1 failing check')
    expectMockFetchCalledTimes(statusChecksPageDataRoute, 1)
  })

  test('it renders failure content when PageData JSON response fails', async () => {
    jest.useFakeTimers()
    const spy = jest.spyOn(console, 'error').mockImplementation()
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, {}, {status: 401, ok: false})

    try {
      renderWithClient(
        <TestComponent environment={environment} pullRequest={defaultPullRequest} viewer={defaultViewer} />,
      )

      await act(() => jest.runAllTimers())
    } catch (e) {
      await screen.findByText('Checks cannot be loaded right now')
      screen.getByText(
        (_, el) =>
          el?.nodeName === 'P' &&
          el.textContent === 'Try again or if the problem persists contact support or view the Checks tab.',
      )
    }
    // Note: this spy asserts that a console.error() was made for thrown error that is caught above.
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

test('mergebox updates checks list when new data is returned from an alive channel,', async () => {
  const environment = createMockEnvironment()
  mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPendingState)
  renderWithClient(<TestComponent environment={environment} pullRequest={defaultPullRequest} viewer={defaultViewer} />)

  expect(await screen.findByText('1 pending check')).toBeVisible()
  expect(screen.queryByText('2 successful checks')).not.toBeInTheDocument()

  mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPassingState)
  act(() => {
    dispatchAliveTestMessage(unsignedCommitHeadShaChannel, {})
  })

  expect(await screen.findByText('2 successful checks')).toBeVisible()
  expect(screen.queryByText('1 pending check')).not.toBeInTheDocument()
  expectMockFetchCalledTimes(statusChecksPageDataRoute, 2)
})

describe('closed and merged state', () => {
  // More tests live in ClosedOrMergeStateMergeBox.test.tsx
  test('it renders the closed state if the viewer can take an action', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      state: 'CLOSED',
      viewerCanDeleteHeadRef: true,
      viewerCanRestoreHeadRef: false,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.getByText('Closed with unmerged commits')).toBeInTheDocument()
  })

  test('it renders the merged state if the viewer can take an action', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      state: 'MERGED',
      viewerCanDeleteHeadRef: true,
      viewerCanRestoreHeadRef: false,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.getByText('Pull request successfully merged and closed')).toBeInTheDocument()
  })

  test('it renders the correct messaging if PR is closed', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      state: 'CLOSED',
      viewerCanDeleteHeadRef: true,
      viewerCanRestoreHeadRef: true,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.getByText('Closed with unmerged commits')).toBeInTheDocument()
  })
})

describe('mergeability icons', () => {
  test('it renders the draft icon if the PR is a draft', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      isDraft: true,
    }

    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    await screen.findByLabelText('Draft')
    expect(screen.getByLabelText('Draft')).toBeInTheDocument()
    expectMockFetchCalledTimes(statusChecksPageDataRoute, 1)
  })

  test('it renders the merge queue icon if the PR is in the merge queue', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      isInMergeQueue: true,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.getByLabelText('Queued')).toBeInTheDocument()
  })

  test('it renders the failing icon if the PR is unable to be merged', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      mergeRequirements: {
        commitAuthor: 'monalisa',
        commitMessageBody: null,
        commitMessageHeadline: null,
        conditions: [],
        state: 'UNMERGEABLE',
      },
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    await screen.findByLabelText('Unable to merge')
    expect(screen.getByLabelText('Unable to merge')).toBeInTheDocument()
    expectMockFetchCalledTimes(statusChecksPageDataRoute, 1)
  })

  test('it renders the ready to merge icon if the PR has passing checks', async () => {
    const environment = createMockEnvironment()
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionNoChecksState)
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      mergeRequirements: {
        commitAuthor: 'monalisa',
        commitMessageBody: null,
        commitMessageHeadline: null,
        conditions: [],
        state: 'MERGEABLE',
      },
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    await screen.findByLabelText('Merge pull request')
    expect(screen.getByLabelText('Merge pull request')).toBeInTheDocument()
    expectMockFetchCalledTimes(statusChecksPageDataRoute, 1)
  })

  test('it renders the merged icon if the PR is merged', async () => {
    const environment = createMockEnvironment()
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      state: 'MERGED',
      viewerCanDeleteHeadRef: true,
      viewerCanRestoreHeadRef: true,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
  })

  test('it does not render the icon if the PR is merged or closed and the viewer cannot delete the head ref or restore the head ref', async () => {
    const environment = createMockEnvironment()
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      state: 'MERGED',
      viewerCanDeleteHeadRef: false,
      viewerCanRestoreHeadRef: false,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
  })

  test('it does render the icon if the PR is merged or closed and the viewer can either delete the head ref or restore the head ref', async () => {
    const environment = createMockEnvironment()
    const pullRequest: RelayPullRequest = {
      ...defaultPullRequest,
      state: 'MERGED',
      viewerCanDeleteHeadRef: true,
      viewerCanRestoreHeadRef: false,
    }
    renderWithClient(<TestComponent environment={environment} pullRequest={pullRequest} viewer={defaultViewer} />)

    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
  })
})
