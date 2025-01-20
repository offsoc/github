import {PageHeader} from '@primer/react/experimental'
import {useStickyHeader} from '@github-ui/use-sticky-header/useStickyHeader'
import {PullRequestStateLabel, type PullRequestState} from './PullRequestStateLabel'
import {PullRequestHeaderSummary} from './PullRequestHeaderSummary'
import type {Repository} from '@github-ui/current-repository'

// Same wrapper classes as classic Rails pr#commits
export const responsiveWrapperClasses = 'container-xl px-3 px-md-4 px-lg-5'

interface StickyPullRequestHeaderData {
  author: string
  baseBranch: string
  commitsCount: number
  headBranch: string
  headRepositoryOwnerLogin?: string
  headRepositoryName?: string
  isInAdvisoryRepo: boolean
  mergedBy?: string
  number: number
  state: PullRequestState
  title: string
  url: string
}

export interface StickyPullRequestHeaderProps {
  repository: Repository
  pullRequest: StickyPullRequestHeaderData
}

export function StickyPullRequestHeader({repository, pullRequest}: StickyPullRequestHeaderProps) {
  const {stickyStyles} = useStickyHeader()

  // Force title area to take up full width of page, to match left and right spacing around page main content area
  const fullWidthSx = {
    gridColumn: '1/-1',
    minWidth: ['100vw', '100vw', '100vw', '1280px'],
  }

  return (
    <PageHeader className="py-2 border-bottom color-shadow-small" sx={stickyStyles}>
      <PageHeader.TitleArea className={`flex-items-center ${responsiveWrapperClasses}`} sx={fullWidthSx}>
        <PageHeader.LeadingVisual>
          <PullRequestStateLabel state={pullRequest.state} />
        </PageHeader.LeadingVisual>
        <PageHeader.Title className="lh-condensed">
          <div>
            <bdi className="f5 text-bold">{pullRequest.title}</bdi>
            <span className="f5 text-normal pl-2 fgColor-muted d-inline">#{pullRequest.number}</span>
            <div className="f6 text-normal">
              <PullRequestHeaderSummary
                author={pullRequest.author}
                baseBranch={pullRequest.baseBranch}
                baseRepositoryOwnerLogin={repository.ownerLogin}
                baseRepositoryName={repository.name}
                commitsCount={pullRequest.commitsCount}
                headBranch={pullRequest.headBranch}
                headRepositoryOwnerLogin={pullRequest.headRepositoryOwnerLogin}
                headRepositoryName={pullRequest.headRepositoryName}
                isInAdvisoryRepo={pullRequest.isInAdvisoryRepo}
                mergedBy={pullRequest.mergedBy}
                state={pullRequest.state}
              />
            </div>
          </div>
        </PageHeader.Title>
      </PageHeader.TitleArea>
    </PageHeader>
  )
}
