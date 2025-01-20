import type {SecurityCampaignCreateButtonProps} from '../components/SecurityCampaignCreateButton'

export function getSecurityCampaignCreationProps(
  props?: Partial<SecurityCampaignCreateButtonProps>,
): SecurityCampaignCreateButtonProps {
  return {
    query: 'is:open',
    campaignCreationPath: '/orgs/github/security/campaigns',
    campaignManagersPath: '/github/security-campaigns/security/campaigns/managers',
    campaignAlertsSummaryPath: 'orgs/github/security/campaigns/alerts/summary',
    orgCampaignsCount: 3,
    maxCampaigns: 10,
    currentUser: {
      id: 1,
      login: 'ghost',
      avatarUrl: 'https://avatars.githubusercontent.com/ghost',
    },
    showOnboardingNotice: false,
    dismissOnboardingNoticePath: '/settings/dismiss-notice/security_campaigns_onboarding',
    defaultDueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
    alertsCount: 100,
    maxAlerts: 1000,
    ...props,
  }
}
