import {ssrSafeLocation} from '@github-ui/ssr-utils'
import React, {useCallback, useContext, useMemo, useRef} from 'react'

export type FocusHintContextType = {
  focusHint: string | null
  context?: unknown
  setFocusHint: (hint: string | null, context?: unknown) => void
}

const FocusHintContext = React.createContext<FocusHintContextType>({
  focusHint: null,
  setFocusHint: () => void 0,
})

export function FocusHintContextProvider({children}: React.PropsWithChildren) {
  const location = {key: ssrSafeLocation.pathname + ssrSafeLocation.search}
  const lastLocationKey = useRef(location.key)
  const currentLocationKey = useRef(location.key)

  const focusHint = useRef<{hint: string | null; context?: unknown; location: string | null}>({
    hint: null,
    location: null,
  })
  const focusHintSetter = useCallback(
    (hint: string | null, context?: unknown) => {
      focusHint.current = {hint, context, location: location.key}
    },
    [location.key],
  )

  if (currentLocationKey.current !== location.key) {
    lastLocationKey.current = currentLocationKey.current
    currentLocationKey.current = location.key
  }

  const hintValid = focusHint.current.location === lastLocationKey.current
  const hintValue = hintValid ? focusHint.current.hint : null
  const contextValue = hintValid ? focusHint.current.context : null

  const value = useMemo(
    () => ({focusHint: hintValue, context: contextValue, setFocusHint: focusHintSetter}),
    [hintValue, contextValue, focusHintSetter],
  )
  return <FocusHintContext.Provider value={value}>{children}</FocusHintContext.Provider>
}

/**
 * This allows us to send a focus hint to the next page we are navigating to.
 *
 * The idea is that before navigation within the same React app, we can set a focus hint. When the
 * next page renders, it can see that focus hint and use it to designate an element to receive the
 * initial focus.
 */
export function useFocusHintContext() {
  return useContext(FocusHintContext)
}
