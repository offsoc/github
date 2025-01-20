import {GitHubAvatar} from '@github-ui/github-avatar'
import {Link} from '@primer/react'
import {userHovercardPath} from '@github-ui/paths'
import type {User} from '@github-ui/user-selector'

export function User({user}: {user: User}) {
  return (
    <>
      <Link aria-label={`View ${user.login} profile`} href={user.path}>
        <GitHubAvatar
          sx={{mr: 2, cursor: 'pointer'}}
          src={user.primaryAvatarUrl}
          data-hovercard-url={userHovercardPath({owner: user.login})}
          square={user.path.startsWith('/apps/')}
        />
      </Link>
      <Link
        muted
        href={user.path}
        data-hovercard-url={userHovercardPath({owner: user.login})}
        sx={{
          fontWeight: 600,
          color: 'fg.default',
          '&:hover': {color: 'fg.default', textDecoration: 'underline'},
        }}
      >
        {user.login}
      </Link>
    </>
  )
}
