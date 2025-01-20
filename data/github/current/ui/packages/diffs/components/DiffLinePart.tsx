import type {SimpleDiffLine} from '../types'
import {DiffText} from './DiffText'
import {LineNumber} from './LineNumber'

/**
 * Basic unit of a diffline,
 * conditionally shows the left and right line numbers, as well as the diff text
 */
export const DiffLinePart = ({
  dragging,
  isHighlighted,
  isLeftColumn,
  isSplit,
  lineAnchor,
  line,
  lineChild,
  onLineNumberClick,
}: {
  dragging?: boolean
  isHighlighted?: boolean
  isLeftColumn?: boolean
  isSplit?: boolean
  lineAnchor?: string
  line: SimpleDiffLine
  lineChild?: React.ReactNode
  onLineNumberClick?: (e: React.MouseEvent<HTMLElement>) => void
}) => {
  const isContext = line.type === 'CONTEXT' || line.type === 'INJECTED_CONTEXT'
  const showLeftNumber = line.type !== 'ADDITION'
  const showLeftNumberCell = showLeftNumber || !isSplit
  const showRightNumber = line.type !== 'DELETION'
  const showRightNumberCell = (showRightNumber && !isContext) || !isSplit

  const firstLineNumber = isSplit && isContext ? (isLeftColumn ? line.left : line.right) : line.left

  return (
    <>
      {showLeftNumberCell && (
        <LineNumber
          ariaLabel={`Line ${showLeftNumber ? line.left?.toString() : line.right?.toString()}`}
          lineType={line.type}
          interactiveProps={
            onLineNumberClick
              ? {
                  onClick: onLineNumberClick,
                }
              : null
          }
          isHighlighted={isHighlighted}
        >
          {showLeftNumber && firstLineNumber}
        </LineNumber>
      )}
      {showRightNumberCell && (
        <LineNumber
          ariaLabel={`Line ${showRightNumber ? line.right?.toString() : line.left?.toString()}`}
          lineType={line.type}
          interactiveProps={
            onLineNumberClick
              ? {
                  onClick: onLineNumberClick,
                }
              : null
          }
          isHighlighted={isHighlighted}
        >
          {showRightNumber && line.right}
        </LineNumber>
      )}
      <DiffText
        dragging={dragging}
        isHighlighted={isHighlighted}
        isLeftColumn={isLeftColumn}
        line={line}
        lineAnchor={lineAnchor}
        lineChild={lineChild}
      />
    </>
  )
}
