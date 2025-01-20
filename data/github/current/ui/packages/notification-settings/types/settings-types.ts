/**
 * Encapsulate an organization from API response
 */
export interface OrganizationRecord {
  id: number
  avatarUrl: string
  login: string
  email: string
  canReceiveNotifications: boolean
  restrictNotificationsToVerifiedEmail: boolean
  userHasEmailEligableDomainNotificationEmail: boolean
  notifiableEmailsForUser: string[]
  display: boolean
}

export interface SettingsPayload {
  newsiesAvailable: boolean
  restrictedOrgLogins: string[]
  vulnerabilitySubscription: string
  autoSubscribeRepositories: boolean
  autoSubscribeTeams: boolean
  continuousIntegrationEmail: boolean
  continuousIntegrationFailuresOnly: boolean
  continuousIntegrationWeb: boolean
  participatingSettings: string[]
  subscribedSettings: string[]
  vulnerabilityCli: boolean
  vulnerabilityEmail: boolean
  vulnerabilityWeb: boolean
  orgDeployKeySettings: string[]
  notifiableEmails: string[]
  pullRequestReview: boolean
  pullRequestPush: boolean
  ownViaEmail: boolean
  commentEmail: boolean
  emails: {
    global: {
      address: string
      readonly: boolean
    }
  }
  watchingUrl: string
  actionsUrl: string
  dependabotHelpUrl: string
}
