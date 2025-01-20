import {useEffect} from 'react'

export function useHideFooter(hide: boolean) {
  useEffect(() => {
    if (!hide) {
      return
    }

    const footer: HTMLDivElement | null = document.querySelector('.footer')
    if (!footer) {
      return
    }
    footer.hidden = true
    return () => {
      footer.hidden = false
    }
  }, [hide])
}
