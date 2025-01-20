import {createContext, memo, useContext, useMemo, useRef} from 'react'

type ViewOptionsMenuRefContextType = {
  anchorRef: React.MutableRefObject<HTMLButtonElement | null>
}

export const ViewOptionsMenuRefContext = createContext<ViewOptionsMenuRefContextType | null>(null)

export const ViewOptionsMenuRefContextProvider = memo(function ViewOptionsMenuRefContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  return (
    <ViewOptionsMenuRefContext.Provider
      value={useMemo<ViewOptionsMenuRefContextType>(
        () => ({
          anchorRef,
        }),
        [],
      )}
    >
      {children}
    </ViewOptionsMenuRefContext.Provider>
  )
})

export const useViewOptionsMenuRef = () => {
  const context = useContext(ViewOptionsMenuRefContext)
  if (!context) {
    throw new Error('useViewOptionsMenu must be used within a ViewOptionsMenuRefContextProvider')
  }

  return context
}
