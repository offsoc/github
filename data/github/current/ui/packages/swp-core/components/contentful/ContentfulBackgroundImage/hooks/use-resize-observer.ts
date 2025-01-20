import {useEffect} from 'react'

export function useResizeObserver(callback: (window: ResizeObserverEntry) => void) {
  useEffect(() => {
    const observer = new window.ResizeObserver(entries => {
      const entry = entries[0]

      if (entry === undefined) {
        return
      }

      callback(entry)
    })
    observer.observe(document.documentElement)
    return () => {
      observer.disconnect()
    }
  }, [callback])
}
