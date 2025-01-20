import {createContext, useContext} from 'react'

const MaxDepthContext = createContext<number>(6)

export function MaxDepthProvider({maxDepth, children}: React.PropsWithChildren<{maxDepth?: number}>) {
  return <MaxDepthContext.Provider value={maxDepth || 6}>{children}</MaxDepthContext.Provider>
}

export function useMaxDepth() {
  const context = useContext(MaxDepthContext)
  if (context === undefined) {
    throw new Error('useMaxDepth must be within MaxDepthProvider')
  }
  return context
}
