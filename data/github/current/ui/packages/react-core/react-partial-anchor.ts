import type {ReactPartialAnchorElement} from '@github-ui/react-partial-anchor-element'
import {useCallback, useEffect, useRef, useState} from 'react'

interface ReactPartialAnchor {
  /**
   * DO NOT USE THIS PROPERTY DIRECTLY. It is meant to be used with useExternalAnchor and useOnAnchorClick
   */
  __wrapperElement: ReactPartialAnchorElement
}

export interface ReactPartialAnchorProps {
  reactPartialAnchor?: ReactPartialAnchor
}

export function usePartialAnchorProps(
  anchorElement: ReactPartialAnchorElement | undefined | null,
): ReactPartialAnchorProps {
  useEffect(() => {
    const anchor = anchorElement?.anchor

    if (!anchor) {
      return
    }

    if ('disabled' in anchor) {
      anchor.disabled = false
    }
    anchor.classList.remove('cursor-wait')
  }, [anchorElement])

  if (!anchorElement) {
    return {}
  }

  return {
    reactPartialAnchor: {
      __wrapperElement: anchorElement,
    },
  }
}

export function useExternalAnchor(reactPartialAnchor: ReactPartialAnchor) {
  const ref = useRef(reactPartialAnchor.__wrapperElement.anchor || null)
  const [open, setOpen] = useState(false)

  const onClick = useCallback(() => {
    // toggle the open state when clicked
    setOpen(!open)
  }, [open, setOpen])

  useEffect(() => {
    if (!ref.current) return

    ref.current.setAttribute('aria-expanded', open.toString())
    ref.current.setAttribute('aria-haspopup', 'true')
  }, [ref, open])

  useOnAnchorClick(reactPartialAnchor, onClick)

  return {
    ref,
    open,
    setOpen,
  }
}

export function useOnAnchorClick(reactPartialAnchor: ReactPartialAnchor, onClick: (event: MouseEvent) => void) {
  const ref = useRef(reactPartialAnchor.__wrapperElement.anchor)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    element.addEventListener('click', onClick)
    return () => element.removeEventListener('click', onClick)
  }, [ref, onClick])
}

export type PropsWithPartialAnchor<T> = T & Required<ReactPartialAnchorProps>
