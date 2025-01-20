import {useEffect} from 'react'

/**
 * using a symbol here to avoid potentially clobbering similarly named state in the future
 */
export const effects = Symbol('effects')

type EffectState = {[effects]: Array<() => void | (() => void)>}

/**
 * A Higher order reducer adding support for calling arbitrary effects
 * when a reducer returns a new state.
 *
 * Effects are enqueued and executed in the order they are added with
 * the next state, previousState and the action that caused this change
 *
 * It's reccomended to use symbols when defining additional action arguments
 * to avoid potentially overriding/clashing with other action arguments,
 * but this is not required
 *
 * @param reducer A reducer to apply additional functionality to
 * @param effect An effect to call on state updates. This is called with the incoming state, the previous state and the
 * @returns
 */
export const withReducerEffects = <S, A, AdditionalActionArgs>(
  reducer: React.Reducer<S, A>,
  effect: (state: S, previousState: S, actionHistory: A & AdditionalActionArgs) => void,
): ((state: S & EffectState, action: A & AdditionalActionArgs) => S & EffectState) => {
  return (state, action) => {
    const {[effects]: currentEffects, ...restState} = state
    const nextState = reducer(restState as S, action)
    return {
      ...nextState,
      [effects]: currentEffects.concat([() => effect(nextState, state, action)]),
    }
  }
}

/**
 * Given a state containing the Effects key,
 * run all of the effects in a useEffect
 *
 * Effects are run in the order they are enqueded and mutably
 * erased from the current state, to avoid re-render from executing
 * these effects
 */
export const useExecuteReducerEffects = (state: EffectState) => {
  const currentEffects = state[effects]
  /**
   * loops through the currentEffects after change to call them - this ensures that these effects
   * are not in the reducer, but instead based on the result of it when it is called
   */
  useEffect(() => {
    if (!currentEffects) return
    const cleanups: Array<() => void> = []

    /**
     * Loop through the array in order
     * removing the first item on every iteration,
     * and then calling it if it's callable.
     *
     * If the call returns a function,
     * append it to the cleanups array
     */
    while (currentEffects.length > 0) {
      /**
       * Since we never read this outside of this effect, it's safe to mutate, as we replace
       * these anyway
       */
      const effect = currentEffects.shift()
      if (effect && typeof effect === 'function') {
        const cancel = effect()
        if (cancel && typeof cancel === 'function') {
          cleanups.push(cancel)
        }
      }
    }

    return () => {
      /**
       * Loop through and call each of the cleanup functions
       *
       * since this is a new array on every call to run effects, there's no need
       * to drop items from it
       */
      for (const cleanup of cleanups) {
        if (cleanup) {
          cleanup()
        }
      }
    }
  }, [currentEffects])
}
