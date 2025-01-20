import {useCallback, useId, useState} from 'react'

import {PortalTooltip, type PortalTooltipProps} from '../PortalTooltip'

export type {PortalTooltipProps}

/**
 * A hook that returns a set of props for controlling a portal tooltip from a parent element, as well as the
 * portalled element
 *
 * This provides a simple, base case usage, without having to configure much directly, automatically generating an id and using
 * that for aria-describedby when not given an id to use instead.
 */
export function usePortalTooltip({includeAriaAttributes = true, ...props}: PortalTooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const isOpen = props.open ?? open
  const actualId = props.id ?? id
  const ariaAttributes = includeAriaAttributes
    ? {
        'aria-describedby': actualId,
      }
    : {}

  const onSetOpen = useCallback(() => setOpen(true), [])
  const onSetClose = useCallback(() => setOpen(false), [])

  return [
    {
      ...ariaAttributes,
      onPointerEnter: onSetOpen,
      onPointerLeave: onSetClose,
      onFocus: onSetOpen,
      onBlur: onSetClose,
    },
    <PortalTooltip key="portal-tooltip" {...props} open={isOpen} id={actualId} />,
  ] as const
}
