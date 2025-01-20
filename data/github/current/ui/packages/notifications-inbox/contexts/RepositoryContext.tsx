/**
 * Inbox context that holds information about user repositories.
 */
import {createContext, type FC, type ReactNode, useContext, useEffect, useMemo, useState} from 'react'
import {graphql} from 'relay-runtime'

import type {RepositoryContextQuery} from './__generated__/RepositoryContextQuery.graphql'
import {useLazyLoadQuery} from 'react-relay'

export type NameWithOwnerRepository = {
  nameWithOwner: string
}

type RepositoryContextType = {
  repositories: NameWithOwnerRepository[]
}

type RepositoryContextProviderProps = {
  value?: NameWithOwnerRepository[]
  children: ReactNode
}

const RepositoryContext = createContext<RepositoryContextType | null>(null)

const REPOSITORIES_TO_FETCH = 10

const userRepositoriesQuery = graphql`
  query RepositoryContextQuery($limit: Int!) {
    viewer {
      notificationRepositories(limit: $limit) {
        repository {
          nameWithOwner
        }
      }
    }
  }
`

export const RepositoryContextProvider: FC<RepositoryContextProviderProps> = ({children, value = []}) => {
  const [repositories, setRepositories] = useState<NameWithOwnerRepository[]>(value)
  const apiData = useLazyLoadQuery<RepositoryContextQuery>(
    userRepositoriesQuery,
    {
      limit: REPOSITORIES_TO_FETCH,
    },
    {fetchPolicy: 'store-and-network'},
  )

  useEffect(
    /// Read the data from the API and set the repositories
    function readApiData() {
      if (repositories.length > 0) {
        return
      }
      if (apiData) {
        const {viewer} = apiData
        const {notificationRepositories} = viewer

        // Filter out null repository
        const repos: NameWithOwnerRepository[] =
          notificationRepositories
            .filter((repo: {repository: NameWithOwnerRepository}) => (repo.repository ? true : false))
            .map((repo: {repository: NameWithOwnerRepository}) => ({
              nameWithOwner: repo.repository.nameWithOwner,
            })) ?? []

        setRepositories(repos)
      }
    },
    [apiData, repositories],
  )

  const providerData = useMemo(
    () => ({
      repositories,
    }),
    [repositories],
  )

  return <RepositoryContext.Provider value={providerData}>{children}</RepositoryContext.Provider>
}

export function useRepositoryContext(): RepositoryContextType {
  const context = useContext(RepositoryContext)
  if (!context) {
    throw new Error('useRepositoryContext must be used within a RepositoryContextProvider.')
  }

  return context
}
