import {SkeletonText} from './Skeleton'
import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import {useReposAnalytics} from '../hooks/use-repos-analytics'
import {AuthorAvatar, CommitAttribution} from '@github-ui/commit-attribution'
import {useCurrentRepository, type Repository} from '@github-ui/current-repository'
import {commitHovercardPath, commitsPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import type {CommitWithStatus} from '@github-ui/repos-types'
import {SafeHTMLText} from '@github-ui/safe-html'
import {ScreenReaderHeading} from '@github-ui/screen-reader-heading'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {AlertFillIcon, EllipsisIcon, HistoryIcon} from '@primer/octicons-react'
import {
  Box,
  type ButtonProps,
  IconButton,
  Link as PrimerLink,
  LinkButton,
  Octicon,
  RelativeTime,
  Tooltip,
} from '@primer/react'
import {type PropsWithChildren, useState} from 'react'

import {ReposChecksStatusBadge} from './ReposChecksStatusBadge'
import {clsx} from 'clsx'
import LinkButtonCSS from '../css/LinkButton.module.css'

export function LatestCommitSingleLine({commitCount}: {commitCount?: string}) {
  return (
    <div className="d-flex flex-column border rounded-2 mb-3 pl-1">
      <LatestCommitContent commitCount={commitCount} />
    </div>
  )
}

export function LatestCommitContent({commitCount}: {commitCount?: string}) {
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const [latestCommit, loading, error] = useLatestCommit(repo.ownerLogin, repo.name, refInfo.name, path)
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: ['wrap', 'nowrap'],
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          // Min width is set to 273px to prevent the blob content from being too narrow.
          // Supports a min screen size of 320px without introducing any horizontal scrollbars.
          minWidth: '273px',
          p: 2,
        }}
      >
        <ScreenReaderHeading as="h2" text="Latest commit" />
        {error ? (
          <CommitErrorMessage />
        ) : loading ? (
          <SkeletonText width={120} data-testid="loading" />
        ) : latestCommit ? (
          <CommitSummary commit={latestCommit} detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} repo={repo} />
        ) : null}
        <div className="d-flex flex-shrink-0 gap-2">
          <LastCommitTimestamp commit={latestCommit} repo={repo} />
          <HistoryLink
            commit={latestCommit}
            commitCount={commitCount}
            detailsOpen={detailsOpen}
            setDetailsOpen={setDetailsOpen}
          />
        </div>
      </Box>
      {detailsOpen && latestCommit && (
        <div className={latestCommit.bodyMessageHtml ? 'd-flex' : 'd-flex d-sm-none'}>
          <CommitDetails commit={latestCommit} repo={repo} />
        </div>
      )}
    </>
  )
}

function CommitErrorMessage() {
  return (
    <span className="fgColor-attention" data-testid="latest-commit-error-message">
      <Octicon icon={AlertFillIcon} />
      &nbsp;Cannot retrieve latest commit at this time.
    </span>
  )
}

function CommitSummary({
  commit,
  detailsOpen,
  setDetailsOpen,
  repo,
}: {
  commit: CommitWithStatus
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
  repo: Repository
}) {
  const dataUrl = `data-hovercard-url=${commitHovercardPath({
    owner: repo.ownerLogin,
    repo: repo.name,
    commitish: commit.oid,
  })} `
  const shortMessageHtmlLink = getProperHovercardsOnCommitMessage(commit.shortMessageHtmlLink, dataUrl)

  return (
    <Box
      sx={{
        display: 'flex',
        minWidth: 0,
        fontSize: 1,
        alignItems: 'center',
        width: 'max-content',
        gap: 2,
        flexGrow: 1,
      }}
      data-testid="latest-commit"
    >
      {commit.authors && commit.authors.length > 0 ? (
        <CommitAttribution
          authors={commit.authors}
          repo={repo}
          includeVerbs={false}
          committer={commit.committer}
          committerAttribution={commit.committerAttribution}
        />
      ) : (
        <AuthorAvatar author={commit.author} repo={repo} />
      )}
      <Box className="d-none d-sm-flex" sx={{alignItems: 'center', minWidth: 0, gap: 2}}>
        <div className="Truncate flex-items-center f5">
          {commit.shortMessageHtmlLink && (
            <SafeHTMLText
              className="Truncate-text"
              data-testid="latest-commit-html"
              unverifiedHTML={shortMessageHtmlLink}
            />
          )}
        </div>
        {commit.bodyMessageHtml && <CommitDetailsButton detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} />}
        <ReposChecksStatusBadge oid={commit.oid} status={commit.status} />
      </Box>
      {!Number.isNaN(Date.parse(commit.date)) ? (
        <span className="d-flex d-sm-none fgColor-muted f6">
          <RelativeTime datetime={commit.date} tense="past" />
        </span>
      ) : null}
    </Box>
  )
}

function LastCommitTimestamp({commit, repo}: {commit?: CommitWithStatus | null; repo: Repository}) {
  const abbreviatedOid = commit?.oid.slice(0, 7)

  return (
    <div data-testid="latest-commit-details" className="d-none d-sm-flex flex-items-center">
      {commit && (
        <span className="d-flex flex-nowrap fgColor-muted f6">
          <PrimerLink
            as={Link}
            to={commit.url}
            className="Link--secondary"
            aria-label={`Commit ${abbreviatedOid}`}
            data-hovercard-url={commitHovercardPath({
              owner: repo.ownerLogin,
              repo: repo.name,
              commitish: commit.oid,
            })}
          >
            {abbreviatedOid}
          </PrimerLink>
          &nbsp;·&nbsp;
          {!Number.isNaN(Date.parse(commit.date)) ? <RelativeTime datetime={commit.date} tense="past" /> : null}
        </span>
      )}
    </div>
  )
}

