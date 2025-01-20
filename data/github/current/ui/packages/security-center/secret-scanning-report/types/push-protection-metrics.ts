export interface PushProtectionMetricsResponse {
  totalBlocksCount: number
  successfulBlocksCount: number
  bypassedAlertsCount: number
  bypassRequestsCount: number
  meanResponseTime: number
  blocksByTokenTypeCounts: TokenTypeCount[]
  blocksByRepositoryCounts: RepositoryCount[]
  bypassesByTokenTypeCounts: TokenTypeCount[]
  bypassesByRepositoryCounts: RepositoryCount[]
  bypassesByReasonCounts: BypassReasonCount[]
  bypassesByRequestStatusCounts: BypassRequestStatus[]
}

export interface BaseAggregateCount {
  name: string
  count: number
}

export interface TokenTypeCount extends BaseAggregateCount {
  type: AggregateCountType.TokenType
  slug: string
  isCustomPattern: boolean
  hasMetadata: boolean
}

export interface RepositoryCount extends BaseAggregateCount {
  type: AggregateCountType.Repository
}

export interface BypassReasonCount extends BaseAggregateCount {
  type: AggregateCountType.BypassReason
  percent: number
}

export interface BypassRequestStatus extends BaseAggregateCount {
  type: AggregateCountType.BypassRequestStatus
  percent: number
}

export type AggregateCount = TokenTypeCount | RepositoryCount | BypassReasonCount

export enum AggregateCountType {
  TokenType = 'TOKEN_TYPE',
  Repository = 'REPOSITORY',
  BypassReason = 'BYPASS_REASON',
  BypassRequestStatus = 'BYPASS_REQUEST_STATUS',
}
