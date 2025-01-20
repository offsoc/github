import {createContext, useContext} from 'react'

const ReadOnlyContext = createContext<boolean>(false)

export function ReadOnlyProvider({readOnly, children}: React.PropsWithChildren<{readOnly: boolean}>) {
  return <ReadOnlyContext.Provider value={!!readOnly}> {children} </ReadOnlyContext.Provider>
}

export function useReadOnly() {
  const context = useContext(ReadOnlyContext)
  if (context === undefined) {
    throw new Error('useReadOnly must be within ReadOnlyProvider')
  }
  return context
}
