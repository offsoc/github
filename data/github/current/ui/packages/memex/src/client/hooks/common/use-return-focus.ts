import {type RefObject, useEffect, useRef} from 'react'

/**
 * Use with dialogs & modals that don't have a `returnFocusRef` prop. On close, returns
 * focus to the referenced element.
 * @param isOpen Modal state. When this becomes false, will focus the referenced element.
 */
export const useReturnFocus = (isOpen: boolean, returnFocusRef: RefObject<HTMLElement> | null) => {
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !isOpen) returnFocusRef?.current?.focus()
    wasOpen.current = isOpen
  }, [isOpen, returnFocusRef])
}
