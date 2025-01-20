import {createContext, useContext} from 'react'
import type {Author} from '../types'

const CurrentUserContext = createContext<Author | undefined>(undefined)

export function CurrentUserProvider({user, children}: React.PropsWithChildren<{user?: Author}>) {
  return <CurrentUserContext.Provider value={user}> {children} </CurrentUserContext.Provider>
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
