import {screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {OnboardingOrganizations} from '../routes/OnboardingOrganizations'
import {getOnboardingOrganizationsRoutePayload} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

test('Renders the OnboardingOrganizations', () => {
  const routePayload = getOnboardingOrganizationsRoutePayload()
  render(<OnboardingOrganizations />, {
    routePayload,
  })

  expect(screen.getByTestId('enterprise-name')).toHaveTextContent(routePayload.business.name)
  expect(screen.getByTestId('enterprise-url')).toHaveTextContent('/enterprises/test-enterprise')
  expect(screen.getByTestId('skip-button')).toHaveTextContent('Skip this step')
  expect(screen.getByTestId('continue-button')).toHaveTextContent('Create organization and continue')
})

describe('New org name', () => {
  test('Renders the default org name', () => {
    const routePayload = getOnboardingOrganizationsRoutePayload()
    render(<OnboardingOrganizations />, {
      routePayload,
    })

    expect(screen.getAllByTestId('org-card-title')[0]).toHaveTextContent('Your new organization')
    expect(screen.getAllByTestId('org-card-description')[0]).toHaveTextContent('http://localhost/YourOrganization')
  })

  test('Renders the new org name', async () => {
    const expectedResponse = {
      exists: false,
      is_name_modified: false,
      name: 'test-org-name',
      not_alphanumeric: false,
      over_max_length: false,
      unavailable: false,
    }
    mockFetch.mockRouteOnce('/organizations/check_name', expectedResponse)
    const routePayload = getOnboardingOrganizationsRoutePayload()
    const {user} = render(<OnboardingOrganizations />, {
      routePayload,
    })

    await user.type(screen.getByTestId('org-name-input'), 'test org name')
    await waitFor(() => expect(screen.getAllByTestId('org-card-title')[0]).toHaveTextContent('test org name'))
    await waitFor(() =>
      expect(screen.getAllByTestId('org-card-description')[0]).toHaveTextContent('http://localhost/test-org-name'),
    )

    expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/check_name', {
      method: 'POST',
      body: JSON.stringify({value: 'test org name'}),
      headers: expect.any(Object),
    })
  })

  test('Displays the errors message for 406', async () => {
    mockFetch.mockRouteOnce('/organizations/check_name', undefined, {status: 406, ok: false})
    const routePayload = getOnboardingOrganizationsRoutePayload()
    const {user} = render(<OnboardingOrganizations />, {
      routePayload,
    })

    await user.type(screen.getByTestId('org-name-input'), 'test org name')

    expect(await screen.findByTestId('flash-error-text')).toHaveTextContent('You have exceeded a rate limit')
  })

  test('submits the form when enter is pressed', async () => {
    const routePayload = getOnboardingOrganizationsRoutePayload()
    const {user} = render(<OnboardingOrganizations />, {
      routePayload,
    })
    await user.type(screen.getByTestId('org-name-input'), '{enter}')

    // This checks that we are in `handleSubmit`
    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'enterprise_trial_account',
        action: 'enterprise_onboarding_create_organization',
        label: 'ref_cta:create_organization_and_continue',
      },
    })
  })
})

describe('Create organization and continue', () => {
  test('triggers hydro event', async () => {
    const routePayload = getOnboardingOrganizationsRoutePayload()
    const {user} = render(<OnboardingOrganizations />, {
      routePayload,
    })

    const button = screen.getByTestId('continue-button')
    await user.click(button)

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'enterprise_trial_account',
        action: 'enterprise_onboarding_create_organization',
        label: 'ref_cta:create_organization_and_continue',
      },
    })
  })
})

describe('Skip this step', () => {
  test('has a link to getting started page', async () => {
    const routePayload = getOnboardingOrganizationsRoutePayload()
    render(<OnboardingOrganizations />, {
      routePayload,
    })

    const button = screen.getByTestId('skip-button')
    expect(button).toHaveAttribute('href', '/enterprises/test-enterprise/getting-started')
  })

  test('triggers hydro event', async () => {
    const routePayload = getOnboardingOrganizationsRoutePayload()
    const {user} = render(<OnboardingOrganizations />, {
      routePayload,
    })

    const button = screen.getByTestId('skip-button')
    await user.click(button)

    expectAnalyticsEvents({
      type: 'analytics.click',
      data: {
        category: 'enterprise_trial_account',
        action: 'enterprise_onboarding_skip_create_organization',
        label: 'ref_cta:skip_this_step',
      },
    })
  })
})
