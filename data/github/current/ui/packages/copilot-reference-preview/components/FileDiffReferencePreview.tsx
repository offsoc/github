import type {
  FileDiffReference,
  FileReference,
  ReferenceDetails,
  SnippetReference,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {blamePath, commitPath, repoOverviewUrl} from '@github-ui/paths'
import {useContributors} from '@github-ui/use-contributors'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {HistoryIcon, LinkExternalIcon, PeopleIcon, RepoIcon} from '@primer/octicons-react'
import {Box, RelativeTime} from '@primer/react'

import {ReferencePreview} from './ReferencePreview'

const getRangeString = (selectedRange: FileDiffReference['selectedRange']) => {
  if (!selectedRange?.start) {
    return ''
  }

  return selectedRange.end ? `${selectedRange.start}-${selectedRange.end}` : `${selectedRange.start}`
}

const splitReferenceURL = (reference: FileDiffReference) => {
  const range = getRangeString(reference.selectedRange)
  const path = reference.url.split(window.location.host)[1]
  return {href: reference.url + range, path: path + range, range}
}

export function FileDiffReferencePreview<T extends FileDiffReference>({
  reference,
  details,
  detailsLoading,
  detailsError,
  onDismiss,
}: {
  reference: T
  details: ReferenceDetails<T> | undefined
  detailsLoading: boolean
  detailsError: boolean
  onDismiss?: () => void
}) {
  const contentReference =
    ((reference.headFile ?? reference.baseFile) as FileReference) ??
    ((reference.head ?? reference.base) as SnippetReference)

  const {contributors} = useContributors(
    contentReference.repoOwner,
    contentReference.repoName,
    contentReference.commitOID,
    contentReference.path,
  )

  const [latestCommit] = useLatestCommit(
    contentReference.repoOwner,
    contentReference.repoName,
    contentReference.commitOID,
    contentReference.path,
  )
  const {href, path, range} = splitReferenceURL(reference)

  return (
    <ReferencePreview.Frame>
      <ReferencePreview.Header onDismiss={onDismiss}>
        <GitHubAvatar
          square={details?.repoIsOrgOwned}
          src={`${contentReference.repoOwner}.png`}
          sx={{mr: 2, flexShrink: 0}}
        />
        <Box sx={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
          {contentReference.repoOwner}/{contentReference.repoName}/{contentReference.path} {range}
        </Box>
      </ReferencePreview.Header>
      <ReferencePreview.Body detailsError={detailsError} detailsLoading={detailsLoading}>
        <ReferencePreview.Details>
          <ReferencePreview.DetailLink
            href={repoOverviewUrl({name: contentReference.repoName, ownerLogin: contentReference.repoOwner})}
            icon={RepoIcon}
          >
            {contentReference.repoOwner}/{contentReference.repoName}
          </ReferencePreview.DetailLink>

          {contributors && (
            <ReferencePreview.DetailLink
              icon={PeopleIcon}
              href={blamePath({
                owner: contentReference.repoOwner,
                repo: contentReference.repoName,
                commitish: contentReference.commitOID,
                filePath: contentReference.path,
              })}
            >
              {contributors.totalCount} {contributors.totalCount === 1 ? 'contributor' : 'contributors'}
            </ReferencePreview.DetailLink>
          )}

          {latestCommit && (
            <ReferencePreview.DetailLink
              icon={HistoryIcon}
              href={commitPath({
                owner: contentReference.repoOwner,
                repo: contentReference.repoName,
                commitish: latestCommit?.oid,
              })}
            >
              {latestCommit?.author?.displayName} updated <RelativeTime datetime={latestCommit?.date} />
            </ReferencePreview.DetailLink>
          )}

          <ReferencePreview.DetailLink icon={LinkExternalIcon} href={href}>
            {path}
          </ReferencePreview.DetailLink>
        </ReferencePreview.Details>
      </ReferencePreview.Body>
    </ReferencePreview.Frame>
  )
}
