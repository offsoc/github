import {KebabHorizontalIcon} from '@primer/octicons-react'
import type {SimpleDiffLine} from '../types'
import {LineNumber} from './LineNumber'
import {DiffText} from './DiffText'

/**
 * Renders the hunk header diff line
 */
export function HunkHeaderDiffLine({
  currentLine,
  hunkButton,
  isLeftColumn,
  isSplit,
}: {
  currentLine: SimpleDiffLine
  hunkButton?: React.ReactNode
  isLeftColumn?: boolean
  isSplit?: boolean
}) {
  // right column isn't necessary in split view
  if (isSplit && !isLeftColumn) return null

  return (
    <>
      {hunkButton ? (
        <LineNumber colSpan={isSplit ? 1 : 2} hasExpanderButton={true} lineType={currentLine.type}>
          {hunkButton}
        </LineNumber>
      ) : (
        <>
          <LineNumber lineType={currentLine.type}>
            <KebabHorizontalIcon />
          </LineNumber>
          {!isSplit && (
            <LineNumber lineType={currentLine.type}>
              <KebabHorizontalIcon />
            </LineNumber>
          )}
        </>
      )}
      <DiffText isHighlighted={false} isLeftColumn={true} colSpan={isSplit ? 3 : undefined} line={currentLine} />
    </>
  )
}
