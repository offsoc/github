import {clsx} from 'clsx'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CodeIcon,
  FileIcon,
  FoldIcon,
  UnfoldIcon,
} from '@primer/octicons-react'
import {Link, Octicon, SegmentedControl} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import type {PatchStatus} from '@github-ui/diff-file-helpers'
import {fileModeChangedOnly} from '@github-ui/diff-file-helpers'
import type {MouseEvent, ReactNode, RefObject} from 'react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {LinesChangedCounterLabel} from './LinesChangedCounterLabel'
import styles from './DiffFileHeader.module.css'

function FileName({
  newPath,
  oldPath,
  status,
}: {
  newPath?: string | null
  oldPath?: string | null
  status: PatchStatus
}): JSX.Element {
  const newPathStartsWithDot = newPath && newPath.startsWith('.')
  const oldPathStartsWithDot = oldPath && oldPath.startsWith('.')
  const newPathElement = newPathStartsWithDot ? <>&lrm;{newPath}</> : <>{newPath}</>
  const oldPathElement = oldPathStartsWithDot ? <>&lrm;{oldPath}</> : <>{oldPath}</>
  if (status === 'RENAMED') {
    return (
      <code>
        {oldPathElement} <ArrowRightIcon /> {newPathElement}
      </code>
    )
  } else if (status === 'DELETED' || status === 'REMOVED') {
    return <code>{oldPathElement}</code>
  } else {
    return <code>{newPathElement}</code>
  }
}

export interface DiffFileHeaderProps {
  /**
   * Optional additional content to render to the left of the file name
   */
  additionalLeftSideContent?: ReactNode
  /**
   * Indicates whether the lines in the file have all been expanded
   */
  areLinesExpanded: boolean
  /**
   * Indicates whether the "expand all" button should be shown
   */
  canExpandOrCollapseLines: boolean
  /**
   * Indicates whether the diff should default to rich mode
   */
  defaultToRichDiff?: boolean
  /**
   * Indicates whether the file is in a collapsed state
   */
  isCollapsed: boolean
  /**
   * Indicates whether the diff can be displayed in rich mode
   */
  canToggleRichDiff: boolean
  /**
   * Count of the number of lines added to the file
   */
  linesAdded: number
  /**
   * Count of the number of lines deleted from the file
   */
  linesDeleted: number
  /**
   * The href to use for the file name link
   */
  fileLinkHref?: string
  /**
   * A ref to use for the file name link
   */
  fileLinkRef?: RefObject<HTMLAnchorElement>
  /**
   * The new git mode of the file
   */
  newMode?: number
  /**
   * The new path of the file
   */
  newPath?: string | null
  /**
   * The old git mode of the file
   */
  oldMode?: number
  /**
   * The old path of the file
   */
  oldPath?: string | null
  /**
   * Callback invoked when the user clicks the button to copy the file path
   */
  onCopyPath?: () => void
  /**
   * Callback invoked when the user clicks the header
   */
  onHeaderClick?: (e: MouseEvent<HTMLElement>) => void
  /**
   * Callback invoked when the user clicks the button to toggle the expanded state of all lines
   */
  onToggleExpandAllLines?: () => void
  /**
   * Callback invoked when the user clicks the button to toggle the collapsed state of the file
   */
  onToggleFileCollapsed: () => void
  /**
   * Callback invloked when the user clicks the button to toggle the display of the diff between rich and source
   */
  onToggleDiffDisplay?: (rich: boolean) => void
  /**
   * The status of the file
   */
  patchStatus: PatchStatus
  /**
   * The path of the file
   */
  path: string
  /**
   * Optional additional content to render after the file name. This content will be right-aligned.
   */
  rightSideContent?: ReactNode
}

/**
 * Renders the header of a diff file.
 */
export function DiffFileHeader({
  additionalLeftSideContent,
  areLinesExpanded,
  canExpandOrCollapseLines,
  defaultToRichDiff,
  isCollapsed,
  canToggleRichDiff,
  linesAdded,
  linesDeleted,
  fileLinkHref,
  fileLinkRef,
  newMode,
  newPath,
  oldMode,
  oldPath,
  onCopyPath,
  onHeaderClick,
  onToggleDiffDisplay,
  onToggleExpandAllLines,
  onToggleFileCollapsed,
  patchStatus,
  path,
  rightSideContent,
}: DiffFileHeaderProps) {
  return (
    <div className={clsx(styles['diff-file-header'], isCollapsed ? styles['collapsed'] : '')}>
      <button
        onClick={onToggleFileCollapsed}
        className="Button Button--iconOnly Button--invisible flex-shrink-0"
        aria-label={isCollapsed ? `expand file: ${path}` : `collapse file: ${path}`}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
      </button>
      {additionalLeftSideContent}
      <div className="d-flex px-1 flex-items-center flex-1 overflow-hidden">
        <h3 className={clsx(styles['file-name'])}>
          <Link className="Link--primary" href={fileLinkHref} onClick={onHeaderClick} ref={fileLinkRef}>
            <FileName newPath={newPath} oldPath={oldPath} status={patchStatus} />
          </Link>
        </h3>
        <CopyToClipboardButton
          className="ml-1 flex-shrink-0"
          textToCopy={newPath ?? oldPath ?? ''}
          ariaLabel="Copy file name to clipboard"
          tooltipProps={{direction: 's', anchorSide: 'outside-bottom'}}
          onCopy={onCopyPath}
          avoidStyledComponent={true}
          hasPortalTooltip={true}
        />
        {fileModeChangedOnly(patchStatus, oldMode, newMode) && (
          <div className="p-2">
            <code>{oldMode}</code>
            <Octicon icon={ArrowRightIcon} sx={{mx: 1}} />
            <code>{newMode}</code>
          </div>
        )}
        {canExpandOrCollapseLines && onToggleExpandAllLines && (
          <Tooltip
            text={areLinesExpanded ? `collapse non diff lines: ${path}` : `expand all lines: ${path}`}
            direction="s"
          >
            <button
              onClick={onToggleExpandAllLines}
              className={`Button Button--iconOnly Button--invisible flex-shrink-0 ${
                areLinesExpanded ? '' : `js-expand-all-difflines-button`
              }`}
              aria-label={areLinesExpanded ? `collapse non diff lines: ${path}` : `expand all lines: ${path}`}
              data-file-path={path}
            >
              {areLinesExpanded ? <FoldIcon /> : <UnfoldIcon />}
            </button>
          </Tooltip>
        )}
      </div>
      <div className="d-flex mr-2 flex-justify-end flex-1">
        {linesAdded > 0 && <LinesChangedCounterLabel isAddition>+{linesAdded}</LinesChangedCounterLabel>}
        {linesDeleted > 0 && <LinesChangedCounterLabel isAddition={false}>-{linesDeleted}</LinesChangedCounterLabel>}
      </div>
      {canToggleRichDiff && (
        <SegmentedControl
          aria-label="File view"
          size="small"
          sx={{mx: 2}}
          onChange={onToggleDiffDisplay ? index => onToggleDiffDisplay(index === 1) : undefined}
        >
          <SegmentedControl.IconButton
            aria-label="Display the source diff"
            defaultSelected={!defaultToRichDiff}
            icon={CodeIcon}
          />
          <SegmentedControl.IconButton
            aria-label="Display the rich diff"
            defaultSelected={defaultToRichDiff}
            icon={FileIcon}
          />
        </SegmentedControl>
      )}
      {rightSideContent}
    </div>
  )
}
