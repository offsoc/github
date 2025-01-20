import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useEffect} from 'react'

// This hook is used to detect when there is a clicks outside of the given elements.
// params:
// - refs: an array of refs to check for clicks outside
// - callback: a callback to call when there is a click outside of the refs
export function useClickOutside(refs: Array<React.RefObject<HTMLElement>>, callback: () => void) {
  const refsRef = useTrackingRef(refs)
  const callbackRef = useTrackingRef(callback)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // if the element is detached, exit
      if (!document.body.contains(e.target as Node)) {
        return
      }
      // If the clicked element isn't inside the refs, call the callback
      if (!refsRef.current.some(ref => ref.current?.contains(e.target as Node))) {
        callbackRef.current()
      }
    }
    addEventListener('click', onClick, true)

    return () => {
      removeEventListener('click', onClick, true)
    }
  }, [refsRef, callbackRef])
}