function HistoryLink({
  commit,
  commitCount,
  detailsOpen,
  setDetailsOpen,
}: {
  commit?: CommitWithStatus | null
  commitCount?: string
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
}) {
  return (
    <div className="d-flex gap-2">
      <ScreenReaderHeading as="h2" text="History" />
      <HistoryLinkButton className="d-none d-lg-flex" leadingVisual={HistoryIcon}>
        <span className="fgColor-default">{commitCountLabel(commitCount)}</span>
      </HistoryLinkButton>
      <div className="d-sm-none">
        {(commit?.shortMessageHtmlLink || commit?.bodyMessageHtml) && (
          <CommitDetailsButton detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} />
        )}
      </div>
      <div className="d-flex d-lg-none">
        <Tooltip text={commitCountLabel(commitCount)} id="history-icon-button-tooltip">
          <HistoryLinkButton leadingVisual={HistoryIcon} aria-describedby="history-icon-button-tooltip" />
        </Tooltip>
      </div>
    </div>
  )
}

function commitCountLabel(commitCount?: string) {
  if (!commitCount) {
    return 'History'
  }

  return commitCount === '1' ? '1 Commit' : `${commitCount} Commits`
}

function HistoryLinkButton({
  children,
  className,
  leadingVisual,
  ...props
}: PropsWithChildren<Pick<ButtonProps, 'className' | 'leadingVisual' | 'aria-describedby'>>) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()

  return (
    <LinkButton
      aria-describedby={props['aria-describedby']}
      className={clsx(className, LinkButtonCSS['code-view-link-button'], 'flex-items-center fgColor-default')}
      onClick={() => sendRepoClickEvent('HISTORY_BUTTON')}
      href={commitsPath({
        owner: repo.ownerLogin,
        repo: repo.name,
        ref: refInfo.name,
        path,
      })}
      variant="invisible"
      size="small"
      leadingVisual={leadingVisual}
    >
      {children}
    </LinkButton>
  )
}

function CommitDetailsButton({
  detailsOpen,
  setDetailsOpen,
}: {
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
}) {
  return (
    // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
    <IconButton
      unsafeDisableTooltip={true}
      aria-label="Open commit details"
      icon={EllipsisIcon}
      sx={{color: 'fg.muted', minWidth: '28px'}}
      onClick={() => setDetailsOpen(!detailsOpen)}
      variant="invisible"
      aria-pressed={detailsOpen}
      aria-expanded={detailsOpen}
      data-testid="latest-commit-details-toggle"
      size="small"
    />
  )
}

function CommitDetails({commit, repo}: {commit: CommitWithStatus; repo: Repository}) {
  const abbreviatedOid = commit?.oid.slice(0, 7)
  return (
    <div className="bgColor-muted border-top rounded-bottom-2 px-3 py-2 flex-1">
      <div className="d-flex d-sm-none flex-column">
        <Box sx={{display: 'flex', flexDirection: 'row', minWidth: 0, gap: 2, alignItems: 'start'}}>
          {commit.shortMessageHtmlLink && (
            <SafeHTMLText
              className="Truncate-text"
              data-testid="latest-commit-html"
              html={commit.shortMessageHtmlLink}
              // This link is auto formatted to be fg.muted. Which is great normally but not for this spot
              sx={{'> a': {color: 'var(--fgColor-default, var(--color-fg-default)) !important'}}}
            />
          )}
          <ReposChecksStatusBadge oid={commit.oid} status={commit.status} />
        </Box>
        <PrimerLink
          as={Link}
          to={commit.url}
          className="Link--secondary"
          aria-label={`Commit ${abbreviatedOid}`}
          data-hovercard-url={commitHovercardPath({
            owner: repo.ownerLogin,
            repo: repo.name,
            commitish: commit.oid,
          })}
        >
          {abbreviatedOid}
        </PrimerLink>
        {commit.bodyMessageHtml && <br />}
      </div>
      {commit.bodyMessageHtml && (
        <div className="mt-2 mt-sm-0 fgColor-muted">
          <SafeHTMLText
            className="Truncate-text"
            data-testid="latest-commit-html"
            html={commit.bodyMessageHtml}
            sx={{whiteSpace: 'pre-wrap'}}
          />
        </div>
      )}
    </div>
  )
}

function getProperHovercardsOnCommitMessage(shortMessageHtmlLink: string | undefined, dataUrl: string) {
  // eslint-disable-next-line github/unescaped-html-literal
  const separator = '<a '
  let shortMessage = ''
  if (shortMessageHtmlLink) {
    const split = shortMessageHtmlLink.split(separator)
    for (const part of split) {
      if (part === '') {
        continue
      }
      if (part.includes('data-hovercard-url')) {
        shortMessage = shortMessage.concat(separator, part)
        continue
      }
      shortMessage = shortMessage.concat(...[separator, dataUrl, part])
    }
  }

  return shortMessage
}
