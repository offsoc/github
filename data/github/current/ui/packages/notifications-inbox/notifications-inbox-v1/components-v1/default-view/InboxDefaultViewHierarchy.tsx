/* eslint eslint-comments/no-use: off */
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Box, Link} from '@primer/react'

type OwnerProps = {
  login: string | null
  avatarUrl: string | null
  url: string
  repoUrl: string
  listName: string
}

type Props = {
  owner: OwnerProps
  listType: 'Team' | 'Organization' | 'User' | 'Repository' | 'Enterprise'
}

const NotificationDefaultViewHierarchy = ({owner, listType}: Props) => {
  return (
    <Box
      sx={{
        color: 'fg.muted',
        fontWeight: 'normal',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        mb: 2,
      }}
    >
      {owner.avatarUrl && owner.login && (
        <GitHubAvatar
          square={listType === 'Organization'}
          src={owner.avatarUrl}
          size={16}
          alt={owner.login}
          sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))'}}
        />
      )}
      {owner.login && (
        <Link href={owner.url} sx={{color: 'fg.muted', fontWeight: 'normal', ml: 2, mr: 1}}>
          {owner.login}
        </Link>
      )}
      {owner.repoUrl && owner.listName && (
        <>
          {'/'}
          <Link href={owner.repoUrl} sx={{color: 'fg.muted', fontWeight: 'normal', ml: 1}}>
            {owner.listName}
          </Link>
        </>
      )}
    </Box>
  )
}

export default NotificationDefaultViewHierarchy
