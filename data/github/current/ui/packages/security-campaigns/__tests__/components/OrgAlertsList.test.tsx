import {screen, waitFor, within} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {createSecurityCampaignAlert} from '../../test-utils/mock-data'
import {QueryClientProvider} from '@tanstack/react-query'
import {queryClient} from '@github-ui/security-campaigns-shared/test-utils/query-client'
import type {GetAlertsResponse} from '../../types/get-alerts-response'
import {OrgAlertsList, type OrgAlertsListProps} from '../../components/OrgAlertsList'
import {defaultQuery} from '../../components/AlertsList'

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

const alertsPath = '/github/security-campaigns/security/campaigns/1/alerts'
const alertsGroupsPath = '/github/security-campaigns/security/campaigns/1/alerts-groups'
const Wrapper = ({children}: {children?: React.ReactNode}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
const render = async (props: Partial<OrgAlertsListProps> = {}) => {
  const view = reactRender(
    <OrgAlertsList
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
  mockFetch.mockRoute(`${alertsPath}?query=${encodeURIComponent(defaultQuery)}`, defaultGetAlertsResponse, {
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
})

it('renders', async () => {
  await render()
  const list = screen.getByRole('list', {
    name: '6 alerts',
  })
  expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  expect(within(list).getAllByRole('link')).toHaveLength(6)
})

it('sends closed request when clicking the close button', async () => {
  const onStateFilterChange = jest.fn()
  const {user} = await render({onStateFilterChange})

  await user.click(
    screen.getByRole('link', {
      name: /^Closed/,
    }),
  )

  expect(onStateFilterChange).toHaveBeenCalledWith('closed')
})

it('uses the query', async () => {
  const mock = mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent('is:closed')}`,
    {
      ...defaultGetAlertsResponse,
      alerts: closedAlerts,
    } satisfies GetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  await render({query: 'is:closed'})

  const list = screen.getByRole('list', {
    name: '6 alerts',
  })
  expect(within(list).getAllByRole('listitem')).toHaveLength(2)

  expect(mock).toHaveBeenCalled()
})

it('can paginate', async () => {
  const {user} = await render()

  expect(
    screen.getByRole('button', {
      name: 'Previous',
    }),
  ).toBeDisabled()

  const list = screen.getByRole('list', {
    name: '6 alerts',
  })

  const nextPageMock = mockFetch.mockRoute(
    `${alertsPath}?query=${encodeURIComponent(defaultQuery)}&after=cursornext`,
    {
      ...defaultGetAlertsResponse,
      alerts: openAlertsPageTwo,
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
    `${alertsPath}?query=${encodeURIComponent(defaultQuery)}&before=cursorprev`,
    {
      ...defaultGetAlertsResponse,
      nextCursor: 'cursornext',
      prevCursor: '',
    } satisfies GetAlertsResponse,
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
