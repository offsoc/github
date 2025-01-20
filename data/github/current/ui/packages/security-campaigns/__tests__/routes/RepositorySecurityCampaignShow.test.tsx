import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RepositorySecurityCampaignShow} from '../../routes/RepositorySecurityCampaignShow'
import {getRepositorySecurityCampaignShowRoutePayload} from '../../test-utils/mock-data'

test('Renders the campaign name and description', () => {
  const routePayload = getRepositorySecurityCampaignShowRoutePayload()
  render(<RepositorySecurityCampaignShow />, {
    routePayload,
  })
  expect(
    screen.getByRole('heading', {
      name: routePayload.campaign.name,
    }),
  ).toBeInTheDocument()
  expect(screen.getByText(routePayload.campaign.description)).toBeInTheDocument()
})

test('Renders a "Beta" label', () => {
  const routePayload = getRepositorySecurityCampaignShowRoutePayload()
  render(<RepositorySecurityCampaignShow />, {
    routePayload,
  })

  expect(screen.getByText('Beta')).toBeInTheDocument()
})

test('Renders the campaign manager', () => {
  const routePayload = getRepositorySecurityCampaignShowRoutePayload()
  render(<RepositorySecurityCampaignShow />, {
    routePayload,
  })

  const expectedLogin = routePayload.campaign.manager ? routePayload.campaign.manager.login : 'Unassigned'
  expect(screen.getByText(expectedLogin)).toBeInTheDocument()
})
