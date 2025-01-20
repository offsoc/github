import {useEffect, useRef} from 'react'

/**
 * A hook that provides a method of understanding when a value changes, and what that change was.
 * Useful for debugging excess re-renders, often from oversubscription, or state/prop updates with
 * identical objects that have different references.
 *
 * When using in a component, it's often best to add all parts of a context, state and props to
 * get the best information from it.
 *
 * @example
 * ```
 * const ComponentName = ({prop1, prop2, ...rest}) => {
 *    // rest context helps to ensure that updates to the context, we don't care about aren't involved in the re-render (they almost always are)
 *    const {contextKey1, contextKey2, ...restContext} = useContext(...)
 *    const [state1, _] = useState()
 *    const [state2, _] = useState()
 *    useWhyDidYouRerender('ComponentName', {prop1, prop2, ...rest, contextKey1, contextKey2, ...restContext, state1, state2})
 *    return <div />
 * }
 * ```
 *
 * From https://github.com/gragland/usehooks/blob/0a85aa9a04ca40caf82e994d494a4c1492552f88/src/pages/useWhyDidYouUpdate.md
 * Licensed with the unlicense https://github.com/gragland/usehooks/blob/0a85aa9a04ca40caf82e994d494a4c1492552f88/LICENSE
 */
export default function useWhyDidYouRerender<P extends object>(name: string, trackedAttributes: P) {
  // Get a mutable ref object where we can store trackedAttributes ...
  // ... for comparison next time this hook runs.
  const previousTrackedAttributes = useRef<P>()

  useEffect(() => {
    if (previousTrackedAttributes.current) {
      // Get all keys from previous and current trackedAttributes
      const allKeys = Object.keys({
        ...previousTrackedAttributes.current,
        ...trackedAttributes,
      }) as Array<keyof P>

      // Use this object to keep track of changed trackedAttributes
      const changesObj: {[K in keyof P]?: {from: P[K]; to: P[K]}} = {}
      // Iterate through keys
      for (const key of allKeys) {
        if (!previousTrackedAttributes.current) return

        // If previous is different from current
        if (previousTrackedAttributes.current[key] !== trackedAttributes[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: previousTrackedAttributes.current[key],
            to: trackedAttributes[key],
          }
        }
      }

      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        // eslint-disable-next-line no-console
        console.log('[why-did-you-update]', name, changesObj)
      }
    }

    // Finally update previousTrackedAttributes with current trackedAttributes for next hook call
    previousTrackedAttributes.current = trackedAttributes
  })
}
