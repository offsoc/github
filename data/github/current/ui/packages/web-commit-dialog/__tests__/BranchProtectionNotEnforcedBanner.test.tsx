import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {render, screen} from '@testing-library/react'

import {BranchProtectionNotEnforcedBanner} from '../BranchProtectionNotEnforcedBanner'

describe('BranchProtectionNotEnforcedBanner', () => {
  const branch = 'main'

  it('renders the banner message', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({showUpgradeButton: true})}
      />,
    )

    expect(screen.getByRole('link', {name: 'rulesets'})).toBeInTheDocument()
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(screen.getByTestId('Upgrade-Btn')).toBeInTheDocument()
  })

  it('renders the feature request component', () => {
    render(
      <AnalyticsProvider appName={''} category={''} metadata={{}}>
        <BranchProtectionNotEnforcedBanner
          branch={branch}
          protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({showFeatureRequest: true})}
        />
      </AnalyticsProvider>,
    )

    expect(screen.getByTestId('feature-request-request-button')).toBeInTheDocument()
  })

  it('org owned repo renders correct message as admin for protected branches', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: true,
          askAdmin: false,
          branchProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('pb-org')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'protected branch rules'})).toBeInTheDocument()
    expect(
      screen.getByText(
        " branch won't be enforced on this private repository until you upgrade this organization to a GitHub Team or Enterprise account.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('org owned repo renders correct message as admin for rulesets', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: true,
          askAdmin: false,
          rulesetsProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('ru-org')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'rulesets'})).toBeInTheDocument()
    expect(
      screen.getByText(
        " branch won't be enforced on this private repository until you upgrade this organization to GitHub Team.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('org owned repo renders correct message as admin for both rulesets and protected branches', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: true,
          askAdmin: false,
          branchProtected: true,
          rulesetsProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('ru-org')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'rulesets'})).toBeInTheDocument()
    expect(
      screen.getByText(
        " branch won't be enforced on this private repository until you upgrade this organization to GitHub Team.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('org owned repo renders correct message as non-admin for rulesets', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: true,
          askAdmin: true,
          rulesetsProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('ru-org')).toBeInTheDocument()
    expect(screen.getByText('The rulesets targeting your', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(
      screen.getByText(
        "branch won't be enforced on this private repository until your organization admins upgrade this organization account to GitHub Team.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('org owned repo renders correct message as non-admin with rulesets and protected branches', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: true,
          askAdmin: true,
          rulesetsProtected: true,
          branchProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('ru-org')).toBeInTheDocument()
    expect(screen.getByText('The rulesets targeting your', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('main')).toBeInTheDocument()
    expect(
      screen.getByText(
        "branch won't be enforced on this private repository until your organization admins upgrade this organization account to GitHub Team.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('personal private repo renders correct message as admin for protected branches', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: false,
          askAdmin: false,
          branchProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('pb-personal')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'protected branch rules'})).toBeInTheDocument()
    expect(
      screen.getByText(
        " branch won't be enforced on this private repository until you move to a GitHub Team or Enterprise account.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('personal private repo renders correct message as admin for rulesets', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: false,
          askAdmin: false,
          rulesetsProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('ru-personal')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'rulesets'})).toBeInTheDocument()
    expect(
      screen.getByText(
        " branch won't be enforced on this private repository until you move to a GitHub Team organization account.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })

  it('personal private repo renders correct message as admin with both rulesets and protected branches', () => {
    render(
      <BranchProtectionNotEnforcedBanner
        branch={branch}
        protectionNotEnforcedInfo={getProtectionNotEnforcedInfo({
          organization: false,
          askAdmin: false,
          rulesetsProtected: true,
          branchProtected: true,
        })}
      />,
    )

    expect(screen.getByTestId('ru-personal')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'rulesets'})).toBeInTheDocument()
    expect(
      screen.getByText(
        " branch won't be enforced on this private repository until you move to a GitHub Team organization account.",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })
})

function getProtectionNotEnforcedInfo({
  editRepositoryBranchesPath = '',
  editRepositoryRulesetsPath = '',
  organization = false,
  branchProtected = false,
  rulesetsProtected = false,
  showUpgradeButton = false,
  askAdmin = false,
  showFeatureRequest = false,
  featureName = 'protected_branches',
  ctaPath = '',
}) {
  return {
    editRepositoryBranchesPath,
    editRepositoryRulesetsPath,
    organization,
    branchProtected,
    rulesetsProtected,
    upsellCtaInfo: {
      visible: true,
      cta: {
        showUpgradeButton,
        askAdmin,
        ctaPath,
      },
    },
    featureRequestInfo: {
      isEnterpriseRequest: false,
      showFeatureRequest,
      alreadyRequested: false,
      dismissed: false,
      featureName,
      requestPath: '',
    },
  }
}
