import type {ExtendedRepository, IssueState, IssueStateReason, PullRequestState} from '../common-contracts'
import type {ItemType} from '../memex-items/item-type'

export interface SuggestedRepository extends ExtendedRepository {
  createdAt: Date
  lastInteractionAt: Date | null
  pushedAt: Date | null
}

export interface GetSuggestedRepositoriesResponse {
  repositories: Array<SuggestedRepository>
}

export interface SearchRepositoriesResponse {
  repositories: Array<SuggestedRepository>
}

export interface SearchRepositoryItemsResponse {
  issuesAndPulls: Array<RepositoryItem>
}

export interface CountMatchedRepositoryItemsRequest {
  query: string
  repositoryId: number
  memexNumber: number
}

export interface CountMatchedRepositoryItemsResponse {
  count: number
}

interface BaseItem {
  id: number
  title: string
  number: number
  updatedAt: Date
  lastInteractionAt: Date | null
}

export interface SuggestedIssue extends BaseItem {
  state: IssueState
  stateReason?: IssueStateReason
  type: typeof ItemType.Issue
}

export interface SuggestedPullRequest extends BaseItem {
  state: PullRequestState
  type: typeof ItemType.PullRequest
  isDraft?: boolean
}

export type RepositoryItem = SuggestedIssue | SuggestedPullRequest
