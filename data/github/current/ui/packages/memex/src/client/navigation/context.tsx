import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {createContext, createRef, memo, useCallback, useContext, useMemo, useReducer} from 'react'

import type {EnabledFeaturesMap} from '../api/enabled-features/contracts'
import {useEnabledFeatures} from '../hooks/use-enabled-features'
import type {Focus, FocusNavigation} from './types'

/**
 * A type describing the current focus state
 *
 * - T = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 */
export type FocusState<T extends Focus> = {
  focus: null | T
  previousFocus: null | T
}

export const FocusState = {
  EMPTY: {
    focus: null,
    previousFocus: null,
  } as const,
}

export const ActionTypes = {
  NAVIGATE: 'NAVIGATE',
  SET_FOCUS: 'SET_FOCUS',
  INIT: 'INIT',
} as const
export type ActionTypes = ObjectValues<typeof ActionTypes>

type InitAction<T extends Focus> = {
  type: typeof ActionTypes.INIT
  state: FocusState<T>
}

/**
 * An action which updates focus state
 *
 * - `T` = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
export type FocusAction<T extends Focus, S> = NavigateAction<S> | SetFocusStateAction<T> | InitAction<T>

/**
 * An action which describes a navigation the user intends to perform
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
export type NavigateAction<S> = {
  type: typeof ActionTypes.NAVIGATE
  navigation: FocusNavigation<S>
}

/**
 * Create a new NavigateAction.
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
export const createNavigateAction = <S,>(navigation: FocusNavigation<S>): NavigateAction<S> => ({
  type: ActionTypes.NAVIGATE,
  navigation,
})

/**
 * An action which directly sets the focus state
 *
 * - T = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 */
export type SetFocusStateAction<T extends Focus> = {
  type: typeof ActionTypes.SET_FOCUS
  focus: null | T
}

/**
 * Create a new SetFocusAction.
 *
 * - T = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 */
export const createSetFocusStateAction = <T extends Focus>(focus: null | T): SetFocusStateAction<any> => ({
  type: ActionTypes.SET_FOCUS,
  focus,
})

/**
 * The value contained in the `React.Context` object created by this module
 *
 * - `T` = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
type FocusContextValue<T extends Focus, S> = {
  state: FocusState<T>
  navigationDispatch: React.Dispatch<FocusAction<T, S>>
}

/**
 * The value contained in the `React.Context` object created by this module
 *
 * - `T` = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
type StableFocusContextValue<T extends Focus, S> = {
  stateRef: React.RefObject<FocusState<T>>
  navigationDispatch: React.Dispatch<FocusAction<T, S>>
}

/**
 * Props required to render the `NavigationProvider` returned by
 * `createNavigationContext`
 *
 * - T = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 * - `SM` = An implementation-specific state metadata type
 */
type NavigationProviderProps<SM> = {
  metaRef: React.MutableRefObject<SM>
  children: React.ReactNode
}

/**
 * Create a new navigation context, its usage hook, and its provider component.
 *
 * This function is meant to be called at the top-level module somewhere,
 * **not** in a component's body. It sets up a single global navigation context
 * for a given use case. For example:
 *
 * ```ts
 * export const {
 *   context: myNavContext,
 *   useNavigation: useMyNav,
 *   useStableNavigation: useStableMyNav,
 *   NavigationProvider: MyNavProvider
 * } = createNavigationContext<number>}>()
 * ```
 *
 * Then, each can be imported:
 *
 * ```tsx
 * import {useMyNav} from '../my-nav'
 *
 * export function MyComponent() {
 *   const {state, dispatch} = useMyNav()
 *   // etc.
 * }
 * ```
 *
 * - `T` = A type representing the possible focus values - it extends the Focus type
 * which defines the details and type
 * - `SM` = An implementation-specific state metadata type
 * - `S` = A type representing extra metadata for a navigation action. Useful if it's not purely a
 * movement along the XY axes.
 */
export const createNavigationContext = <T extends Focus, SM, S>(
  navigationReducer: (
    state: FocusState<T>,
    meta: SM,
    action: NavigateAction<S>,
    enabledFeatures: EnabledFeaturesMap,
  ) => FocusState<T>,
  setFocusReducer: (
    state: FocusState<T>,
    meta: SM,
    action: SetFocusStateAction<T>,
    enabledFeatures: EnabledFeaturesMap,
  ) => FocusState<T>,
): {
  context: React.Context<FocusContextValue<T, S>>
  NavigationProvider: React.NamedExoticComponent<NavigationProviderProps<SM>>
  useNavigation: () => FocusContextValue<T, S>
  useStableNavigation: () => StableFocusContextValue<T, S>
} => {
  // Create the context.
  const context = createContext<FocusContextValue<T, S>>({
    navigationDispatch: () => void 0,
    state: {focus: null, previousFocus: null},
  })

  // Create the stable context for things that don't care about re-rendering on state changes
  const stableContext = createContext<StableFocusContextValue<T, S>>({
    stateRef: createRef(),
    navigationDispatch: () => void 0,
  })

  // Create the navigation hook.
  const useNavigation = () => {
    const contextValue = useContext(context)

    return contextValue
  }

  // Create the stable navigation hook with dispatch and state ref
  const useStableNavigation = () => {
    const contextValue = useContext(stableContext)

    return contextValue
  }

  // Create the provider component.
  const NavigationProvider = memo(function NavigationProvider({
    metaRef,
    children,
  }: React.PropsWithChildren<NavigationProviderProps<SM>>) {
    const [state, navigationDispatch] = useNavigationReducer<T, SM, S>(
      navigationReducer,
      setFocusReducer,
      metaRef,
      FocusState.EMPTY,
    )

    const stateRef = useTrackingRef(state)
    const value = useMemo(() => ({state, navigationDispatch}), [navigationDispatch, state])
    const stableValue = useMemo(() => ({navigationDispatch, stateRef}), [stateRef, navigationDispatch])

    return (
      <context.Provider value={value}>
        <stableContext.Provider value={stableValue}>{children}</stableContext.Provider>
      </context.Provider>
    )
  })

  return {context, NavigationProvider, useNavigation, useStableNavigation}
}

const useNavigationReducer = <T extends Focus, SM, S>(
  navigationReducer: (
    state: FocusState<T>,
    meta: SM,
    action: NavigateAction<S>,
    enabledFeatures: EnabledFeaturesMap,
  ) => FocusState<T>,
  setFocusReducer: (
    state: FocusState<T>,
    meta: SM,
    action: SetFocusStateAction<T>,
    enabledFeatures: EnabledFeaturesMap,
  ) => FocusState<T>,
  metaRef: React.MutableRefObject<SM>,
  initialState: FocusState<T>,
): [FocusState<T>, React.Dispatch<FocusAction<T, S>>] => {
  const enabledFeatures = useEnabledFeatures()

  const reducer: React.Reducer<FocusState<T>, FocusAction<T, S>> = useCallback(
    (state, action) => {
      switch (action.type) {
        case ActionTypes.NAVIGATE:
          return navigationReducer(state, metaRef.current, action, enabledFeatures)
        case ActionTypes.SET_FOCUS:
          return setFocusReducer(state, metaRef.current, action, enabledFeatures)
        case ActionTypes.INIT: {
          return action.state
        }
        default:
          return state
      }
    },
    [metaRef, navigationReducer, setFocusReducer, enabledFeatures],
  )

  return useReducer(reducer, initialState)
}
