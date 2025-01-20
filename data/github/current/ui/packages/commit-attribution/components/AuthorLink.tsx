import type {RepositoryNWO} from '@github-ui/current-repository'
import {commitsByAuthor, userHovercardPath} from '@github-ui/paths'
import {Box, type BoxProps, Link} from '@primer/react'
import type {Author} from '../commit-attribution-types'
import {AuthorTooltip} from './AuthorTooltip'
import {useAuthorSettings} from '../contexts/AuthorSettingsContext'
import {AuthorDisplayName} from './AuthorDisplayName'

export interface AuthorAvatarProps {
  author: Author | undefined
  repo: RepositoryNWO
  sx?: BoxProps['sx']
}

/**
 * Renders the author of a commit.
 */
export function AuthorLink({author, repo, sx = {}}: AuthorAvatarProps) {
  const authorSettings = useAuthorSettings()

  if (!author) return null

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', ...sx}} data-testid="author-link">
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
