import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {OnboardingTipBanner} from '../OnboardingTipBanner'
import {ShieldCheckIcon} from '@primer/octicons-react'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

test('Renders with string formatting', () => {
  render(
    <OnboardingTipBanner
      link="foo"
      linkText="Back to onboarding"
      heading="Enable Advanced Security with GitHub recommended settings"
      icon={ShieldCheckIcon}
    >
      Click <strong>Apply to</strong> below.
    </OnboardingTipBanner>,
  )
  expect(screen.getByTestId('growth-onboardingTipBanner-icon')).toBeInTheDocument()
  expect(screen.getByTestId('tip-message').textContent).toBe('Click Apply to below.')
  expect(screen.queryByText('Click <strong>Apply to</strong> below.')).not.toBeInTheDocument()
})

test('Can override link & props', async () => {
  const {user} = render(
    <OnboardingTipBanner
      link="/orgs/acme/organization_onboarding/advanced_security"
      linkText="Back to onboarding"
      heading="Enable Advanced Security with GitHub recommended settings"
      icon={ShieldCheckIcon}
    >
      Click <strong>Apply to</strong> below.
    </OnboardingTipBanner>,
  )
  const link = screen.getByRole('link')
  await user.click(link)
  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'advanced_security_onboarding_tip_banner',
      action: 'click_onboarding_tip_banner_return_link',
      label: `ref_cta:Back to onboarding;ref_loc:repo_branches_listing;`,
    },
  })
  expect(link.getAttribute('href')).toBe('/orgs/acme/organization_onboarding/advanced_security')
})
