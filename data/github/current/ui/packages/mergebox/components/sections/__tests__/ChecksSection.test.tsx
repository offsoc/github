import {useAnalytics} from '@github-ui/use-analytics'
import {act, screen, waitFor} from '@testing-library/react'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import {renderWithClient, BASE_PAGE_DATA_URL} from '@github-ui/pull-request-page-data-tooling/render-with-query-client'
import {PageData} from '@github-ui/pull-request-page-data-tooling/page-data'
import {mockFetch} from '@github-ui/mock-fetch'

import {StatusCheckGenerator} from '../../../test-utils/object-generators/status-check'
import {
  checksSectionFailedState,
  checksSectionFailedTimedOutState,
  checksSectionPassingState,
  checksSectionPassingWithSkippedState,
  checksSectionPendingState,
  checksSectionPendingFromQueuedState,
  checksSectionPendingWithFailureState,
  checksSectionSomeFailedState,
} from '../../../test-utils/mocks/checks-section-mocks'
import {aliveChannels} from '../../../test-utils/mocks/alive-channels-mock'
import {AliveTestProvider} from '@github-ui/use-alive/test-utils'
import {ChecksSection} from '../ChecksSection'

jest.mock('@github-ui/use-analytics')
const sendAnalyticsEventMock = jest.fn()
jest.mocked(useAnalytics).mockReturnValue({sendAnalyticsEvent: sendAnalyticsEventMock})

// Reset the Tanstack Query Client Cache between tests to ensure that we don't use stale data.
afterEach(() => queryClient.clear())
beforeEach(() => sendAnalyticsEventMock.mockReset())

const statusChecksPageDataRoute = `${BASE_PAGE_DATA_URL}/page_data/${PageData.statusChecks}`

const defaultProps = {
  pullRequestId: 'pullRequest123',
  pullRequestHeadSha: 'mock-head-sha',
}

function TestComponent(props: {pullRequestId: string; pullRequestHeadSha: string}) {
  return (
    <AliveTestProvider>
      <ChecksSection {...props} />
    </AliveTestProvider>
  )
}

