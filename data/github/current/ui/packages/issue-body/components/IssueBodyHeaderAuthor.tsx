import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'
import {Box, Link} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {VALUES} from '../constants/values'
import type {IssueBodyHeaderAuthor$key} from './__generated__/IssueBodyHeaderAuthor.graphql'

export function IssueBodyHeaderAuthor({
  author,
  showLogin,
}: {
  author: IssueBodyHeaderAuthor$key | null
  showLogin?: boolean
}) {
  const data = useFragment(
    graphql`
      fragment IssueBodyHeaderAuthor on Actor {
        login
        avatarUrl
        profileUrl
      }
    `,
    author,
  )

  const {login, avatarUrl, profileUrl} = data || VALUES.ghost

  return (
    <Box sx={{display: showLogin ? 'inline' : 'block'}}>
      <Link
        href={profileUrl || undefined}
        data-hovercard-url={userHovercardPath({owner: login})}
        data-testid="issue-body-header-author"
        sx={{
          color: 'fg.default',
          fontWeight: 500,
        }}
      >
        {/* we should keep the size in sync with VALUES.timelineAvatarSize but for some reasons this breaks the storybook for the issue-viewer :/ */}
        {showLogin ? login : <GitHubAvatar src={avatarUrl} size={24} alt={`@${login}`} />}
      </Link>
    </Box>
  )
}
