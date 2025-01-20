import React from 'react'

import type {CurrentUser} from '@github-ui/repos-types'

const CurrentUserContext = React.createContext<CurrentUser | undefined>(undefined)

export function CurrentUserProvider({user, children}: React.PropsWithChildren<{user?: CurrentUser}>) {
  return <CurrentUserContext.Provider value={user}> {children} </CurrentUserContext.Provider>
}

export function useCurrentUser() {
  return React.useContext(CurrentUserContext)
}