describe('preview view', () => {
  test('does not render if there are no checks', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [],
        combinedState: 'PASSED',
      },
      statusChecks: [],
    })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderWithClient(<TestComponent {...defaultProps} />)
      await waitFor(() => expect(screen.queryByLabelText('Checks')).not.toBeInTheDocument())
    })
  })

  test('renders pending state when there are pending checks and no failures', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPendingState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText("Some checks haven't completed yet")
    expect(screen.getByText('1 pending check')).toBeInTheDocument()
  })

  test('renders the pending-failed state when there are pending checks and any failures', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPendingWithFailureState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('Some checks were not successful')
    expect(screen.getByText('1 failing, 1 pending, 1 successful checks')).toBeInTheDocument()
  })

  test('renders the passed state when all checks have passed', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPassingState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('All checks have passed')
    expect(screen.getByText('2 successful checks')).toBeInTheDocument()
  })

  test('renders the some-failed state when all checks have completed and some failed', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionSomeFailedState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('Some checks were not successful')
    expect(screen.getByText('1 failing, 1 successful checks')).toBeInTheDocument()
  })

  test('renders the failed state when all checks have completed and failed', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionFailedState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('All checks have failed')
    expect(screen.getByText('2 failing checks')).toBeInTheDocument()
  })

  test('records cancelled, timed out, and stale check runs separately', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [
          {count: 1, state: 'SUCCESS'},
          {count: 1, state: 'TIMED_OUT'},
          {count: 1, state: 'CANCELLED'},
          {count: 1, state: 'STALE'},
          {count: 1, state: 'FAILURE'},
        ],
        combinedState: 'SOME_FAILED',
      },
      statusChecks: [
        StatusCheckGenerator({state: 'SUCCESS'}),
        StatusCheckGenerator({state: 'TIMED_OUT'}),
        StatusCheckGenerator({state: 'CANCELLED'}),
        StatusCheckGenerator({state: 'STALE'}),
        StatusCheckGenerator({state: 'FAILURE'}),
      ],
    })
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('Some checks were not successful')
    expect(screen.getByText('1 failing, 1 timed out, 1 cancelled, 1 stale, 1 successful checks')).toBeInTheDocument()
  })

  test('records failure, error, and startup failure status as failures', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [
          {count: 1, state: 'STARTUP_FAILURE'},
          {count: 2, state: 'FAILURE'},
          {count: 1, state: 'ERROR'},
        ],
        combinedState: 'FAILED',
      },
      statusChecks: [
        StatusCheckGenerator({state: 'STARTUP_FAILURE'}),
        StatusCheckGenerator({state: 'FAILURE'}),
        StatusCheckGenerator({state: 'FAILURE'}),
        StatusCheckGenerator({state: 'ERROR'}),
      ],
    })
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('All checks have failed')
    expect(screen.getByText('4 failing checks')).toBeInTheDocument()
  })

  test('records success and neutral as seperate states', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [
          {count: 1, state: 'SUCCESS'},
          {count: 1, state: 'NEUTRAL'},
        ],
        combinedState: 'PASSED',
      },
      statusChecks: [StatusCheckGenerator({state: 'SUCCESS'}), StatusCheckGenerator({state: 'NEUTRAL'})],
    })
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('All checks have passed')
    expect(screen.getByText('1 neutral, 1 successful checks')).toBeInTheDocument()
  })

  test('records pending, waiting, and action required as pending states', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [
          {count: 1, state: 'ACTION_REQUIRED'},
          {count: 1, state: 'PENDING'},
          {count: 1, state: 'WAITING'},
        ],
        combinedState: 'PENDING',
      },
      statusChecks: [
        StatusCheckGenerator({state: 'ACTION_REQUIRED'}),
        StatusCheckGenerator({state: 'PENDING'}),
        StatusCheckGenerator({state: 'WAITING'}),
      ],
    })
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText("Some checks haven't completed yet")
    expect(screen.getByText('3 pending checks')).toBeInTheDocument()
  })

  test('records in_progress and pending as seperate states', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [
          {count: 1, state: 'IN_PROGRESS'},
          {count: 1, state: 'PENDING'},
        ],
        combinedState: 'PENDING',
      },
      statusChecks: [StatusCheckGenerator({state: 'IN_PROGRESS'}), StatusCheckGenerator({state: 'PENDING'})],
    })
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText("Some checks haven't completed yet")
    expect(screen.getByText('1 pending, 1 in progress checks')).toBeInTheDocument()
  })

  test('counts queued statuses as pending', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPendingFromQueuedState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText("Some checks haven't completed yet")
    expect(screen.getByText('1 queued check')).toBeInTheDocument()
  })

  test('counts requested check runs as pending', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, {
      aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
      statusRollup: {
        summary: [{count: 1, state: 'REQUESTED'}],
        combinedState: 'PENDING',
      },
      statusChecks: [StatusCheckGenerator({state: 'REQUESTED'})],
    })
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText("Some checks haven't completed yet")
    expect(screen.getByText('1 requested check')).toBeInTheDocument()
  })

  test('counts skipped checks as success', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPassingWithSkippedState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('All checks have passed')
    expect(screen.getByText('1 skipped check')).toBeInTheDocument()
  })

  test('counts timed out checks as failure', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionFailedTimedOutState)
    renderWithClient(<TestComponent {...defaultProps} />)

    await screen.findByText('All checks have failed')
    expect(screen.getByText('1 timed out check')).toBeInTheDocument()
  })
})

test('when all checks pass, component is not expanded', async () => {
  mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionPassingState)
  renderWithClient(<TestComponent {...defaultProps} />)

  const collapsedButton = await screen.findByRole('button', {name: 'Checks details', expanded: false})
  expect(collapsedButton).toBeInTheDocument()
})

