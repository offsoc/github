import type {Repository} from '@github-ui/current-repository'
import type {NavigationUrls} from '../../components/PullRequestHeaderNavigation'
import type {PullRequestState} from '../../components/PullRequestStateLabel'
import type {SafeHTMLString} from '@github-ui/safe-html'

type BannersType = {
  banners: {
    pausedDependabotUpdate: {render: boolean}
    hiddenCharacterWarning: {render: boolean}
  }
}

export type HeaderPageData = {
  bannersData: BannersType
  pullRequest: PullRequest
  repository: Repository & {
    codespacesEnabled: boolean
    copilotEnabled: boolean
    isEnterprise: boolean
    editorEnabled: boolean
  }
  urls: NavigationUrls
  user: {
    canChangeBase: boolean
    canEditTitle: boolean
  }
}

interface PullRequest {
  author: string
  baseBranch: string
  commitsCount: number
  headBranch: string
  headRepositoryName?: string
  headRepositoryOwnerLogin?: string
  isInAdvisoryRepo: boolean
  linesAdded?: number
  linesDeleted?: number
  linesChanged?: number
  mergedBy?: string
  number: number
  state: PullRequestState
  title: string
  titleHtml: SafeHTMLString
  url: string
}
