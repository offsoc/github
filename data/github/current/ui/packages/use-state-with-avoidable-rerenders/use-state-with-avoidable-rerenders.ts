import {useCallback, useRef, useState} from 'react'

/**
 * Custom state hook that will only update state when the value changes.
 * Uses a shallow comparison to determine if the value changed
 */
export function useStateWithAvoidableReRenders<T>(initialState: T | (() => T)): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialState)

  // Allow callback to access the current state without having to re-define the callback function
  // each time state changes. This allows us to keep steadier props and avoid extra re-renders in memo'd components.
  const stateRef = useRef<T>(state)
  stateRef.current = state

  const setStateIfChanged = useCallback((newState: T) => {
    if (newState !== stateRef.current) {
      setState(newState)
    }
  }, [])

  return [state, setStateIfChanged]
}
