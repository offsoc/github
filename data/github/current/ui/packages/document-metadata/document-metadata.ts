import {announce} from '@github-ui/aria-live'
import {ssrSafeDocument} from '@github-ui/ssr-utils'

export function setTitle(title: string) {
  if (!ssrSafeDocument) return

  const oldTitle = ssrSafeDocument.querySelector('title')
  const newTitle = ssrSafeDocument.createElement('title')
  newTitle.textContent = title

  if (!oldTitle) {
    ssrSafeDocument.head.appendChild(newTitle)
    announce(title)
  } else if (oldTitle.textContent !== title) {
    // only replace and announce the title if it's changed
    oldTitle.replaceWith(newTitle)
    announce(title)
  }
}
