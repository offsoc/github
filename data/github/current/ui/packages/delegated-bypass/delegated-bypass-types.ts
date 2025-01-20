import type {Repository as Repo} from '@github-ui/current-repository'
// eslint-disable-next-line @github-ui/github-monorepo/restrict-package-deep-imports
import type {RuleSuite as RS, TimePeriod} from '@github-ui/repos-rules/types/rules-types'
import type {BypassActorType} from '@github-ui/bypass-actors/types'
import type {User} from '@github-ui/user-selector'

export type RuleSuite = Omit<RS, 'repository'> & {repository: Repository}
type Repository = Repo & {url: string; nameWithOwner: string}

export type Ruleset = {id: number; name: string}

export type AppPayload = {
  request_type: RequestType
  is_stafftools: boolean
  base_avatar_url: string
}

export type createExemptionRequestPayload = {
  message: string
}

export type updateExemptionRequestPayload = {
  status: UpdateStatus
  responseId?: number
}

export type getApproversRequestPayload = {
  rulesetId?: number
}

export type BypassRequestsRoutePayload = {
  exemptionRequests: ExemptionRequest[]
  filter: DelegatedBypassFilter
  hasMoreRequests: boolean
  baseExemptionUrl: string
  sourceType: SourceType
  repositories?: string[]
}

export type ExemptionRequestPayload = {
  ruleSuite: RuleSuite
  request: ExemptionRequest
  rulesets?: Ruleset[]
  responses: ExemptionResponse[]
  reviewer?: {
    isValid: boolean
    isRequester: boolean
    hasUndismissedReview: boolean
    login: string
  }
}

export type NewExemptionRequestPayload = {
  ruleSuite: RuleSuite
  resourceId?: string
  orgGuidanceUrl?: string
  helpUrl?: string
  approvers?: [SecretScanningReviewerUser[], SecretScanningReviewerTeam[]]
}

export type ExemptionRequest = {
  id: number
  number: number
  rulesetNames: string[]
  requester: User
  requesterComment?: string
  createdAt: string
  expiresAt?: string
  expired: boolean
  status: RequestStatus
  requestType: string
  exemptionResponses: ExemptionResponse[] | []
  metadata: Record<string, unknown>
  resourceId?: string
  changedRulesets: Ruleset[]
  repoExemptionsBaseUrl: string
}

export type ExemptionResponse = {
  reviewer: User
  status: ExemptionResponseStatus
  createdAt: string
  rulesetIds?: number[]
  id: number
  updatedAt: string
}

export type BypassActor = {
  name: string
  actorId: number
  actorType: BypassActorType | 'OrganizationAdmin'
}

export type SecretScanningReviewerUser = {
  id: number
  display_login: string
}

export type SecretScanningReviewerTeam = {
  id: number
  org_name: number
  name: string
  slug: string
}

export type RequestType = 'push_ruleset_bypass' | 'secret_scanning'

export type ExemptionResponseStatus = 'approved' | 'rejected' | 'dismissed'

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed' | 'invalid'

export type UpdateStatus = 'approve' | 'reject' | 'cancel' | 'dismiss' | undefined

export type ResourceOwner = 'PullRequest' | 'RuleSuite'

export type FilterableUser = 'Requester' | 'Approver'

export type FilterableRequestStatus = 'all' | 'completed' | 'cancelled' | 'expired' | 'denied' | 'open'

export type SourceType = 'organization' | 'repository'

export type DelegatedBypassFilter = {
  approver?: User
  requester?: User
  timePeriod?: TimePeriod
  requestStatus?: FilterableRequestStatus
  page?: number
  repository?: string
}
