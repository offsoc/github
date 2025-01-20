import {clsx} from 'clsx'
import {copyText} from '@github-ui/copy-to-clipboard'
import {useAnalytics} from '@github-ui/use-analytics'
import {CopyIcon, FoldDownIcon, FoldUpIcon, UnfoldIcon} from '@primer/octicons-react'
import type {IconButtonProps} from '@primer/react'
import {ActionList, ActionMenu} from '@primer/react'
import {useMemo} from 'react'

import {useDiffLineContext} from '../contexts/DiffLineContext'
import {trimContentLine, parseHtml, getAriaKeyShortcutString, getKeyboardShortcutString} from '../helpers/line-helpers'
import useExpandHunk from '../hooks/use-expand-hunk'
import type {DiffLine} from '../types'
import {JumpToHunkListItems} from './DiffLineTableCellContextMenus'
import {HunkCell} from './DiffLineTableCellParts'
import type {DiffMatchContent} from '../diff-lines'
import styles from './ExpandableHunkHeaderDiffLine.module.css'

export type PrunedIconButtonProps = Omit<IconButtonProps, 'aria-labelledby' | 'aria-label' | 'icon' | 'sx'>
type ExpandButtonIcon = typeof UnfoldIcon
type ExpandButtonLineProps = {
  direction: 'all' | 'down' | 'up'
  icon: ExpandButtonIcon
  label: string
  ariaLabel?: string
  onClick: () => void
} & PrunedIconButtonProps

function ExpandButtonLine({
  direction,
  icon: Icon,
  label,
  onClick,
  ariaLabel,
  className,
  ...additionalProps
}: ExpandButtonLineProps) {
  const {sendAnalyticsEvent} = useAnalytics()

  return (
    <button
      onClick={() => {
        onClick()
        sendAnalyticsEvent('file_entry.expand_hunk', 'FILE_EXPANDER_BUTTON')
      }}
      className={clsx('Button Button--iconOnly Button--invisible', styles['expand-button-line'], className)}
      aria-label={ariaLabel ?? label}
      data-direction={direction}
      {...additionalProps}
    >
      <Icon />
    </button>
  )
}

type ExpandButtonType = 'expand-all' | 'expand-up-and-down' | 'expand-down' | 'expand-up' | undefined

export interface ExpandableHunkHeaderDiffLineProps {
  nextLine?: DiffLine | null
  prevLine?: DiffLine | null
  resultsForLine?: DiffMatchContent[]
  focusedSearchResult?: number
}

export default function ExpandableHunkHeaderDiffLine({
  nextLine,
  prevLine,
  resultsForLine,
  focusedSearchResult,
}: ExpandableHunkHeaderDiffLineProps) {
  const {fileLineCount, diffLine} = useDiffLineContext()
  const currentLine = diffLine as DiffLine
  const {expandStartOfHunk, expandEndOfPreviousHunk} = useExpandHunk()

  const isStartOfDiff = !prevLine
  const isEndOfDiff = !nextLine
  const isStartOfFile = currentLine.blobLineNumber === 0
  const isStartOrEndOfDiff = isStartOfDiff || isEndOfDiff
  const isEndOfFile = isEndOfDiff && currentLine.blobLineNumber === fileLineCount
  const maxRequestLineLimit = 20

  const showExpandAll = useMemo(() => {
    if (isStartOrEndOfDiff) return false
    if (currentLine.blobLineNumber <= 0) return false
    if (currentLine.blobLineNumber - prevLine.blobLineNumber <= maxRequestLineLimit) return true
    if (nextLine.blobLineNumber - currentLine.blobLineNumber >= maxRequestLineLimit) return true
    return false
  }, [isStartOrEndOfDiff, currentLine, nextLine, prevLine])

  const showExpandAboveAndBelow = useMemo(() => {
    if (isStartOrEndOfDiff) return false
    if (isEndOfFile) return false
    if (currentLine.blobLineNumber - prevLine.blobLineNumber > maxRequestLineLimit) return true
    return false
  }, [isStartOrEndOfDiff, isEndOfFile, currentLine, prevLine])

  const showExpandAbove = useMemo(() => {
    if (currentLine.blobLineNumber <= 0) return false
    if (isStartOfFile) return false
    if (isStartOfDiff) return true
    return false
  }, [isStartOfDiff, isStartOfFile, currentLine])

  const showExpandBelow = useMemo(() => {
    if (isStartOfDiff) return false
    if (isEndOfFile) return false
    if (isEndOfDiff) return true
    return false
  }, [isStartOfDiff, isEndOfDiff, isEndOfFile])

  const expandButtonType: ExpandButtonType = useMemo(() => {
    switch (true) {
      case showExpandAll:
        return 'expand-all'
      case showExpandAboveAndBelow:
        return 'expand-up-and-down'
      case showExpandAbove:
        return 'expand-up'
      case showExpandBelow:
        return 'expand-down'
    }
  }, [showExpandAll, showExpandAboveAndBelow, showExpandAbove, showExpandBelow])

  const handleExpandAboveClick = () => expandStartOfHunk()
  const handleExpandBelowClick = () => expandEndOfPreviousHunk()
  const handleExpandAllClick = () => expandStartOfHunk()

  const handleCopyContentClick = () => {
    const [parsedContent] = trimContentLine(parseHtml(currentLine.html), currentLine.type)
    void copyText(parsedContent)
  }

  const renderHunkButton = (additionalProps?: PrunedIconButtonProps) => {
    switch (expandButtonType) {
      case 'expand-all':
        return (
          <ExpandButtonLine
            {...additionalProps}
            direction="all"
            icon={UnfoldIcon}
            label={`Expand file from line ${prevLine?.blobLineNumber || ''} to line ${nextLine?.blobLineNumber || ''}`}
            onClick={handleExpandAllClick}
          />
        )
      case 'expand-up-and-down':
        return (
          <div className="d-flex flex-column">
            <ExpandButtonLine
              {...additionalProps}
              direction="down"
              icon={FoldDownIcon}
              label={`Expand file down from line ${prevLine?.blobLineNumber || ''}`}
              className={styles['expand-up-and-down']}
              onClick={handleExpandBelowClick}
            />
            <ExpandButtonLine
              {...additionalProps}
              direction="up"
              icon={FoldUpIcon}
              label={`Expand file up from line ${nextLine?.blobLineNumber || ''}`}
              className={styles['expand-up-and-down']}
              onClick={handleExpandAboveClick}
            />
          </div>
        )
      case 'expand-up':
        return (
          <ExpandButtonLine
            {...additionalProps}
            direction="up"
            icon={FoldUpIcon}
            label={`Expand file up from line ${nextLine?.blobLineNumber || ''}`}
            onClick={handleExpandAboveClick}
          />
        )
      case 'expand-down':
        return (
          <ExpandButtonLine
            {...additionalProps}
            direction="down"
            icon={FoldDownIcon}
            label={`Expand file down from line ${prevLine?.blobLineNumber || ''}`}
            onClick={handleExpandBelowClick}
          />
        )
      default:
        return null
    }
  }

  return (
    <HunkCell
      searchResultsForLine={resultsForLine}
      focusedSearchResult={focusedSearchResult}
      renderHunkButton={renderHunkButton}
      ContextMenu={
        <HunkContextMenu
          handleCopyContent={handleCopyContentClick}
          handleExpandAbove={handleExpandAboveClick}
          handleExpandAll={handleExpandAllClick}
          handleExpandBelow={handleExpandBelowClick}
          shouldCopyContent={!!currentLine.html}
          shouldExpandAbove={showExpandAboveAndBelow || showExpandAbove}
          shouldExpandBelow={showExpandAboveAndBelow || showExpandBelow}
        />
      }
    />
  )
}

