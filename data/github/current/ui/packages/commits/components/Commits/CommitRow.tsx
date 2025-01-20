import {announce} from '@github-ui/aria-live'
import {CheckStatusDialog, useCommitChecksStatusDetails} from '@github-ui/commit-checks-status'
import type {RepositoryNWO} from '@github-ui/current-repository'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {SafeHTMLText} from '@github-ui/safe-html'
import {useAnalytics} from '@github-ui/use-analytics'
import {lazy, Suspense, useEffect, useRef, useState} from 'react'

import {useIsLoggingInformationProvided, useLoggingInfo} from '../../contexts/CommitsLoggingContext'
import {useFindDeferredCommitData} from '../../contexts/DeferredCommitDataContext'
import type {Commit} from '../../types/shared'
import {CommitAttribution} from '../CommitAttribution'
import {
  BrowseRepositoryAtThisPoint,
  CommitCommentCount,
  ToggleCommitDescription,
  ViewCodeAtThisPoint,
  ViewCommitDetails,
} from '../CommitRowActions'
import {CommitChecksStatusBadge, SignedCommitBadge, verifiedBadgeWidth} from '../CommitRowBadges'
import {CopySHA} from '../CopySHA'

export interface CommitRowProps {
  commit: Commit
  repo: RepositoryNWO
  path: string
  softNavToCommit?: boolean
}

// eslint-disable-next-line github/no-then
const CommitActionBar = lazy(() => import('./CommitActionBar').then(m => ({default: m.CommitActionBar})))

export function CommitRow({commit, repo, path, softNavToCommit}: CommitRowProps) {
  const [showDescription, setShowDescription] = useState(false)
  const commitDescriptionRef = useRef<HTMLSpanElement>(null)
  const [details, fetchDetails] = useCommitChecksStatusDetails(commit.oid, repo)
  const [isOpen, setIsOpen] = useState(false)
  const deferredData = useFindDeferredCommitData(commit.oid)

  const {sendAnalyticsEvent} = useAnalytics()
  const {loggingPrefix, loggingPayload} = useLoggingInfo()
  const shouldLog = useIsLoggingInformationProvided()
  const loggingFunction = () => {
    if (shouldLog) {
      sendAnalyticsEvent(`${loggingPrefix}click`, 'COMMITS_TITLE_CLICKED', loggingPayload)
    }
  }

  useEffect(() => {
    if (showDescription && commitDescriptionRef.current && commitDescriptionRef.current.textContent) {
      announce(commitDescriptionRef.current.textContent)
    }
  }, [commitDescriptionRef, showDescription])

  return (
    <>
      <ListItem
        data-testid="commit-row-item"
        sx={{
          ':first-child': {
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          },
          ':last-child': {
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
          },
        }}
        title={
          <ListItemTitle
            value={commit.shortMessage}
            markdownValue={commit.shortMessageMarkdownLink}
            href={commit.url}
            containerSx={{display: 'inline'}}
            headingSx={{display: 'inline'}}
            onClick={loggingFunction}
          >
            {commit.bodyMessageHtml && (
              <ToggleCommitDescription
                showDescription={showDescription}
                setShowDescription={setShowDescription}
                oid={commit.oid}
              />
            )}
          </ListItemTitle>
        }
        metadata={
          <>
            <ListItemMetadata>
              <CommitCommentCount oid={commit.oid} repo={repo} count={deferredData?.commentCount ?? 0} />
            </ListItemMetadata>

            <ListItemMetadata sx={{minWidth: verifiedBadgeWidth}}>
              <SignedCommitBadge deferredData={deferredData} />
            </ListItemMetadata>

            <ListItemMetadata className="d-none d-sm-flex px-0 gap-2" variant="primary">
              <div className="d-flex">
                <ViewCommitDetails oid={commit.oid} commitUrl={commit.url} softNavToCommit={softNavToCommit} />
                <CopySHA sha={commit.oid} />
              </div>
              <ViewCodeAtThisPoint repo={repo} oid={commit.oid} path={path} />
              <BrowseRepositoryAtThisPoint repo={repo} oid={commit.oid} />
            </ListItemMetadata>
          </>
        }
        secondaryActions={
          <Suspense>
            <CommitActionBar
              commit={commit}
              repo={repo}
              path={path}
              setDialogOpen={setIsOpen}
              fetchCheckDetails={fetchDetails}
              deferredData={deferredData}
            />
          </Suspense>
        }
      >
        <div className="px-1" />
        <ListItemMainContent>
          {showDescription && commit.bodyMessageHtml && (
            <ListItemDescription>
              <SafeHTMLText
                ref={commitDescriptionRef}
                html={commit.bodyMessageHtml}
                className="ws-pre-wrap extended-commit-description-container pb-2 text-mono wb-break-word"
              />
            </ListItemDescription>
          )}

          <ListItemDescription>
            <CommitAttribution commit={commit} repo={repo}>
              <CommitChecksStatusBadge repository={repo} deferredData={deferredData} oid={commit.oid} />
            </CommitAttribution>
          </ListItemDescription>
        </ListItemMainContent>
      </ListItem>
      {deferredData?.statusCheckStatus && isOpen && (
        <CheckStatusDialog
          combinedStatus={details}
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}
