import {transformContentToHTML} from '@github-ui/copilot-chat/utils/markdown'
import type {
  FileReference,
  FileReferenceDetails,
  SnippetReference,
  SnippetReferenceDetails,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {blamePath, commitPath, repoOverviewUrl} from '@github-ui/paths'
import {unqualifyRef} from '@github-ui/ref-utils'
import {useContributors} from '@github-ui/use-contributors'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {HistoryIcon, LinkExternalIcon, PeopleIcon, RepoIcon} from '@primer/octicons-react'
import {Box, RelativeTime, SegmentedControl, Text} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'

import {ReferencePreview} from './ReferencePreview'
import {BlobPreviewHeader, BlobSize, RawButtons} from './CodeReferencePreview'

export interface MarkdownReferencePreviewProps {
  reference: FileReference | SnippetReference
  details: FileReferenceDetails | SnippetReferenceDetails | undefined
  detailsLoading: boolean
  detailsError: boolean
  onDismiss?: () => void
}

export function MarkdownReferencePreview({
  reference,
  details,
  detailsLoading,
  detailsError,
  onDismiss,
}: MarkdownReferencePreviewProps) {
  const {contributors} = useContributors(reference.repoOwner, reference.repoName, reference.commitOID, reference.path)
  const [latestCommit] = useLatestCommit(reference.repoOwner, reference.repoName, reference.commitOID, reference.path)

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
      </ReferencePreview.Header>
      <ReferencePreview.Body detailsLoading={detailsLoading} detailsError={detailsError}>
        {details && <MarkdownReferencePreviewContent details={details} />}

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
              {contributors.totalCount} contributors
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
            {details ? (
              <>
                #{details.range.start}-{details.range.end}
              </>
            ) : null}
          </ReferencePreview.DetailLink>
        </ReferencePreview.Details>
      </ReferencePreview.Body>
    </ReferencePreview.Frame>
  )
}

export function MarkdownReferencePreviewContent({details}: {details: FileReferenceDetails | SnippetReferenceDetails}) {
  const [startLine, setStartLine] = useState(details.range.start)
  const [endLine, setEndLine] = useState(details.range.end)
  const lineCount = useMemo(() => indexToLine(details.contents, details.contents.length), [details.contents])
  const [displayMode, setDisplayMode] = useState<'preview' | 'code'>('preview')
  const handleSegmentChange = (selectedTabIndex: number) => {
    const newMode = (['preview', 'code'] as const)[selectedTabIndex]
    if (newMode && displayMode !== newMode) {
      setDisplayMode(newMode)
    }
  }
  const headerInfo = details?.headerInfo

  const expandUp = useCallback(() => {
    const prevHeadingLine = findPrecedingHeading(details.contents, startLine)
    setStartLine(prevHeadingLine)
  }, [details.contents, startLine])

  const expandDown = useCallback(() => {
    let nextHeadingLine = endLine
    // add headings to the current display until we're increasing the line count by at least 10
    while (nextHeadingLine < lineCount && nextHeadingLine < endLine + 10) {
      nextHeadingLine = findFollowingHeading(details.contents, nextHeadingLine + 1)
    }
    setEndLine(nextHeadingLine - 1)
  }, [details.contents, endLine, lineCount])

  return (
    <Box
      sx={{
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: '6px 6px 0 0',
        marginX: 3,
      }}
    >
      <BlobPreviewHeader>
        <Box sx={{display: 'flex', alignItems: 'baseline', gap: 2}}>
          <SegmentedControl aria-label="File view" size="small" onChange={handleSegmentChange} sx={{fontSize: 1}}>
            <SegmentedControl.Button selected={displayMode === 'preview'} key="preview'">
              Preview
            </SegmentedControl.Button>
            <SegmentedControl.Button selected={displayMode === 'code'} key="raw">
              Code
            </SegmentedControl.Button>
          </SegmentedControl>
          {headerInfo && <BlobSize headerInfo={headerInfo} />}
        </Box>
        {headerInfo && <RawButtons headerInfo={headerInfo} />}
      </BlobPreviewHeader>
      {startLine > 1 && <ReferencePreview.ContentExpander direction="above" onExpand={expandUp} />}
      <ReferencePreview.Content>
        {displayMode === 'preview' ? (
          <Box
            className="js-snippet-clipboard-copy-unpositioned"
            sx={{'.highlighted': {backgroundColor: theme => `${theme.colors.accent.subtle}`}}}
          >
            {/* isAssitive is false - in assitive mode, clicking a reference redirects you to the reference URL instead of opening the reference dialog */}
            <MarkdownViewer
              verifiedHTML={transformContentToHTML(
                details.contents,
                null,
                [],
                false,
                undefined,
                undefined,
                startLine,
                endLine,
              )}
            />
          </Box>
        ) : (
          <code>
            <Box as="pre" sx={{overflowX: 'auto'}}>
              {details.contents}
            </Box>
          </code>
        )}
      </ReferencePreview.Content>
      {endLine < lineCount && <ReferencePreview.ContentExpander direction="below" onExpand={expandDown} />}
    </Box>
  )
}

/** find the line number (starting from 1) the given character index occurs on */
function indexToLine(str: string, index: number) {
  return count(str.slice(0, index).matchAll(/\n/g)) + 1
}

/** find the line of the last heading before the given line */
function findPrecedingHeading(str: string, line: number) {
  const index = lineToIndex(str, line)
  const lastHeading = getLast(str.slice(0, index).matchAll(/^#+\s/gm))
  const lastHeadingIndex = lastHeading?.index ?? 0
  return indexToLine(str, lastHeadingIndex)
}

/** find the line of the first heading after the given line */
function findFollowingHeading(str: string, line: number) {
  const index = lineToIndex(str, line)
  const nextHeading = str.slice(index).match(/^#+\s/m)
  const nextHeadingIndex = nextHeading ? index + nextHeading.index! : str.length
  return indexToLine(str, nextHeadingIndex)
}

function lineToIndex(str: string, line: number) {
  if (line === 1) {
    return 0
  }
  let index = -1
  for (let i = 2; i <= line; i++) {
    index = str.indexOf('\n', index + 1)
    if (index === -1) {
      return str.length
    }
  }
  return index + 1
}

/** get the last item in an iterable */
function getLast<T>(iterator: Iterable<T>): T | undefined {
  let last: T | undefined
  for (const v of iterator) {
    last = v
  }
  return last
}

/** count the items in an interable */
function count(iterator: Iterable<unknown>) {
  let c = 0
  for (const _ of iterator) {
    c++
  }
  return c
}
