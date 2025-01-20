import {Box} from '@primer/react'
import {Fragment, type PropsWithChildren} from 'react'

import type {Author} from './commit-attribution-types'
import {AuthorsDialog} from './components/AuthorsDialog'
import {CommitAuthorStack} from './components/CommitAuthorStack'
import {AuthorLink} from './components/AuthorLink'
import {OrgLink} from './components/OrgLink'
import type {RepositoryNWO} from '@github-ui/current-repository'
import {AuthorAvatar} from './components/AuthorAvatar'
import {AuthorSettingsProvider, type AuthorSettings} from './contexts/AuthorSettingsContext'

export interface CommitAttributionProps {
  authors: Author[]
  committer?: Author
  committerAttribution?: boolean
  onBehalfOf?: Author
  includeVerbs: boolean
  repo: RepositoryNWO
  authorSettings?: Partial<AuthorSettings>
}

function SingleAuthor({author, repo}: {author: Author; repo: RepositoryNWO}) {
  return <AuthorAvatar author={author} repo={repo} />
}

function AuthorByline({
  author,
  committer,
  committerAttribution,
  onBehalfOf,
  repo,
}: {
  author: Author
  committer?: Author
  committerAttribution?: boolean
  onBehalfOf?: Author
  repo: RepositoryNWO
}) {
  const authors = [author]
  if (committer && committerAttribution) {
    authors.push(committer)
  }

  return (
    <>
      <CommitAuthorStack authors={authors} onBehalfOf={onBehalfOf} />
      <AuthorLink author={author} repo={repo} sx={{pl: 1}} />
    </>
  )
}

function TwoAuthors({authors, onBehalfOf, repo}: {authors: Author[]; onBehalfOf?: Author; repo: RepositoryNWO}) {
  return (
    <>
      <CommitAuthorStack authors={authors} onBehalfOf={onBehalfOf} />
      {authors.map((author, index) => (
        <Fragment key={`${author.login}_${index}`}>
          <AuthorLink author={author} repo={repo} sx={{pl: 1}} />
          {index !== authors.length - 1 && <span className="pl-1">and</span>}
        </Fragment>
      ))}
    </>
  )
}

function MultipleAuthors({authors, onBehalfOf, repo}: {authors: Author[]; onBehalfOf?: Author; repo: RepositoryNWO}) {
  return (
    <>
      <CommitAuthorStack authors={authors} onBehalfOf={onBehalfOf} />
      <AuthorsDialog authors={authors} repo={repo} />
    </>
  )
}

export function CommitAttribution({
  authors,
  committer,
  committerAttribution,
  onBehalfOf,
  repo,
  children,
  includeVerbs = true,
  authorSettings,
}: PropsWithChildren<CommitAttributionProps>) {
  const singleAuthor = authors.length === 1 && !committerAttribution && !onBehalfOf
  const authorAndCommitter = authors.length === 1 && (committerAttribution || onBehalfOf)
  const inlineAuthorNames = authors.length === 2 && !committerAttribution
  const multipleAuthors = !singleAuthor && !authorAndCommitter && !inlineAuthorNames
  const firstAuthor = authors[0]

  const verbClass = includeVerbs ? 'pl-1' : ''

  return (
    <Box
      sx={{display: 'flex', flexDirection: 'row', flexWrap: ['wrap', 'wrap', 'wrap', 'nowrap'], alignItems: 'center'}}
    >
      <AuthorSettingsProvider authorSettings={authorSettings}>
        {singleAuthor && firstAuthor && <SingleAuthor author={firstAuthor} repo={repo} />}
        {authorAndCommitter && firstAuthor && (
          <AuthorByline
            author={firstAuthor}
            committer={committer}
            committerAttribution={committerAttribution}
            onBehalfOf={onBehalfOf}
            repo={repo}
          />
        )}
        {inlineAuthorNames && <TwoAuthors authors={authors} onBehalfOf={onBehalfOf} repo={repo} />}
        {multipleAuthors && <MultipleAuthors authors={authors} onBehalfOf={onBehalfOf} repo={repo} />}

        {!committerAttribution ? (
          <span className={verbClass}>{includeVerbs && 'committed'}</span>
        ) : (
          <>
            <span className="pl-1">{includeVerbs ? 'authored and' : 'and'}</span>
            <AuthorLink author={committer} repo={repo} sx={{pl: 1}} />
            <span className={verbClass}>{includeVerbs && 'committed'}</span>
          </>
        )}
        {onBehalfOf && (
          <>
            <span className="pl-1">on behalf of</span>
            <OrgLink org={onBehalfOf} className="pl-1" />
          </>
        )}

        {children}
      </AuthorSettingsProvider>
    </Box>
  )
}
