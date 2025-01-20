import {useEffect} from 'react'

export function usePreventBodyScroll(isActive?: boolean) {
  useEffect(() => {
    document.body.style.overflow = isActive ? 'hidden' : 'initial'

    return () => {
      document.body.style.overflow = 'initial'
    }
  }, [isActive])
}
