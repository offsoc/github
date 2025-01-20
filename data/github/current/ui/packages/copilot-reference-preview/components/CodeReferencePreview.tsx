import type {
  FileReference,
  LineRange,
  ReferenceDetails,
  ReferenceHeaderInfo,
  SnippetReference,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {blamePath, commitPath, repoOverviewUrl} from '@github-ui/paths'
import {unqualifyRef} from '@github-ui/ref-utils'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useContributors} from '@github-ui/use-contributors'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {DownloadIcon, HistoryIcon, LinkExternalIcon, PeopleIcon, RepoIcon} from '@primer/octicons-react'
import {Box, IconButton, LinkButton, RelativeTime, Text, Truncate} from '@primer/react'
import {useCallback, useEffect, useRef, useState, type PropsWithChildren} from 'react'

import {ReferencePreview} from './ReferencePreview'
import {SimpleCodeListing} from './SimpleCodeListing'

export function CodeReferencePreview<T extends SnippetReference | FileReference>({
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
  const {contributors} = useContributors(reference.repoOwner, reference.repoName, reference.commitOID, reference.path)
  const [latestCommit] = useLatestCommit(reference.repoOwner, reference.repoName, reference.commitOID, reference.path)
  const {lines, lineNumbers, expandUp, expandDown} = useExpandableRange(
    details?.range,
    details?.expandedRange,
    details?.highlightedContents,
  )
  const headerInfo = details?.headerInfo

  return (
    <ReferencePreview.Frame>
      <ReferencePreview.Header onDismiss={onDismiss}>
        <GitHubAvatar square={details?.repoIsOrgOwned} src={`${reference.repoOwner}.png`} sx={{mr: 2, flexShrink: 0}} />
        <Text sx={{fontWeight: 600, whiteSpace: 'nowrap'}}>
          {reference.repoOwner}/{reference.repoName}
        </Text>
        <Text sx={{marginX: 1}}>·</Text>
        <Text sx={{fontWeight: 400}}>{unqualifyRef(reference.ref)}</Text>
        <Text sx={{marginX: 1}}>·</Text>
        <Text
          sx={{fontWeight: 400, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', direction: 'rtl'}}
        >
          {reference.path}
        </Text>
        {reference.type === 'snippet' && (
          <span>
            :{reference.range.start}-{reference.range.end}
          </span>
        )}
      </ReferencePreview.Header>
      <ReferencePreview.Body detailsError={detailsError} detailsLoading={detailsLoading}>
        <Box
          sx={{
            border: '1px solid var(--borderColor-default, var(--color-border-default))',
            borderRadius: '6px 6px 0 0',
            marginX: 3,
          }}
        >
          <BlobPreviewHeader>
            {headerInfo && <BlobSize headerInfo={headerInfo} />}
            {headerInfo && <RawButtons headerInfo={headerInfo} />}
          </BlobPreviewHeader>
          {expandUp && <ReferencePreview.ContentExpander direction="above" onExpand={expandUp} />}
          <ReferencePreview.Content>
            <SimpleCodeListing lines={lines} lineNumbers={lineNumbers} />
          </ReferencePreview.Content>
          {expandDown && <ReferencePreview.ContentExpander direction="below" onExpand={expandDown} />}
        </Box>
        <ReferencePreview.Details>
          <ReferencePreview.DetailLink
            href={repoOverviewUrl({name: reference.repoName, ownerLogin: reference.repoOwner})}
            icon={RepoIcon}
          >
            {reference.repoOwner}/{reference.repoName}
          </ReferencePreview.DetailLink>

          {contributors && (
            <ReferencePreview.DetailLink
              icon={PeopleIcon}
              href={blamePath({
                owner: reference.repoOwner,
                repo: reference.repoName,
                commitish: reference.commitOID,
                filePath: reference.path,
                lineNumber: details?.range.start,
              })}
            >
              {contributors.totalCount} {contributors.totalCount === 1 ? 'contributor' : 'contributors'}
            </ReferencePreview.DetailLink>
          )}

          {latestCommit && (
            <ReferencePreview.DetailLink
              icon={HistoryIcon}
              href={commitPath({owner: reference.repoOwner, repo: reference.repoName, commitish: latestCommit?.oid})}
            >
              {latestCommit?.author?.displayName} updated <RelativeTime datetime={latestCommit?.date} />
            </ReferencePreview.DetailLink>
          )}

          <ReferencePreview.DetailLink icon={LinkExternalIcon} href={reference.url}>
            {reference.repoOwner}/{reference.repoName}/{reference.path}
            {reference.type === 'snippet' ? (
              <>
                #{reference.range.start}-{reference.range.end}
              </>
            ) : null}
          </ReferencePreview.DetailLink>
        </ReferencePreview.Details>
      </ReferencePreview.Body>
    </ReferencePreview.Frame>
  )
}

export function BlobPreviewHeader({children}: PropsWithChildren<object>) {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'canvas.subtle',
        borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: '6px 6px 0px 0px',
      }}
    >
      {children}
    </Box>
  )
}

