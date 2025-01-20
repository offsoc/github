import type {Author} from '@github-ui/commit-attribution'
import type {SignatureResult, VerificationStatus} from '@github-ui/signed-commit-badge'
import type {User} from '@github-ui/user-selector'

import type {Commit, CommitsBasePayload, RefInfo} from './shared'

export interface CommitsPayload extends CommitsBasePayload {
  currentCommit: Pick<Commit, 'oid'>
  commitGroups: CommitGroup[]
  filters: CommitsFilters
  metadata: CommitsMetadata

  refInfo: RefInfo
  timedOutMessage: string
}

interface RenameHistory {
  historyUrl: string
  hasRenameCommits: boolean
  oldName: string | null
}

export interface DeferredData {
  deferredCommits: Array<DeferredCommitData | undefined>
  //null means there is no rename history relevant for the current page
  renameHistory: RenameHistory | null
  loading: boolean
}

export interface LoggingInformation {
  loggingPayload?: {[key: string]: unknown}
  loggingPrefix?: string
}

interface SignatureResultNoHelpUrl extends Omit<SignatureResult, 'helpUrl'> {}

export interface DeferredCommitData {
  oid: string
  commentCount?: number
  statusCheckStatus: StatusCheckStatus | undefined
  signatureInformation?: SignatureResultNoHelpUrl | undefined
  verifiedStatus?: VerificationStatus
  onBehalfOf?: Author
}

interface StatusCheckStatus {
  state: 'failure' | 'pending' | 'success' | 'error' | undefined
  short_text: string | undefined
}

export interface PaginationCursor {
  hasNextPage: boolean
  hasPreviousPage: boolean
  //the string to add to the URL as the 'after' parameter when a user clicks next
  endCursor: string
  //the string to add to the URL as the 'before' parameter when a user clicks previous
  startCursor: string
}

export interface CommitGroup {
  title: string
  commits: Commit[]
}

export interface CommitsFilters {
  since: string | null
  until: string | null
  currentBlobPath: string
  author: User | null
  pagination: PaginationCursor
  newPath: string | null
  originalBranch: string | null
}

interface CommitsMetadata {
  browsingRenameHistory: boolean
  showProfileHelp: boolean
  deferredDataUrl: string
  deferredContributorUrl: string
  softNavToCommit: boolean
}
