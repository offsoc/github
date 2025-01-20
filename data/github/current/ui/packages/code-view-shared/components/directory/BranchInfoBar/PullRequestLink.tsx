import type {Repository} from '@github-ui/current-repository'
import {pullRequestPath} from '@github-ui/paths'
import {GitPullRequestIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'

interface Props {
  repo: Repository
  pullRequestNumber: number
}

export function PullRequestLink({repo, pullRequestNumber}: Props) {
  return (
    <Link
      href={pullRequestPath({repo, number: pullRequestNumber})}
      sx={{display: 'flex', gap: 1, alignItems: 'center', color: 'fg.muted', '&:hover': {color: 'accent.fg'}}}
    >
      <GitPullRequestIcon size={16} />#{pullRequestNumber}
    </Link>
  )
}
