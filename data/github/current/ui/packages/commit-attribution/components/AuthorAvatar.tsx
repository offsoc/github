import type {Repository} from '@github-ui/current-repository'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {commitsByAuthor, userHovercardPath} from '@github-ui/paths'
import {Box, type BoxProps, Link} from '@primer/react'
import type {Author} from '../commit-attribution-types'
import {isBotOrApp} from '../utils'
import {AuthorTooltip} from './AuthorTooltip'
import {useAuthorSettings} from '../contexts/AuthorSettingsContext'
import {AuthorDisplayName} from './AuthorDisplayName'

type AuthorAvatarProps = {
  author: Author | undefined
  repo: Pick<Repository, 'ownerLogin' | 'name'>
  sx?: BoxProps['sx']
}

/**
 * Renders the author of a commit.
 */
export function AuthorAvatar({author, repo, sx = {}}: AuthorAvatarProps) {
  const authorSettings = useAuthorSettings()

  if (!author) return null

  const avatar = (
    <GitHubAvatar
      aria-label={`${author.login || 'author'}`}
      src={author.avatarUrl}
      alt={`${author.login || 'author'}`}
      sx={{mr: 2, mt: '-1px', ml: '1px'}}
      size={authorSettings.avatarSize}
      square={isBotOrApp(author)}
    />
  )

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', ...sx}} data-testid="author-avatar">
      {author.path ? (
        <Link
          href={author.path}
          data-testid="avatar-icon-link"
          data-hovercard-url={author.login ? userHovercardPath({owner: author.login}) : undefined}
        >
          {avatar}
        </Link>
      ) : (
        avatar
      )}
      {author.login ? (
        <AuthorTooltip author={author} renderTooltip={authorSettings.includeTooltip}>
          <Link
            muted
            href={commitsByAuthor({repo, author: author.login})}
            aria-label={`commits by ${author.login}`}
            data-hovercard-url={userHovercardPath({owner: author.login})}
            sx={{
              fontWeight: authorSettings.fontWeight,
              whiteSpace: 'nowrap',
              color: authorSettings.fontColor,
              '&:hover': {color: authorSettings.fontColor, textDecoration: 'underline'},
            }}
          >
            {author.login}
          </Link>
        </AuthorTooltip>
      ) : (
        <AuthorDisplayName displayName={author.displayName} authorSettings={authorSettings} />
      )}
    </Box>
  )
}