function HunkContextMenu({
  shouldExpandBelow,
  shouldExpandAbove,
  shouldCopyContent,
  handleExpandAll,
  handleExpandBelow,
  handleExpandAbove,
  handleCopyContent,
}: {
  shouldExpandBelow: boolean
  shouldExpandAbove: boolean
  shouldCopyContent: boolean
  handleExpandAll: () => void
  handleExpandBelow: () => void
  handleExpandAbove: () => void
  handleCopyContent: () => void
}) {
  const expandAllShortcutArgs = {includeShiftKey: true, key: '['}
  const expandUpShortcutArgs = {key: ']'}
  const expandBelowShortcutArgs = {key: '['}
  const copyContentShortcutArgs = {key: 'C'}

  return (
    <ActionMenu.Overlay width="medium">
      <ActionList>
        <ActionList.Item aria-keyshortcuts={getAriaKeyShortcutString(expandAllShortcutArgs)} onSelect={handleExpandAll}>
          <ActionList.LeadingVisual>
            <UnfoldIcon />
          </ActionList.LeadingVisual>
          Expand all
          <ActionList.TrailingVisual>
            <span>{`${getKeyboardShortcutString(expandAllShortcutArgs)}`}</span>
          </ActionList.TrailingVisual>
        </ActionList.Item>
        {shouldExpandAbove ? (
          <ActionList.Item
            aria-keyshortcuts={getAriaKeyShortcutString(expandUpShortcutArgs)}
            onSelect={handleExpandAbove}
          >
            <ActionList.LeadingVisual>
              <FoldUpIcon />
            </ActionList.LeadingVisual>
            Expand above
            <ActionList.TrailingVisual>
              <span>{`${getKeyboardShortcutString(expandUpShortcutArgs)}`}</span>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        ) : null}
        {shouldExpandBelow ? (
          <ActionList.Item
            aria-keyshortcuts={getAriaKeyShortcutString(expandBelowShortcutArgs)}
            onSelect={handleExpandBelow}
          >
            <ActionList.LeadingVisual>
              <FoldDownIcon />
            </ActionList.LeadingVisual>
            Expand below
            <ActionList.TrailingVisual>
              <span>{`${getKeyboardShortcutString(expandBelowShortcutArgs)}`}</span>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        ) : null}
        <JumpToHunkListItems />
        {shouldCopyContent ? (
          <ActionList.Item
            aria-keyshortcuts={getAriaKeyShortcutString(copyContentShortcutArgs)}
            onSelect={handleCopyContent}
          >
            <ActionList.LeadingVisual>
              <CopyIcon />
            </ActionList.LeadingVisual>
            Copy
            <ActionList.TrailingVisual>
              <span>{`${getKeyboardShortcutString(copyContentShortcutArgs)}`}</span>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        ) : null}
      </ActionList>
    </ActionMenu.Overlay>
  )
}
