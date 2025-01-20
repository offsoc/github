import type {ExemptionRequest, ExemptionResponse} from '../delegated-bypass-types'
import type {User} from '@github-ui/user-selector'

const monalisaUser: User = {
  name: 'Mona Lisa',
  login: 'monalisa',
  primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/2?s=80',
  path: '/monalisa',
}

const collaborator: User = {
  name: 'Collab Orator',
  login: 'collaborator',
  primaryAvatarUrl: 'https://example.com/avatar.png',
  path: '/collaborator',
}

const metadata: Record<string, unknown> = {
  metadata: undefined,
}

export const baseExemptionUrl = `/monalisa/smile/exemptions/`

const approvedResponse: ExemptionResponse = {
  reviewer: collaborator,
  status: 'approved',
  createdAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
  id: 1,
  updatedAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
}

const deniedResponse: ExemptionResponse = {
  ...approvedResponse,
  status: 'rejected',
}

const dismissedResponse: ExemptionResponse = {
  ...approvedResponse,
  status: 'dismissed',
}

export const exampleRequest: ExemptionRequest = {
  id: 1,
  number: 1,
  rulesetNames: ['ruleset1', 'ruleset2'],
  requester: monalisaUser,
  createdAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
  expired: false,
  status: 'pending',
  requestType: 'push',
  exemptionResponses: [],
  metadata,
  changedRulesets: [],
  repoExemptionsBaseUrl: '/monalisa/smile/exemptions/1',
}

export const approvedRequest: ExemptionRequest = {
  ...exampleRequest,
  id: 2,
  number: 2,
  status: 'approved',
  exemptionResponses: [approvedResponse],
}

export const deniedRequest: ExemptionRequest = {
  ...exampleRequest,
  id: 3,
  number: 3,
  status: 'rejected',
  exemptionResponses: [deniedResponse],
}

export const completedRequest: ExemptionRequest = {
  ...exampleRequest,
  id: 4,
  number: 4,
  status: 'completed',
  exemptionResponses: [approvedResponse],
}

export const expiredRequest: ExemptionRequest = {
  ...exampleRequest,
  id: 5,
  number: 5,
  expired: true,
}

export const cancelledRequest: ExemptionRequest = {
  ...exampleRequest,
  id: 6,
  number: 6,
  status: 'cancelled',
}

export const requestWithDismissedResponse: ExemptionRequest = {
  ...exampleRequest,
  id: 7,
  number: 7,
  exemptionResponses: [dismissedResponse],
}
