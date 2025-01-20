import {useLayoutEffect} from '@github-ui/use-layout-effect'
import type {RefObject} from 'react'
import {useCallback, useEffect, useRef} from 'react'

type OnKeyPressCallBack = (event: KeyboardEvent) => void

export enum ModifierKeys {
  ctrlKey = 'ctrlKey',
  altKey = 'altKey',
  shiftKey = 'shiftKey',
  metaKey = 'metaKey',
}

export type OnKeyPressOptions = {[key in ModifierKeys]?: boolean} & {
  triggerWhenInputElementHasFocus?: boolean
  triggerWhenPortalIsActive?: boolean
  scopeRef?: RefObject<HTMLElement>
  ignoreModifierKeys?: boolean
}

export const useKeyPress = (keys: string[], callback: OnKeyPressCallBack, options?: OnKeyPressOptions) => {
  // implement the callback ref pattern
  const callbackRef = useRef(callback)
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  // handle what happens on key press
  const handleKeyPress: EventListener = useCallback(
    (event: Event) => {
      const keyboardEvent = event as KeyboardEvent

      if (isPortalActive() && !options?.triggerWhenPortalIsActive) {
        return
      }

      if (!checkModifierKeys(keyboardEvent, options) && !options?.ignoreModifierKeys) {
        return
      }

      if (!options?.triggerWhenInputElementHasFocus && eventTargetIsInputElement(keyboardEvent)) {
        return
      }

      // check if the key is part of the ones we want to listen to
      if (
        keys.some(key => {
          // In these cases we look at event.code since event.key will depend on whether a modifier key is pressed
          if (/^\d$/.test(key)) {
            return keyboardEvent.code === `Digit${key}`
          } else if (key === '/') {
            return keyboardEvent.code === 'Slash'
          }

          return keyboardEvent.key === key
        })
      ) {
        callbackRef.current(keyboardEvent)
      }
    },
    [keys, options],
  )

  useEffect(() => {
    const targetElement = options?.scopeRef?.current || document
    targetElement.addEventListener('keydown', handleKeyPress)
    return () => targetElement.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress, options?.scopeRef])
}

const portalSelectors = '#__primerPortalRoot__, [id$="-portal-root"]'

function isPortalActive() {
  const portals = [...document.querySelectorAll(portalSelectors)]
  return portals.some(elementHasNonZeroHeight)
}

function elementHasNonZeroHeight(element: Element): boolean {
  if (element.clientHeight > 0) return true

  for (const child of element.children) {
    if (elementHasNonZeroHeight(child)) return true
  }

  return false
}

function checkModifierKeys(keyboardEvent: KeyboardEvent, options: OnKeyPressOptions | undefined) {
  for (const key of Object.values(ModifierKeys)) {
    if (options && options[key] && !keyboardEvent[key]) {
      // modifier key is required but not pressed
      return false
    }

    if (keyboardEvent[key] && (!options || !options[key])) {
      // modifier key is pressed but not required
      return false
    }
  }

  return true
}

export function eventTargetIsInputElement(event: KeyboardEvent) {
  return event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement
}
