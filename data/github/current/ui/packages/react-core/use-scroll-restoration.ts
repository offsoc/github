import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import type {Position} from '@github/turbo/dist/types/core/types'
import {noop} from '@github-ui/noop'

const scrollMap = new Map<string, Position>()

let installed = false

async function saveScrollPosition() {
  const {session} = await import('@github/turbo')

  window.addEventListener('popstate', () => {
    const {scrollPosition} =
      session.history.getRestorationDataForIdentifier(session.history.restorationIdentifier) || {}
    if (!scrollPosition) return
    scrollMap.set(window.location.href, scrollPosition)
  })
}

export function installScrollRestoration() {
  if (ssrSafeWindow) {
    if (installed) return
    saveScrollPosition()
    installed = true
  }
}

function useScrollRestorationInBrowser() {
  useLayoutEffect(() => {
    const href = window.location.href
    const scroll = scrollMap.get(href)

    if (!scroll) return
    const timeout = setTimeout(() => {
      window.scrollTo(scroll.x, scroll.y)
    }, 0)
    return () => {
      clearTimeout(timeout)
    }
  })
}

/**
 * This hook restores turbo-scroll-restoration position AFTER the page has been rendered.
 * Otherwise, turbo was restoring scroll on the page before react had rendered.
 */
export const useScrollRestoration = ssrSafeWindow ? useScrollRestorationInBrowser : noop

if (typeof afterEach === 'function') {
  afterEach(() => {
    scrollMap.clear()
    installed = false
  })
}
