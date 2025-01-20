import {Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {issueLinkedPullRequestHovercardPath} from '@github-ui/paths'
import type {Repository} from '@github-ui/current-repository'
import {type PullRequest, PullRequestStatus} from '../types'
import PullRequestMetadataLabel from './PullRequestMetadataLabel'

interface PullRequestLabelProps {
  repo: Repository
  pullRequest: PullRequest
  sx?: BetterSystemStyleObject
}

function getStatus(pullRequest: PullRequest): PullRequestStatus {
  if (pullRequest.state === 'open' && pullRequest.reviewableState === 'draft') {
    return PullRequestStatus.Draft
  } else if (pullRequest.state === 'open') {
    return PullRequestStatus.Open
  } else if (pullRequest.merged) {
    return PullRequestStatus.Merged
  } else {
    return PullRequestStatus.Closed
  }
}

export default function PullRequestLabel({repo, pullRequest, sx}: PullRequestLabelProps) {
  const {permalink, number} = pullRequest
  const status = getStatus(pullRequest)
  return (
    <Link
      href={permalink}
      muted
      sx={{fontWeight: 'normal', alignItems: 'center'}}
      target="_blank"
      data-hovercard-url={issueLinkedPullRequestHovercardPath({
        owner: repo.ownerLogin,
        repo: repo.name,
        pullRequestNumber: number,
      })}
      aria-label={`Link to the ${status.toLowerCase()} pull request #${number}`}
    >
      <PullRequestMetadataLabel kind="pull-request" number={pullRequest.number} status={status} sx={sx} />
    </Link>
  )
}
