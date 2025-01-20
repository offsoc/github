import type {RepositoryNWO} from '@github-ui/current-repository'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {commitsByAuthor} from '@github-ui/paths'
import {ActionList, Link as PrimerLink, Truncate} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useRef, useState} from 'react'

import type {Author} from '../commit-attribution-types'
import {isBotOrApp} from '../utils'

interface AuthorsDialogProps {
  authors: Author[]
  repo: RepositoryNWO
}

export function AuthorsDialog({authors, repo}: AuthorsDialogProps) {
  const authorCount = authors.length
  const [isDialogOpen, setDialogOpen] = useState(false)
  const linkRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <PrimerLink
        as="button"
        aria-label={`Show ${authorCount} authors`}
        data-testid="authors-dialog-anchor"
        onClick={() => {
          setDialogOpen(true)
        }}
        sx={{mx: 1}}
        ref={linkRef}
        muted
      >
        {authorCount} {'people'}
      </PrimerLink>
      {isDialogOpen && (
        <Dialog
          title={`${authorCount} authors`}
          onClose={() => {
            setDialogOpen(false)
            setTimeout(() => linkRef.current?.focus(), 25)
          }}
          width="medium"
          height={authorCount >= 12 ? 'small' : 'auto'}
          renderBody={() => {
            return (
              <ActionList sx={{overflowY: 'auto', py: 2}} data-testid="contributor-dialog-list">
                {authors.map((author, index) => (
                  <AuthorRow key={`${author.login}_${index}`} author={author} repo={repo} />
                ))}
              </ActionList>
            )
          }}
        />
      )}
    </>
  )
}

function AuthorRow({author, repo}: {author: Author; repo: RepositoryNWO}) {
  return (
    <ActionList.LinkItem
      sx={{
        display: 'flex',
        flexDirection: 'row',
        fontSize: 1,
        py: 2,
        color: 'fg.default',
        '&:hover': {backgroundColor: 'canvas.subtle'},
      }}
      data-testid="contributor-dialog-row"
      href={commitsByAuthor({repo, author: author.login ?? ''})}
    >
      <GitHubAvatar
        src={author.avatarUrl}
        alt={author.login ?? author.displayName}
        sx={{mr: 2}}
        aria-hidden="true"
        square={isBotOrApp(author)}
      />
      <Truncate inline title={author.login ?? author.displayName ?? ''}>
        {author.login ?? author.displayName}
      </Truncate>
    </ActionList.LinkItem>
  )
}
