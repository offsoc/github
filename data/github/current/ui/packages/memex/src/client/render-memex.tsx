import {StrictMode} from 'react'
import type {Root} from 'react-dom/client'

export async function renderMemex(element: React.ReactElement, appContainer: HTMLElement, root: Root) {
  if (process.env.NODE_ENV === 'development') {
    await import('./axe').then(axe => axe.setupAxe())
  }
  const parentElement = appContainer?.parentElement

  if (!document.getElementById('portal-root')) {
    const portalRoot = document.createElement('div')
    portalRoot.setAttribute('id', 'portal-root')
    parentElement?.appendChild(portalRoot)
  }

  root.render(<StrictMode>{element}</StrictMode>)
  /*
   * The following style changes are necessary here since we don't control the layout
   * that produces the div that we render into. We need to add `overflow: hidden` to
   * this div so that it will not grow based on the size of its contents. Instead,
   * we want to control our own scrolling, but we need to be able to make the memex
   * item table as large as will fit in the available space.
   */
  appContainer.style.overflow = 'hidden'
  if (appContainer.parentElement?.parentElement) {
    appContainer.parentElement.parentElement.style.overflow = 'hidden'
  }
}
