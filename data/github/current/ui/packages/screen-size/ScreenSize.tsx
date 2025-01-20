import {debounce} from '@github/mini-throttle'
import React, {useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore} from 'react'

export const enum ScreenSize {
  small = 1,
  medium = 544,
  large = 768,
  xlarge = 1012,
  xxlarge = 1280,
  xxxlarge = 1350,
  xxxxlarge = 1440,
}

const screenBreakpoints = [
  ScreenSize.xxxxlarge,
  ScreenSize.xxxlarge,
  ScreenSize.xxlarge,
  ScreenSize.xlarge,
  ScreenSize.large,
  ScreenSize.medium,
  ScreenSize.small,
]

interface ScreenContextData {
  /**
   * Specifies the size of the current window
   */
  screenSize: ScreenSize
}

const ScreenContext = React.createContext<ScreenContextData>({screenSize: ScreenSize.small})

export function useScreenSize() {
  return React.useContext(ScreenContext)
}

interface Props {
  /**
   * @property {ScreenSize} [initialValue=ScreenSize.small] Initial value is useful to test react components that rely on ScreenContext.
   */
  initialValue?: ScreenSize
}

export function ScreenSizeProvider({children, initialValue}: React.PropsWithChildren<Props>) {
  const initial = useSyncExternalStore(
    () => () => {},
    () => initialValue ?? getCurrentSize(window.innerWidth),
    () => initialValue ?? ScreenSize.small,
  )
  const currentSizeRef = useRef(initial)
  const [screenSize, setScreenSize] = useState(initial)

  const onResize = useCallback(() => {
    const updatedSize = getCurrentSize(window.innerWidth)
    if (currentSizeRef.current !== updatedSize) {
      currentSizeRef.current = updatedSize
      setScreenSize(updatedSize)
    }
  }, [])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(debounce(onResize))
    resizeObserver.observe(document.documentElement)

    return () => resizeObserver.disconnect()
  }, [onResize])

  const contextValue = useMemo(() => {
    return {screenSize}
  }, [screenSize])

  return <ScreenContext.Provider value={contextValue}>{children}</ScreenContext.Provider>
}

export function getCurrentSize(elementWidth: number) {
  for (const breakpoint of screenBreakpoints) {
    if (elementWidth >= breakpoint) {
      return breakpoint
    }
  }
  return ScreenSize.small
}
