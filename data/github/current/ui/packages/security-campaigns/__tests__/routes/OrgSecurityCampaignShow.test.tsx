import {screen, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {OrgSecurityCampaignShow} from '../../routes/OrgSecurityCampaignShow'
import {getOrgSecurityCampaignShowRoutePayload} from '../../test-utils/mock-data'
import type {DeleteSecurityCampaignResponse} from '../../hooks/use-delete-security-campaign-mutation'
import {setupExpectedAsyncErrorHandler} from '@github-ui/filter/test-utils'
import {defaultQuery} from '../../components/AlertsList'
import type {GetAlertsResponse} from '../../types/get-alerts-response'
import type {CloseSecurityCampaignResponse} from '../../hooks/use-close-security-campaign-mutation'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

jest.setTimeout(10_000)

test('Renders the campaign name and description', async () => {
  setupExpectedAsyncErrorHandler()

  const routePayload = getOrgSecurityCampaignShowRoutePayload()
  render(<OrgSecurityCampaignShow />, {
    routePayload,
  })
  expect(
    screen.getByRole('heading', {
      name: routePayload.campaign.name,
    }),
  ).toBeInTheDocument()
  expect(screen.getByText(routePayload.campaign.description)).toBeInTheDocument()
})

test('Renders a "Beta" label', async () => {
  setupExpectedAsyncErrorHandler()

  const routePayload = getOrgSecurityCampaignShowRoutePayload()
  render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  expect(screen.getByText('Beta')).toBeInTheDocument()
})

test('Renders the campaign manager', async () => {
  setupExpectedAsyncErrorHandler()

  const routePayload = getOrgSecurityCampaignShowRoutePayload()
  render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const expectedLogin = routePayload.campaign.manager ? routePayload.campaign.manager.login : 'Unassigned'
  expect(screen.getByText(expectedLogin)).toBeInTheDocument()
})

test('Renders the filter bar', async () => {
  setupExpectedAsyncErrorHandler()

  const routePayload = getOrgSecurityCampaignShowRoutePayload()
  render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  expect(screen.getByRole('combobox', {name: 'Filter'})).toBeInTheDocument()
})

test('Sends request when changing the filter values', async () => {
  setupExpectedAsyncErrorHandler()
  const defaultGetAlertsResponse: GetAlertsResponse = {
    alerts: [],
    openCount: 0,
    closedCount: 0,
    nextCursor: 'cursornext',
    prevCursor: '',
  }

  const routePayload = getOrgSecurityCampaignShowRoutePayload()
  const mockDefaultQuery = mockFetch.mockRoute(
    `${routePayload.alertsPath}?query=${encodeURIComponent(defaultQuery)}+${encodeURIComponent('repo:1')}`,
    defaultGetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const mockClosedQuery = mockFetch.mockRoute(
    `${routePayload.alertsPath}?query=${encodeURIComponent('is:closed')}+${encodeURIComponent('repo:1')}`,
    defaultGetAlertsResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  await user.type(screen.getByRole('combobox', {name: 'Filter'}), ' repo:1')
  await user.click(screen.getByRole('button', {name: 'Search'}))

  expect(mockDefaultQuery).toHaveBeenCalledTimes(1)

  await user.click(
    screen.getByRole('link', {
      name: /^Closed/,
    }),
  )
  expect(mockClosedQuery).toHaveBeenCalledTimes(1)
})

test('Navigates to the security overview page when the campaign is deleted', async () => {
  const routePayload = getOrgSecurityCampaignShowRoutePayload()

  const route = mockFetch.mockRoute(
    routePayload.campaign.deletePath,
    {
      message: 'Campaign deleted successfully',
    } satisfies DeleteSecurityCampaignResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const campaignMenuButton = screen.getByLabelText('Open campaign options')
  await user.click(campaignMenuButton)

  const deleteMenuItem = screen.getByText('Delete')
  await user.click(deleteMenuItem)

  const dialog = screen.getByRole('dialog')

  expect(dialog).toHaveTextContent('Delete campaign?')

  const deleteConfirmationButton = within(dialog).getByRole('button', {name: 'Delete'})

  await user.click(deleteConfirmationButton)

  expect(route).toHaveBeenCalledWith(routePayload.campaign.deletePath, expect.objectContaining({method: 'delete'}))
  expect(navigateFn).toHaveBeenCalledWith(routePayload.securityOverviewPath)
})

test('Shows an error when campaign deletion fails', async () => {
  const routePayload = getOrgSecurityCampaignShowRoutePayload()

  const route = mockFetch.mockRoute(routePayload.campaign.deletePath, 'invalid json', {
    ok: false,
    status: 500,
  })

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const campaignMenuButton = screen.getByLabelText('Open campaign options')
  await user.click(campaignMenuButton)

  const deleteMenuItem = screen.getByText('Delete')
  await user.click(deleteMenuItem)

  const dialog = screen.getByRole('dialog')

  const deleteConfirmationButton = within(dialog).getByRole('button', {name: 'Delete'})
  await user.click(deleteConfirmationButton)

  expect(route).toHaveBeenCalledTimes(1)
  expect(navigateFn).not.toHaveBeenCalled()

  expect(screen.getByText('Error deleting security campaign')).toBeInTheDocument()
  expect(dialog).not.toBeInTheDocument()
})

test('Closes delete confirmation dialog when cancel button is clicked', async () => {
  const routePayload = getOrgSecurityCampaignShowRoutePayload()

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const campaignMenuButton = screen.getByLabelText('Open campaign options')
  await user.click(campaignMenuButton)

  const deleteMenuItem = screen.getByText('Delete')
  await user.click(deleteMenuItem)

  const dialog = screen.getByRole('dialog')

  const cancelButton = within(dialog).getByRole('button', {name: 'Cancel'})
  await user.click(cancelButton)

  expect(dialog).not.toBeInTheDocument()
})

test('Allows updating the campaign name and description', async () => {
  const routePayload = getOrgSecurityCampaignShowRoutePayload()

  const route = mockFetch.mockRoute(
    routePayload.campaign.updatePath,
    {
      message: 'Campaign updated successfully',
    } satisfies DeleteSecurityCampaignResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const campaignMenuButton = screen.getByLabelText('Open campaign options')
  await user.click(campaignMenuButton)

  const editMenuItem = screen.getByText('Edit')
  await user.click(editMenuItem)

  const newCampaignName = 'My new campaign name'
  await user.clear(getCampaignNameInput())
  await user.type(getCampaignNameInput(), newCampaignName)

  const newCampaignDescription = 'My new campaign description'
  await user.clear(getCampaignDescriptionInput())
  await user.type(getCampaignDescriptionInput(), newCampaignDescription)

  const saveButton = screen.getByRole('button', {name: 'Save changes'})
  await user.click(saveButton)

  expect(route).toHaveBeenCalledWith(
    routePayload.campaign.updatePath,
    expect.objectContaining({
      method: 'put',
      body: JSON.stringify({
        campaign_name: newCampaignName,
        campaign_description: newCampaignDescription,
        campaign_due_date: routePayload.campaign.endsAt,
        campaign_manager: routePayload.campaign.manager?.id,
      }),
    }),
  )

  // Name + description should be updated in the page
  expect(
    screen.getByRole('heading', {
      name: newCampaignName,
    }),
  ).toBeInTheDocument()
  expect(screen.getByText(newCampaignDescription)).toBeInTheDocument()
})

test('Closing campaign calls close campaign endpoint', async () => {
  const routePayload = getOrgSecurityCampaignShowRoutePayload({isClosedCampaignsFeatureEnabled: true})

  const route = mockFetch.mockRoute(
    routePayload.campaign.closePath,
    {
      redirect: '/github/security_campaigns/1',
    } satisfies CloseSecurityCampaignResponse,
    {
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const campaignMenuButton = screen.getByLabelText('Open campaign options')
  await user.click(campaignMenuButton)

  const closeCampaignMenuItem = screen.getByText('Close campaign')
  await user.click(closeCampaignMenuItem)

  expect(route).toHaveBeenCalledWith(routePayload.campaign.closePath, expect.objectContaining({method: 'post'}))
})

test('Shows an error when closing campaign fails', async () => {
  const routePayload = getOrgSecurityCampaignShowRoutePayload({isClosedCampaignsFeatureEnabled: true})

  const route = mockFetch.mockRoute(
    routePayload.campaign.closePath,
    {message: 'Campaign is already closed'},
    {
      ok: false,
      status: 422,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    },
  )

  const {user} = render(<OrgSecurityCampaignShow />, {
    routePayload,
  })

  const campaignMenuButton = screen.getByLabelText('Open campaign options')
  await user.click(campaignMenuButton)

  const closeCampaignMenuItem = screen.getByText('Close campaign')
  await user.click(closeCampaignMenuItem)

  expect(route).toHaveBeenCalledTimes(1)
  expect(screen.getByText('Campaign is already closed')).toBeInTheDocument()
})

function getCampaignNameInput() {
  return screen.getByPlaceholderText('A short and descriptive name for this security campaign.')
}

function getCampaignDescriptionInput() {
  return screen.getByPlaceholderText(
    "Let everybody know what this security campaign is about and why it's important to remediate these alerts.",
  )
}
