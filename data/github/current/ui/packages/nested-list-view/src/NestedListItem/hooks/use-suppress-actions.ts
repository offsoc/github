// eslint-disable-next-line no-restricted-imports
import {iterateFocusableElements} from '@primer/behaviors/utils'
import {createContext, useContext, useEffect} from 'react'

const SuppressSecondaryActionsContext = createContext(false)

export const SuppressSecondaryActionsProvider = SuppressSecondaryActionsContext.Provider
/**
 * Hide all interactive elements inside the container from accessibility technologies by making them unfocusable and
 * adding `aria-hidden` to the container. Will not have any effect unless used inside a `SuppressSecondaryActionsProvider`
 * with `value={true}`.
 *
 * https://ui.githubapp.com/storybook/?path=/docs/recipes-nested-list-view-documentation-accessibility-listitem--docs#suppression-of-secondary-info-and-actions
 */
export function useSuppressActions(containerRef: React.RefObject<HTMLElement | null>) {
  const shouldSuppress = useContext(SuppressSecondaryActionsContext)

  useEffect(() => {
    const container = containerRef.current
    if (container && shouldSuppress) {
      const updatedElements: Array<[element: HTMLElement, tabIndex: number]> = []
      const containerAriaHidden = container.getAttribute('aria-hidden')

      container.setAttribute('aria-hidden', 'true')
      for (const el of iterateFocusableElements(container)) {
        updatedElements.push([el, el.tabIndex])
        el.tabIndex = -1 // Suppresses interactive elements
      }

      return () => {
        if (containerAriaHidden) container.setAttribute('aria-hidden', containerAriaHidden)
        else container.removeAttribute('aria-hidden')

        for (const [el, tabIndex] of updatedElements) el.tabIndex = tabIndex
      }
    }
  }, [containerRef, shouldSuppress])
}
