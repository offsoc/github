import {GitHubAvatar} from '@github-ui/github-avatar'
import {Link} from '@primer/react'
import {userHovercardPath} from '@github-ui/paths'
import type {User} from '@github-ui/user-selector'

export function User({user}: {user: User}) {
  return (
    <Link aria-label={`View ${user.login} profile`} href={user.path} sx={{color: 'fg.default', fontWeight: 600}}>
      <GitHubAvatar
        sx={{mr: 1, cursor: 'pointer'}}
        size={16}
        src={user.primaryAvatarUrl}
        data-hovercard-url={userHovercardPath({owner: user.login})}
        square={user.path.startsWith('/apps/')}
      />
      <span>{user.login}</span>
    </Link>
  )
}
