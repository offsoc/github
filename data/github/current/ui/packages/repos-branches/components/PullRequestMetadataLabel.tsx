import {
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react'
import {Label, Octicon, Text, useTheme} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {PullRequestStatus} from '../types'

interface BaseProps {
  kind: 'merge-queue' | 'pull-request'
  sx?: BetterSystemStyleObject
}
interface MergeQueueLabelProps extends BaseProps {
  kind: 'merge-queue'
  queueCount: number // Number of pull requests in the queue
}

interface PullRequestLabelProps extends BaseProps {
  kind: 'pull-request'
  number: number // Pull request number
  status: PullRequestStatus // Pull request status
}

type PullRequestMetadata = MergeQueueLabelProps | PullRequestLabelProps
function LabelIcon({
  kind,
  status,
  queueCount,
}: {
  kind: 'pull-request' | 'merge-queue'
  status: PullRequestStatus | null
  queueCount: number | null
}): JSX.Element {
  const {theme} = useTheme()
  if (kind === 'pull-request') {
    switch (status) {
      case PullRequestStatus.Open:
        return (
          <div data-testid="open-pull-request-icon">
            <Octicon size={14} icon={GitPullRequestIcon} sx={{color: theme?.colors.open.fg}} />
          </div>
        )
      case PullRequestStatus.Closed:
        return (
          <div data-testid="closed-pull-request-icon">
            <Octicon size={14} icon={GitPullRequestClosedIcon} sx={{color: theme?.colors.closed.fg}} />
          </div>
        )
      case PullRequestStatus.Merged:
        return (
          <div data-testid="merged-pull-request-icon">
            <Octicon size={14} icon={GitMergeIcon} sx={{color: theme?.colors.done.fg}} />
          </div>
        )
      case PullRequestStatus.Draft:
      default:
        return (
          <div data-testid="draft-pull-request-icon">
            <Octicon size={14} icon={GitPullRequestDraftIcon} sx={{color: 'fg.subtle'}} />
          </div>
        )
    }
  }
  if ((queueCount || 0) > 0) {
    return (
      <div data-testid="merge-queue-icon">
        <Octicon size={14} icon={GitMergeQueueIcon} sx={{color: theme?.colors.attention.fg}} />
      </div>
    )
  }
  return (
    <div data-testid="merge-queue-icon">
      <Octicon size={14} icon={GitMergeQueueIcon} sx={{color: 'fg.subtle'}} />
    </div>
  )
}

export default function PullRequestMetadataLabel({sx, ...pullRequestMetadata}: PullRequestMetadata) {
  const number =
    pullRequestMetadata.kind === 'pull-request' ? pullRequestMetadata.number : pullRequestMetadata.queueCount
  return (
    <Label size="small" sx={{...sx, '&:hover': {bg: 'canvas.subtle'}}}>
      <LabelIcon
        kind={pullRequestMetadata.kind}
        status={pullRequestMetadata.kind === 'pull-request' ? pullRequestMetadata.status : null}
        queueCount={pullRequestMetadata.kind === 'merge-queue' ? number : null}
      />
      <Text sx={{ml: 1, color: 'fg.muted'}}>
        {pullRequestMetadata.kind === 'pull-request' ? '#' : ''}
        {number}
      </Text>
    </Label>
  )
}
