import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import App from '../App'
import LicenseSection from '../components/LicenseSection'
import {getOrganizationSettingsSecurityProductsRoutePayload} from '../test-utils/mock-data'
import type {Repository} from '../security-products-enablement-types'
import {expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {repoContextWrapper as wrapper} from './test-helpers'

describe('LicenseSection', () => {
  function TestComponent(selectedReposMap: Record<number, Repository> = {}, selectedReposCount = 0) {
    return (
      <App>
        <LicenseSection
          selectedReposMap={selectedReposMap}
          selectedReposCount={selectedReposCount}
          totalRepositoryCount={11}
          filterQuery={''}
        />
      </App>
    )
  }

  it('renders license information on page load', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(TestComponent(), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(/0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc/)
  })

  it('renders a summary of GitHub Advanced Security license availability and usage from an enterprise with unlimited licenses', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.licenses = {...routePayload.licenses, hasUnlimitedSeats: true}
    render(TestComponent(), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(/1 GitHub Advanced Security license in use by GitHub, Inc/)
  })

  it('renders a summary of GitHub Advanced Security license availability and usage on an org', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    // Override the mock data's business and set it to undefined, which matches cases when an org doesn't have a biz:
    routePayload.licenses = {...routePayload.licenses, business: undefined}

    render(TestComponent(), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(/0 GitHub Advanced Security licenses available, 1 in use/)
  })

  it('renders a summary of GitHub Advanced Security license availability and usage on an org with unlimited licenses', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    // Override the mock data's business and set it to undefined, which matches cases when an org doesn't have a biz:
    routePayload.licenses = {...routePayload.licenses, hasUnlimitedSeats: true, business: undefined}

    render(TestComponent(), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent('1 GitHub Advanced Security license in use.')
  })

  it('renders a banner when the organization is using more GHAS licenses than it has', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    // Set the mock data to have the allowance exceeded:
    routePayload.licenses = {...routePayload.licenses, allowanceExceeded: true, exceededSeats: 1}

    render(TestComponent(), {routePayload, wrapper})

    const bannerText = screen.getByText(
      'Configurations with GitHub Advanced Security cannot be applied because your organization is using 1 more GitHub Advanced Security license than it has purchased. To make changes, remove Advanced Security features from some repositories or buy additional licenses.',
    )
    expect(bannerText).toBeInTheDocument()
  })

  it('does not render a banner when the organization is using less GHAS licenses than it has', async () => {
    // By default, the mock data doesn't have the allowance exceeded:
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    render(TestComponent(), {routePayload, wrapper})

    const bannerText = screen.queryByText(
      'Configurations with GitHub Advanced Security cannot be applied because your organization is using',
    )
    expect(bannerText).not.toBeInTheDocument()
  })

  it('renders error message when license info cannot be fetched on page load', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.licenses = {...routePayload.licenses, failedToFetchLicenses: true}
    render(TestComponent(), {routePayload, wrapper})

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent('Unable to calculate license information. Please try again later.')
  })

  it('renders error message when overall license info and license summary cannot be fetched', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.licenses = {...routePayload.licenses, failedToFetchLicenses: true}
    const {rerender} = render(TestComponent(), {routePayload, wrapper})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {error: 'Summary information not available'},
      {ok: false, status: 422},
    )

    const repo = routePayload.repositories[0]!
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      rerender(TestComponent({[repo.id]: repo}, 1))
    })

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(
      'We are unable to calculate how many licenses this application would require in advance',
    )
  })

  it('renders error message when overall license info can be fetched, but not license summary', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    const {rerender} = render(TestComponent(), {routePayload, wrapper})

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {error: 'Summary information not available'},
      {ok: false, status: 422},
    )

    const repo = routePayload.repositories[0]!
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      rerender(TestComponent({[repo.id]: repo}, 1))
    })

    const element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(/0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc/)
    expect(element).toHaveTextContent(
      /We are unable to calculate how many licenses this application would require in advance/,
    )
  })

  it('refreshes overall license info when it could be not fetched previously', async () => {
    const routePayload = getOrganizationSettingsSecurityProductsRoutePayload()
    routePayload.licenses = {...routePayload.licenses, failedToFetchLicenses: true}
    const {rerender} = render(TestComponent(), {routePayload, wrapper})

    let element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(/Unable to calculate license information. Please try again later./)

    mockFetch.mockRouteOnce(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        licenses_needed: 10,
        licenses_freed: 1,
        allowanceExceeded: false,
        remainingSeats: 0,
        consumedSeats: 1,
        exceededSeats: 0,
        business: 'GitHub, Inc',
        hasUnlimitedSeats: false,
        failedToFetchLicenses: false,
      },
    )
    const repo = routePayload.repositories[0]!
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      rerender(TestComponent({[repo.id]: repo}, 1))
    })

    expectMockFetchCalledWith(
      '/organizations/github/settings/security_products/repositories/advanced_security_license_summary',
      {
        repository_ids: ['1'],
        include_license_overview: true,
      },
    )

    element = screen.queryByTestId('license-summary')
    expect(element).toHaveTextContent(
      /0 GitHub Advanced Security licenses available, 1 in use by GitHub, Inc.For configurations with GitHub Advanced Security: 10 licenses required if applying and 1 license freed up if disabling/,
    )
  })
})