test('when all checks are not passing, component is expanded by default', async () => {
  mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionSomeFailedState)
  renderWithClient(<TestComponent {...defaultProps} />)

  const expandedButton = await screen.findByRole('button', {name: 'Checks details', expanded: true})
  expect(expandedButton).toBeInTheDocument()
})

describe('Analytics events', () => {
  test('it emits events when user expands or collapses checks section', async () => {
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionSomeFailedState)
    const {user} = renderWithClient(<TestComponent {...defaultProps} />)

    const expectedMetadata = {
      statusCheckCounts: {SUCCESS: 1, FAILURE: 1},
    }

    const expandedButton = await screen.findByRole('button', {name: 'Checks details', expanded: true})
    await user.click(expandedButton)

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith(
      'checks_section.collapse',
      'MERGEBOX_CHECKS_SECTION_TOGGLE_BUTTON',
      expectedMetadata,
    )

    const collapsedButton = await screen.findByRole('button', {name: 'Checks details', expanded: false})
    await user.click(collapsedButton)

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith(
      'checks_section.expand',
      'MERGEBOX_CHECKS_SECTION_TOGGLE_BUTTON',
      expectedMetadata,
    )

    // Test that we don't make additional calls
    expect(sendAnalyticsEventMock).toHaveBeenCalledTimes(2)
  })

  test('it emits events when user expands or collapses check group sections', async () => {
    const expectedMetadata = {
      statusCheckCounts: {SUCCESS: 1, FAILURE: 1},
    }
    const eventTarget = 'MERGEBOX_CHECKS_GROUP_TOGGLE_BUTTON'
    mockFetch.mockRoute(statusChecksPageDataRoute, checksSectionSomeFailedState)
    const {user} = renderWithClient(<TestComponent {...defaultProps} />)

    await waitFor(() => user.click(screen.getByRole('button', {name: '1 failing check'})))

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith('checks_group.collapse', eventTarget, {
      ...expectedMetadata,
      group: 'FAILURE',
    })

    await user.click(screen.getByRole('button', {name: '1 failing check'}))

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith('checks_group.expand', eventTarget, {
      ...expectedMetadata,
      group: 'FAILURE',
    })

    await user.click(screen.getByRole('button', {name: '1 successful check'}))

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith('checks_group.expand', eventTarget, {
      ...expectedMetadata,
      group: 'SUCCESS',
    })

    await user.click(screen.getByRole('button', {name: '1 successful check'}))

    expect(sendAnalyticsEventMock).toHaveBeenCalledWith('checks_group.collapse', eventTarget, {
      ...expectedMetadata,
      group: 'SUCCESS',
    })

    // Test that we don't make additional calls
    expect(sendAnalyticsEventMock).toHaveBeenCalledTimes(4)
  })
})

test('Check sections can be expanded and collapsed', async () => {
  mockFetch.mockRoute(statusChecksPageDataRoute, {
    aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
    statusRollup: {
      summary: [
        {count: 1, state: 'SUCCESS'},
        {count: 1, state: 'FAILURE'},
      ],
      combinedState: 'SOME_FAILED',
    },
    statusChecks: [
      StatusCheckGenerator({state: 'SUCCESS', displayName: 'test workflow / Check Run 1'}),
      StatusCheckGenerator({state: 'FAILURE', displayName: 'test workflow / Check Run 2'}),
    ],
  })
  const {user} = renderWithClient(<TestComponent {...defaultProps} />)

  await screen.findByText('test workflow / Check Run 2')
  expect(screen.queryByText('test workflow / Check Run 1')).not.toBeVisible()

  await user.click(screen.getByText('1 successful check'))
  await user.click(screen.getByText('1 failing check'))
  expect(screen.queryByText('Status Context 1')).not.toBeInTheDocument()
  expect(screen.getByText('test workflow / Check Run 1')).toBeVisible()
})
