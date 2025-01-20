import type {ComponentPropsWithoutRef} from 'react'
import type React from 'react'
import {clsx} from 'clsx'
import type {DiffLineType} from '../types'
import {getBackgroundColor} from '../diff-line-helpers'

type LineNumberProps = React.PropsWithChildren<{
  ariaLabel?: string
  colSpan?: number
  hasExpanderButton?: boolean
  lineType: DiffLineType
  interactiveProps?: ComponentPropsWithoutRef<'button'> | null
  isHighlighted?: boolean
}>

/**
 * Renders the line number on a diff line
 */
export const LineNumber: React.FC<LineNumberProps> = ({
  ariaLabel,
  children,
  hasExpanderButton,
  lineType,
  colSpan,
  interactiveProps,
  isHighlighted,
  ...rest
}) => {
  let wrappedChildren = <code className="pr-2">{children}</code>
  if (interactiveProps) {
    wrappedChildren = (
      <button className="diff-line-number-button" {...interactiveProps} aria-label={ariaLabel}>
        {wrappedChildren}
      </button>
    )
  }

  return (
    <td
      aria-label={!interactiveProps ? ariaLabel : undefined}
      data-line-number
      className={clsx('diff-line-number', {'has-expander': hasExpanderButton, clickable: !!interactiveProps})}
      colSpan={colSpan || 1}
      style={{backgroundColor: getBackgroundColor(lineType, true, isHighlighted)}}
      {...rest}
    >
      {wrappedChildren}
    </td>
  )
}
