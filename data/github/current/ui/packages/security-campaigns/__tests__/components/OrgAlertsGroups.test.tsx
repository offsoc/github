import {screen, waitFor, within} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {createSecurityCampaignAlert, createSecurityCampaignAlertGroup} from '../../test-utils/mock-data'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/test-utils/query-client'
import type {GetAlertsResponse} from '../../types/get-alerts-response'
import {defaultQuery} from '../../components/AlertsList'
import type {GetAlertsGroupsResponse} from '../../types/get-alerts-groups-response'
import {OrgAlertsGroups, type OrgAlertsGroupsProps} from '../../components/OrgAlertsGroups'

jest.setTimeout(4_500)

const openAlerts = [
  createSecurityCampaignAlert({
    number: 123,
    isFixed: false,
    isDismissed: false,
  }),
  createSecurityCampaignAlert({
    number: 125,
    isFixed: false,
    isDismissed: false,
  }),
  createSecurityCampaignAlert({
    number: 142,
    isFixed: false,
    isDismissed: false,
  }),
]
const closedAlerts = [
  createSecurityCampaignAlert({
    number: 67,
    isFixed: true,
    isDismissed: false,
  }),
  createSecurityCampaignAlert({
    number: 893,
    isFixed: true,
    isDismissed: false,
  }),
]
const openAlertsPageTwo = [
  createSecurityCampaignAlert({
    number: 235,
    isFixed: false,
    isDismissed: false,
  }),
]

const defaultGetAlertsResponse: GetAlertsResponse = {
  alerts: openAlerts,
  openCount: openAlerts.length + openAlertsPageTwo.length,
  closedCount: closedAlerts.length,
  nextCursor: 'cursornext',
  prevCursor: '',
}

const openAlertsGroups = [
  createSecurityCampaignAlertGroup({
    title: 'github/security-campaigns-1',
    openCount: openAlerts.length + openAlertsPageTwo.length,
    closedCount: closedAlerts.length,
    repositories: ['security-campaigns/test-1'],
  }),
  createSecurityCampaignAlertGroup({
    title: 'github/security-campaigns-2',
    openCount: openAlerts.length + openAlertsPageTwo.length,
    closedCount: closedAlerts.length,
    repositories: ['security-campaigns/test-2'],
  }),
  createSecurityCampaignAlertGroup({
    title: 'github/security-campaigns-3',
    openCount: openAlerts.length + openAlertsPageTwo.length,
    closedCount: closedAlerts.length,
    repositories: ['security-campaigns/test-3'],
  }),
]

const openAlertsGroupsPageTwo = [
  createSecurityCampaignAlertGroup({
    openCount: openAlerts.length + openAlertsPageTwo.length,
    closedCount: closedAlerts.length,
  }),
]

const defaultGetAlertsGroupsResponse: GetAlertsGroupsResponse = {
  groups: openAlertsGroups,
  openCount: openAlerts.length + openAlertsPageTwo.length,
  closedCount: closedAlerts.length,
  nextCursor: 'cursornext',
  prevCursor: '',
}

const alertsPath = '/github/security-campaigns/security/campaigns/1/alerts'
const alertsGroupsPath = '/github/security-campaigns/security/campaigns/1/alerts-groups'
const Wrapper = ({children}: {children?: React.ReactNode}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
const render = async (props: Partial<OrgAlertsGroupsProps> = {}) => {
  const view = reactRender(
    <OrgAlertsGroups
      group="repository"
      alertsGroupsPath={alertsGroupsPath}
      alertsPath={alertsPath}
      query={defaultQuery}
      onStateFilterChange={jest.fn()}
      {...props}
    />,
    {
      wrapper: Wrapper,
    },
  )

  // Wait for the alerts to load
  await waitFor(() => {
    expect(
      screen.getByRole('list', {
        name: `${defaultGetAlertsResponse.openCount + defaultGetAlertsResponse.closedCount} alerts`,
      }),
    ).toBeInTheDocument()
  })

  return view
}

beforeEach(() => {
  mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent(defaultQuery)}&group=repository`,
    defaultGetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )
})

it('renders and paginates', async () => {
  mockFetch.mockRoute(
    `${alertsGroupsPath}?query=${encodeURIComponent(defaultQuery)}&group=repository`,
    defaultGetAlertsGroupsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = await render()

  expect(
    screen.getByRole('button', {
      name: 'Previous',
    }),
  ).toBeDisabled()

  expect(
    screen.getByRole('button', {
      name: 'Next',
    }),
  ).not.toBeDisabled()

  const list = screen.getByRole('list', {
    name: '6 alerts',
  })

  const nextPageMock = mockFetch.mockRoute(
    `${alertsGroupsPath}?query=${encodeURIComponent(defaultQuery)}&group=repository&after=cursornext`,
    {
      ...defaultGetAlertsGroupsResponse,
      groups: openAlertsGroupsPageTwo,
      nextCursor: '',
      prevCursor: 'cursorprev',
    } satisfies GetAlertsGroupsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    screen.getByRole('button', {
      name: 'Next',
    }),
  )

  await waitFor(() => {
    expect(within(list).getAllByRole('listitem')).toHaveLength(1)
  })

  expect(
    screen.getByRole('button', {
      name: 'Next',
    }),
  ).toBeDisabled()

  expect(nextPageMock).toHaveBeenCalled()

  const prevPageMock = mockFetch.mockRoute(
    `${alertsGroupsPath}?query=${encodeURIComponent(defaultQuery)}&group=repository&before=cursorprev`,
    {
      ...defaultGetAlertsGroupsResponse,
      nextCursor: 'cursornext',
      prevCursor: '',
    } satisfies GetAlertsGroupsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    screen.getByRole('button', {
      name: 'Previous',
    }),
  )

  await waitFor(() => {
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  expect(prevPageMock).toHaveBeenCalled()
})

it('shows alert lists for the selected group', async () => {
  mockFetch.mockRoute(
    `${alertsGroupsPath}?query=${encodeURIComponent(defaultQuery)}&group=repository`,
    defaultGetAlertsGroupsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = await render()

  const alertsMock = mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent(defaultQuery)}+${encodeURIComponent('repo:security-campaigns/test-2')}`,
    {
      ...defaultGetAlertsResponse,
      alerts: openAlerts,
      nextCursor: '',
      prevCursor: 'cursorprev',
    } satisfies GetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await user.click(
    screen.getByRole('button', {
      name: 'Toggle github/security-campaigns-2',
    }),
  )

  const list = screen.getByRole('list', {
    name: '6 alerts',
  })

  await waitFor(() => {
    expect(within(list).getAllByRole('listitem')).toHaveLength(6)
  })

  expect(alertsMock).toHaveBeenCalled()
})
