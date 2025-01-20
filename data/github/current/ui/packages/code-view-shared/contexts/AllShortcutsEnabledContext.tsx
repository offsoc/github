import React from 'react'

const AllShortcutsEnabledContext = React.createContext(true)

export function AllShortcutsEnabledProvider({
  allShortcutsEnabled,
  children,
}: React.PropsWithChildren<{allShortcutsEnabled: boolean}>) {
  return (
    <AllShortcutsEnabledContext.Provider value={allShortcutsEnabled}> {children} </AllShortcutsEnabledContext.Provider>
  )
}

export function useAllShortcutsEnabled() {
  return React.useContext(AllShortcutsEnabledContext)
}
