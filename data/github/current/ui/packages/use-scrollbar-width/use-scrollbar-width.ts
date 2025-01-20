import {useSyncExternalStore} from 'react'

let scrollbarWidth: number | null = null

export function useScrollbarWidth() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (scrollbarWidth === null) {
        scrollbarWidth = measureScrollbarWidth()
      }
      return scrollbarWidth
    },
    () => 0,
  )
}

function measureScrollbarWidth(): number {
  const el = document.createElement('div')
  el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;'
  document.body.appendChild(el)
  const width = el.offsetWidth - el.clientWidth
  el.remove()
  return width
}
