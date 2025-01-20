import {useEffect} from 'react'
import {setUserContentScrolling} from '@github-ui/allow-user-content-scrolling'

// When this effect is used in a React component, it disables the user-content
// scrolling behaviour implemented in github/behaviors/user-content.ts (and
// re-enable it when it unmounts), so the component can have more precise control
// over scrolling.
export function useDisableUserContentScrolling() {
  setUserContentScrolling(false)
  useEffect(() => {
    return () => setUserContentScrolling(true)
  }, [])
}
