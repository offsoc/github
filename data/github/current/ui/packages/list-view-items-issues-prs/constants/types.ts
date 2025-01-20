import type {ForwardedRef, KeyboardEvent, MouseEvent} from 'react'

export type CommonItemProps = {
  ref?: ForwardedRef<HTMLAnchorElement>
  href?: string
  isActive?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onClick?: (event: MouseEvent | KeyboardEvent) => void
}
