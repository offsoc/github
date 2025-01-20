import {Box, Link, RelativeTime} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {userHovercardPath} from '@github-ui/paths'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

interface UpdatedByProps {
  user?: {
    login: string
    name: string
    path: string
    avatarUrl: string
  }
  updatedAt: string
  deletedAt?: string
  sx?: BetterSystemStyleObject
}

export function UpdatedBy({user, updatedAt, deletedAt = undefined, sx = {}}: UpdatedByProps) {
  return (
    <Box sx={{...sx, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      {user &&
        (user.path.startsWith('/apps/') ? (
          <Tooltip text={user.name}>
            <Link href={user.path} sx={{display: 'flex', alignItems: 'center'}}>
              <GitHubAvatar
                aria-label={user.login}
                src={user.avatarUrl}
                alt={user.login}
                sx={{mr: 2}}
                size={16}
                square={true}
              />
            </Link>
          </Tooltip>
        ) : (
          <Link
            href={user.path}
            data-hovercard-url={userHovercardPath({owner: user.login})}
            sx={{display: 'flex', alignItems: 'center'}}
          >
            <GitHubAvatar
              aria-label={user.login}
              src={user.avatarUrl}
              alt={user.login}
              sx={{mr: 2}}
              size={16}
              square={false}
            />
          </Link>
        ))}
      {deletedAt && <span>Deleted</span>}&nbsp;
      <RelativeTime datetime={deletedAt || updatedAt} tense="past" />
    </Box>
  )
}
