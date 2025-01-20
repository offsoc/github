import {useEffect, useRef} from 'react'

export function useBodyClass<T>(className: string, dependency: T) {
  const hasAdded = useRef(false)

  useEffect(() => {
    const enableClass = Boolean(dependency)

    if (enableClass) {
      document.body.classList.add(className)
      hasAdded.current = true
    } else {
      // Only remove the class if the caller was responsible for adding it.
      // This way, multiple components can use the same class without interference.
      if (hasAdded.current) document.body.classList.remove(className)
      hasAdded.current = false
    }

    return () => {
      if (hasAdded.current) document.body.classList.remove(className)
      hasAdded.current = false
    }
  }, [className, dependency])
}
