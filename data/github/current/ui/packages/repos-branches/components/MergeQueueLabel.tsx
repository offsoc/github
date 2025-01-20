import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Link, Tooltip} from '@primer/react'
import PullRequestMetadataLabel from './PullRequestMetadataLabel'

interface MergeQueueLabelProps {
  mergeQueueUrl: string // Merge queue url. We may want to change how this is calculated based on the data returned
  queueCount: number // Number of pull requests in the queue
  sx?: BetterSystemStyleObject
}

export default function MergeQueueLabel({queueCount, mergeQueueUrl, sx = {}}: MergeQueueLabelProps) {
  const ariaLabelText = queueCount === 1 ? 'is 1 pull request' : `are ${queueCount} pull requests`
  return (
    <Tooltip aria-label="View the merge queue">
      <Link
        href={mergeQueueUrl}
        muted
        sx={{
          color: 'fg.default',
          fontWeight: 'normal',
          alignItems: 'center',
          '&:hover': {color: 'fg.default', textDecoration: 'none'},
        }}
        aria-label={`There ${ariaLabelText} in the merge queue`}
      >
        <PullRequestMetadataLabel kind="merge-queue" queueCount={queueCount} sx={sx} />
      </Link>
    </Tooltip>
  )
}
