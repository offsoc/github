import {issueLinkedPullRequestHovercardPath} from '@github-ui/paths'
import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
} from '@primer/octicons-react'
import {ActionList, Box, Link, Octicon, Text, useTheme} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import type {PullRequest$key} from './__generated__/PullRequest.graphql'

type Props = {
  pullRequest: PullRequest$key
  hovercard?: boolean
}

export const PullRequestFragment = graphql`
  fragment PullRequest on PullRequest {
    id
    title
    number
    merged
    closed
    isDraft
    repository {
      name
      owner {
        login
      }
    }
    url
  }
`

export function PullRequest({pullRequest, hovercard}: Props) {
  const {
    id,
    number,
    title,
    repository: {owner, name},
    url,
    merged,
    closed,
    isDraft,
  } = useFragment(PullRequestFragment, pullRequest)
  const {login} = owner

  const {theme} = useTheme()

  const getIcon = () => {
    if (merged) {
      return <Octicon icon={GitMergeIcon} size={16} sx={{color: theme?.colors.done.fg}} />
    } else if (closed) {
      return <Octicon icon={GitPullRequestClosedIcon} size={16} sx={{color: theme?.colors.closed.fg}} />
    } else if (isDraft) {
      return <Octicon icon={GitPullRequestDraftIcon} size={16} sx={{color: 'fg.subtle'}} />
    } else {
      return <Octicon icon={GitPullRequestIcon} size={16} sx={{color: theme?.colors.open.fg}} />
    }
  }

  if (hovercard) {
    return (
      <Link
        href={url}
        target="_blank"
        data-hovercard-url={issueLinkedPullRequestHovercardPath({
          owner: login,
          repo: name,
          pullRequestNumber: number,
        })}
        sx={{color: 'fg.muted', fontWeight: 'normal', alignItems: 'center'}}
        aria-label={`link to the issue #${title}`}
      >
        <GitPullRequestIcon size={16} />
        <Text sx={{ml: 1}}>1</Text>
      </Link>
    )
  }

  return (
    <ActionList.Item key={id}>
      <ActionList.LeadingVisual>{getIcon()}</ActionList.LeadingVisual>
      <Box
        as="a"
        href={url}
        sx={{display: 'flex', flexDirection: 'column', color: 'fg.default', ':hover': {textDecoration: 'none'}}}
        aria-label={`link to the issue #${title}`}
      >
        <span>{title}</span>
        <Text sx={{fontSize: 0, color: 'fg.muted'}}>{`${login}#${number}`}</Text>
      </Box>
    </ActionList.Item>
  )
}
