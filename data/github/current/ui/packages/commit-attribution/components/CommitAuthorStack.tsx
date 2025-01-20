import {AvatarStack} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath, orgHovercardPath} from '@github-ui/paths'
import type {Author} from '../commit-attribution-types'
import {isBotOrApp} from '../utils'
import {useAuthorSettings} from '../contexts/AuthorSettingsContext'

type CommitAuthorStackProps = {
  authors: Author[]
  onBehalfOf?: Author
}

const maxAvatarCount = 5

export function CommitAuthorStack({authors, onBehalfOf}: CommitAuthorStackProps) {
  const authorSettings = useAuthorSettings()

  return (
    <AvatarStack>
      {authors.slice(0, maxAvatarCount).map((author, index) => (
        <GitHubAvatar
          data-testid="commit-stack-avatar"
          key={`${author.login}_${index}`}
          src={author.avatarUrl}
          alt={author.login ?? author.displayName}
          data-hovercard-url={userHovercardPath({owner: author.login ?? ''})}
          square={isBotOrApp(author)}
          size={authorSettings.avatarSize}
        />
      ))}
      {onBehalfOf && (
        <GitHubAvatar
          data-testid="commit-stack-avatar"
          key={`${onBehalfOf.login}_on_behalf_of`}
          src={onBehalfOf.avatarUrl}
          alt={onBehalfOf.login ?? onBehalfOf.displayName}
          data-hovercard-url={orgHovercardPath({owner: onBehalfOf.login ?? ''})}
          square={true}
          size={authorSettings.avatarSize}
        />
      )}
    </AvatarStack>
  )
}
