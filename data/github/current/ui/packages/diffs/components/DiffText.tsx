import {clsx} from 'clsx'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLDiv} from '@github-ui/safe-html'
import type {SimpleDiffLine} from '../types'
import {getBackgroundColor, lineIdentifierFrom} from '../diff-line-helpers'

interface DiffTextProps extends React.ComponentProps<'td'> {
  colSpan?: number
  isHighlighted?: boolean
  isLeftColumn?: boolean
  line: SimpleDiffLine
  lineAnchor?: string
  lineChild?: React.ReactNode
  dragging?: boolean
}

/**
 * Renders the diff text
 */
export const DiffText = (props: DiffTextProps) => {
  const {dragging, isHighlighted, isLeftColumn, colSpan, line, lineAnchor} = props
  let lineHTML: SafeHTMLString = line.html as SafeHTMLString
  let lineTypeChar = ''

  if (['ADDITION', 'DELETION'].includes(line.type) && ['+', '-'].includes(lineHTML[0]!)) {
    lineTypeChar = lineHTML[0]!
    lineHTML = lineHTML.slice(1) as SafeHTMLString
  }

  return (
    <td
      className={clsx('diff-text-cell', {
        'border-left color-border-accent-emphasis': dragging && isHighlighted,
        'border-right': isLeftColumn && line.type !== 'HUNK',
      })}
      colSpan={colSpan}
      id={lineAnchor ? lineIdentifierFrom(lineAnchor) : undefined}
      style={{backgroundColor: getBackgroundColor(line.type, false, isHighlighted)}}
    >
      <code
        data-code-marker={lineTypeChar}
        className={clsx('diff-text syntax-highlighted-line', {
          addition: line.type === 'ADDITION',
          deletion: line.type === 'DELETION',
        })}
      >
        {props.lineChild}
        {/* Explicitly mark html as safe because it is server-sanitized */}
        <SafeHTMLDiv
          className={clsx('diff-text-inner', {
            'color-fg-muted': line.type === 'HUNK',
          })}
          html={lineHTML}
          style={{
            // todo: determine why context lines have an extra space at the beginning
            marginLeft: line.type === 'CONTEXT' ? '-7px' : undefined,
          }}
        />
      </code>
    </td>
  )
}
