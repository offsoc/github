import type {Author} from '@github-ui/commit-attribution'
import type {SafeHTMLString} from '@github-ui/safe-html'

export interface Organization {
  id: number
  name: string
  ownerLogin: string
}

export interface Enterprise {
  id: number
  name: string
  ownerLogin: string
  enterpriseManaged: boolean
}

export interface RefInfo {
  name: string
  listCacheKey: string
  refType?: 'branch' | 'tag' | 'tree'

  /**
   * Specific permission for the current user on this ref.
   */
  canEdit: boolean

  /**
   * The OID hash of the commit at the head of the ref.
   */
  currentOid: string
}

export interface Commit {
  oid: string
  url: string
  date: string
  shortMessageHtmlLink?: SafeHTMLString
  bodyMessageHtml?: SafeHTMLString
  author?: Author

  authors?: Author[]
  committer?: Author
  committerAttribution?: boolean
}

export interface CommitWithStatus extends Commit {
  /**
   * CI status of the commit.
   */
  status?: 'success' | 'pending' | 'failure'

  /**
   * True if the commit doesn't belong to any branch in the repository.
   */
  isSpoofed?: boolean
}

export type CurrentUser = Pick<User, 'id' | 'login' | 'userEmail'>

interface User {
  id: number
  login: string
  userEmail: string
  primaryAvatarUrl: string
  profileLink: string
}

export interface ContributorsInfo {
  totalCount: number
  users: ContributorUser[]
}

export interface ContributorUser extends User {
  commitsCount: number
}
