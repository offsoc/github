import {useEffect} from 'react'

function getHovercard(event: Event) {
  if (!(event.target instanceof HTMLElement)) return null
  return event.target.closest('.js-hovercard-content')
}

export const useHovercardClickIntercept: (callback: (url: string, event: MouseEvent) => void) => void = (
  callback: (url: string, event: MouseEvent) => void,
) => {
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      // Don't let focus trap interfere with click interception.
      const hovercard = getHovercard(event)
      if (hovercard) event.stopPropagation()
    }

    const handleClick = (event: MouseEvent) => {
      const hovercard = getHovercard(event)
      if (!hovercard) return

      const url = hovercard.getAttribute('data-hovercard-target-url')
      if (!url) return

      callback(url, event)
    }

    window.addEventListener('focus', handleFocus, true)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('focus', handleFocus, true)
      window.removeEventListener('click', handleClick)
    }
  })
}
