import {useEffect, useState} from 'react'

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false)

  useEffect(() => {
    if (!window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [])

  return prefersReducedMotion
}
