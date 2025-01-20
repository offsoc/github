import {createContext, type PropsWithChildren, useContext} from 'react'

const BaseAvatarUrlContext = createContext<string>('')

export function BaseAvatarUrlProvider({baseAvatarUrl, children}: PropsWithChildren<{baseAvatarUrl?: string}>) {
  return <BaseAvatarUrlContext.Provider value={baseAvatarUrl || ''}> {children} </BaseAvatarUrlContext.Provider>
}

export function useBaseAvatarUrl() {
  const context = useContext(BaseAvatarUrlContext)
  if (context === undefined) {
    throw new Error('useBaseAvatarUrl must be within BaseAvatarUrlProvider')
  }
  return context
}