export function BlobSize({headerInfo}: {headerInfo: ReferenceHeaderInfo}) {
  return (
    <Truncate title={headerInfo.blobSize} inline sx={{maxWidth: '100%', color: 'fg.subtle'}} data-testid="blob-size">
      <span>{`${headerInfo.lineInfo.truncatedLoc} lines (${headerInfo.lineInfo.truncatedSloc} loc) · ${headerInfo.blobSize}`}</span>
    </Truncate>
  )
}

export function RawButtons({headerInfo}: {headerInfo: ReferenceHeaderInfo}) {
  const lfsDownloadUrl = new URL(headerInfo.rawBlobUrl, ssrSafeLocation.origin)
  lfsDownloadUrl.searchParams.set('download', '')
  const downloadButtonProps = {
    ['aria-label']: 'Download raw content',
    icon: DownloadIcon,
    size: 'small',
    onClick: async () => {
      if (!headerInfo.isLfs) {
        await downloadFile(headerInfo.rawBlobUrl, headerInfo.displayName)
      }
    },
    ['data-testid']: 'download-raw-button',
    sx: {borderTopLeftRadius: 0, borderBottomLeftRadius: 0},
  } as const

  return (
    <Box sx={{display: 'flex'}}>
      <LinkButton
        href={headerInfo.rawBlobUrl}
        download={!headerInfo.viewable ? 'true' : undefined}
        size="small"
        sx={{linkButtonSx, px: 2, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none'}}
        data-testid="raw-button"
      >
        Raw
      </LinkButton>
      {headerInfo.isLfs ? (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          unsafeDisableTooltip={true}
          as="a"
          data-turbo="false"
          href={lfsDownloadUrl.toString()}
          {...downloadButtonProps}
        />
      ) : (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton unsafeDisableTooltip={true} {...downloadButtonProps} />
      )}
    </Box>
  )
}

function useExpandableRange<T>(
  range: LineRange | undefined,
  expandedRange: LineRange | undefined,
  allLines: T[] | undefined,
) {
  const startLineRef = useRef(range?.start ?? -1)
  const endLineRef = useRef(range?.end ?? -1)

  const [lines, setLines] = useState<T[]>(
    allLines && range && expandedRange
      ? allLines.slice(range.start - expandedRange.start, range.end - expandedRange.start + 1)
      : [],
  )

  const updateLines = useCallback(() => {
    if (!allLines || !range || !expandedRange || startLineRef.current < 0 || endLineRef.current < 0) return

    setLines(allLines.slice(startLineRef.current - expandedRange.start, endLineRef.current - expandedRange.start + 1))
  }, [allLines, range, expandedRange])

  useEffect(() => {
    if (range && allLines && (startLineRef.current === -1 || endLineRef.current === -1)) {
      startLineRef.current = range.start
      endLineRef.current = range.end
      updateLines()
    }
  }, [allLines, range, expandedRange, updateLines])

  const expandUp = useCallback(() => {
    startLineRef.current = Math.max(startLineRef.current - pageSize, expandedRange?.start ?? -1)
    updateLines()
  }, [expandedRange?.start, updateLines])

  const expandDown = useCallback(() => {
    endLineRef.current = Math.min(endLineRef.current + pageSize, expandedRange?.end ?? -1)
    updateLines()
  }, [expandedRange?.end, updateLines])

  const canExpandUp = startLineRef.current !== -1 && startLineRef.current !== expandedRange?.start
  const canExpandDown = endLineRef.current !== -1 && endLineRef.current !== expandedRange?.end

  return {
    lines,
    lineNumbers: lines.map((_, i) => startLineRef.current + i),
    expandUp: canExpandUp ? expandUp : null,
    expandDown: canExpandDown ? expandDown : null,
  }
}

const pageSize = 25
const linkButtonSx = {
  '&:hover:not([disabled])': {
    textDecoration: 'none',
  },
  '&:focus:not([disabled])': {
    textDecoration: 'none',
  },
  '&:active:not([disabled])': {
    textDecoration: 'none',
  },
}

async function downloadFile(rawHref: string, name: string) {
  const result = await fetch(rawHref, {method: 'get'})
  const blob = await result.blob()
  const aElement = document.createElement('a')
  aElement.setAttribute('download', name)
  const href = URL.createObjectURL(blob)
  aElement.href = href
  aElement.setAttribute('target', '_blank')
  aElement.click()
  URL.revokeObjectURL(href)
}
