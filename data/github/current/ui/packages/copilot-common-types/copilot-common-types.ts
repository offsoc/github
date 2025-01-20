import type {FeatureRequestInfo} from '@github-ui/feature-request/types'

export interface CopilotBusiness {
  activeTrial: boolean
  trialEndsAt: string
  name: string
  path: string
  documentation: string
}

export interface CopilotAccessPayload {
  accessAllowed?: boolean
  userHasCFIAccess: boolean
  hasSubscriptionEnded: boolean
  business?: CopilotBusiness
}

export interface CopilotAccessInfo extends CopilotAccessPayload {
  orgHasCFBAccess: boolean
  userHasOrgs: boolean
  userIsOrgAdmin: boolean
  userIsOrgMember: boolean
  featureRequestInfo?: FeatureRequestInfo
}

export interface CopilotInfo {
  notices: {
    codeViewPopover?: {
      dismissed: boolean
      dismissPath: string
    }
  }
  documentationUrl: string
  userAccess?: CopilotAccessInfo
}
