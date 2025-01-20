import {getBackgroundColor, getLineNumberWidth} from '@github-ui/diffs/diff-line-helpers'
import {diffLineFileWrap, HunkKebabIcon, threadLineLocation, UnifiedDiffTable} from '@github-ui/diffs/DiffParts'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLDiv} from '@github-ui/safe-html'
import {Box, type SxProp, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {useMemo} from 'react'

import type {StaticDiffLine, Thread} from '../types'

/**
 * Presentational component for a non-interactive line number cell
 */
function StaticLineNumberCell({line, children}: {line: StaticDiffLine; children: React.ReactNode}) {
  return (
    <td
      className="diff-line-number"
      style={{backgroundColor: getBackgroundColor(line.type, true), textAlign: 'center'}}
    >
      <code>{children}</code>
    </td>
  )
}

/**
 * Presentational component for a non-interactive hunk cell
 * Note that it spans the entire table row
 */
function StaticHunkCell({line}: {line: StaticDiffLine}) {
  return (
    <td
      colSpan={4}
      style={{backgroundColor: 'var(--bgColor-accent-muted, var(--color-accent-subtle))', flexGrow: 1}}
      valign="top"
    >
      <Box sx={{display: 'flex', flexDirection: 'row'}}>
        <HunkKebabIcon />
        <code className="diff-text-cell hunk">
          {/* Explicitly mark html as safe because it is server-sanitized */}
          <SafeHTMLDiv className="diff-text-inner color-fg-muted" html={line.html as SafeHTMLString} />
        </code>
      </Box>
    </td>
  )
}

/**
 * Renders a non-interactive row of a unified diff line
 * Specifically for use in outdated threads, which return a slightly different set of difflines
 * This component was derived from the interactive version (CodeDiffLine) in DiffLineTableRow.tsx
 */
function StaticUnifiedDiffRow({line, tabSize}: {line: StaticDiffLine; tabSize: number}) {
  const isHunkRow = line.type === 'HUNK'
  const showLeftNumber = line.type !== 'ADDITION'
  const showRightNumber = line.type !== 'DELETION'

  const {getTextIndent, getPaddingLeft} = useMemo(() => diffLineFileWrap(line.text, tabSize), [line, tabSize])
  const lineMarker = line.type === 'ADDITION' ? '+' : line.type === 'DELETION' ? '-' : undefined
  const showLineMarker = !!lineMarker

  return (
    <tr>
      {isHunkRow && <StaticHunkCell line={line} />}
      {!isHunkRow && (
        <>
          <StaticLineNumberCell line={line}>{showLeftNumber && line.left}</StaticLineNumberCell>
          <StaticLineNumberCell line={line}>{showRightNumber && line.right}</StaticLineNumberCell>
          <td className="diff-text-cell" style={{backgroundColor: getBackgroundColor(line.type, false)}}>
            <code
              className={clsx('diff-text syntax-highlighted-line', {
                addition: line.type === 'ADDITION',
                deletion: line.type === 'DELETION',
              })}
            >
              {showLineMarker && <span className="diff-text-marker">{lineMarker}</span>}
              {/* Explicitly mark html as safe because it is server-sanitized */}
              <SafeHTMLDiv
                className="diff-text-inner"
                html={line.html as SafeHTMLString}
                style={{
                  backgroundColor: getBackgroundColor(line.type, false),
                  paddingLeft: getPaddingLeft(),
                  textIndent: getTextIndent(),
                }}
              />
            </code>
          </td>
        </>
      )}
    </tr>
  )
}

function StaticUnifiedDiffLines({
  sx,
  lines,
  lineWidth,
  tabSize,
}: {
  lines: StaticDiffLine[]
  lineWidth: string
  tabSize: number
} & SxProp) {
  const diffRows = lines.map((diffline, index) => {
    const line = diffline

    return <StaticUnifiedDiffRow key={index} line={line} tabSize={tabSize} />
  })

  return (
    <Box
      as="table"
      className="tab-size"
      data-tab-size={tabSize}
      sx={{
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 1,
        borderRight: 1,
        borderStyle: 'solid',
        borderColor: 'border.muted',
        ...sx,
      }}
    >
      <UnifiedDiffTable lineWidth={lineWidth}>{diffRows}</UnifiedDiffTable>
    </Box>
  )
}

/**
 * Renders a static representation of a unified diff
 * Specifically for use in outdated threads, which return a slightly different set of difflines
 */
export function StaticUnifiedDiffPreview({
  sx,
  tabSize,
  thread,
  hideHeaderDetails,
  diffTableSx,
}: {tabSize: number; thread: Thread; hideHeaderDetails?: boolean; diffTableSx?: BetterSystemStyleObject} & SxProp) {
  if (!thread.subject?.diffLines || thread.subject?.diffLines.length < 1) {
    return null
  }

  const lineWidth = getLineNumberWidth(thread.subject.diffLines)

  return (
    <Box
      sx={{
        m: 3,
        border: 0,
        borderBottomWidth: 6,
        borderStyle: 'solid',
        borderColor: 'border.muted',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        ...sx,
      }}
    >
      {!hideHeaderDetails && (
        <Box
          sx={{
            borderWidth: 1,
            borderStyle: 'solid',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            borderColor: 'border.muted',
            color: 'fg.muted',
            px: 2,
            py: 1,
          }}
        >
          <Text sx={{fontSize: 0, color: 'fg.muted'}}>
            Line{' '}
            {threadLineLocation({
              originalStartLine: thread.subject.originalStartLine,
              originalEndLine: thread.subject.originalEndLine,
              startDiffSide: thread.subject.startDiffSide,
              endDiffSide: thread.subject.endDiffSide,
            })}
            , commit <code>{thread.subject.pullRequestCommit?.commit.abbreviatedOid}</code>
          </Text>
        </Box>
      )}
      <StaticUnifiedDiffLines
        lineWidth={lineWidth}
        lines={thread.subject.diffLines}
        tabSize={tabSize}
        sx={diffTableSx}
      />
    </Box>
  )
}
