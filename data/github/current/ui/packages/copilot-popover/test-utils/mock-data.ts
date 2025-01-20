import type {FeatureRequestInfo} from '@github-ui/feature-request/types'
import type {CopilotAccessInfo, CopilotInfo} from '@github-ui/copilot-common-types'

export const testFeatureRequestInfo: FeatureRequestInfo = {
  isEnterpriseRequest: false,
  showFeatureRequest: true,
  alreadyRequested: false,
  dismissed: false,
  featureName: 'copilot_for_business',
  requestPath: '/path/to/request',
}

export const testCopilotAccessInfo: CopilotAccessInfo = {
  accessAllowed: true,
  hasSubscriptionEnded: false,
  orgHasCFBAccess: false,
  userHasCFIAccess: false,
  userHasOrgs: false,
  userIsOrgAdmin: false,
  userIsOrgMember: false,
  business: {
    activeTrial: false,
    trialEndsAt: '2021-01-01T00:00:00Z',
    name: 'businessName',
    path: '/path/to/business',
    documentation: 'documentation_url.com',
  },
  featureRequestInfo: testFeatureRequestInfo,
}

export const testCopilotInfo: CopilotInfo = {
  documentationUrl: 'https://www.github.com/copilot_documentation_url',
  notices: {
    codeViewPopover: {
      dismissed: false,
      dismissPath: '/test-dismiss-popover',
    },
  },
  userAccess: testCopilotAccessInfo,
}
