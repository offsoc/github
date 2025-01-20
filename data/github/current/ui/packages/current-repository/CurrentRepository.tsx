import React from 'react'

const CurrentRepositoryContext = React.createContext({} as Repository)

export function CurrentRepositoryProvider({repository, children}: React.PropsWithChildren<{repository: Repository}>) {
  return <CurrentRepositoryContext.Provider value={repository}> {children} </CurrentRepositoryContext.Provider>
}

export function useCurrentRepository() {
  return React.useContext(CurrentRepositoryContext)
}

export interface Repository {
  id: number
  name: string
  ownerLogin: string
  defaultBranch: string
  createdAt: string

  /**
   * Whether the user can push to this repository. It doesn't depend on the current ref.
   */
  currentUserCanPush: boolean
  /**
   * Indicates whether the repository is a fork.
   */
  isFork: boolean
  /**
   * Indicates whether the repository has files.
   */
  isEmpty: boolean
  ownerAvatar: string
  public: boolean
  private: boolean
  isOrgOwned: boolean
}

export type RepositoryNWO = Pick<Repository, 'ownerLogin' | 'name'>
