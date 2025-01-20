import {createContext, memo, useCallback, useMemo, useRef} from 'react'

import {apiGetRepositories} from '../../api/repository/api-get-repositories'
import type {SuggestedRepository} from '../../api/repository/contracts'
import {useProjectNumber} from '../memex/use-project-number'
import {getCacheKey} from './helpers'

export const FETCH_REPOS_CACHE_TIMEOUT = 30_000

type RepositoriesCache = {
  [key: string]: {
    lastFetched: number
    repositories: Array<SuggestedRepository>
  }
}

const initialCache: RepositoriesCache = {
  default: {
    lastFetched: 0,
    repositories: [],
  },
}

type SuggestedRepositoriesFnArgs = {
  repositoryId?: number
  onlyWithIssueTypes?: boolean
  milestone?: string
}

export type RepositoriesContextType = {
  /**
   * A callback to fire to fetch suggested repositories for the current project
   * Pass an issueTypeId to limit the suggestions only to repositories that have
   * access to issue types. The arguments here are mutually exclusive.
   *
   * */
  suggestRepositories: ({
    repositoryId,
    onlyWithIssueTypes,
    milestone,
  }?: SuggestedRepositoriesFnArgs) => Promise<Array<SuggestedRepository>>
  /**
   * A reference to the current set of repositories stored in the provider.
   *
   * WARNING: this is only used for tests currently, and the application should
   * invoke `suggestRepositories` which handles refreshing or returning the
   * cached values.
   */
  repositoriesCache: React.MutableRefObject<RepositoriesCache>
  /**
   * Nulls out the lastFetchedRepositoriesAt timestamp, which invalidates
   * the cache and ensures suggestions are fetched from the server
   * when they're next requested
   */
  clearCachedSuggestions: () => void
}

export const RepositoriesContext = createContext<RepositoriesContextType | null>(null)

export const RepositoriesStateProvider = memo<{children: React.ReactNode}>(function RepositoriesStateProvider({
  children,
}) {
  const {projectNumber} = useProjectNumber()

  const repositoriesCache = useRef<RepositoriesCache>(initialCache)

  const shouldFetchRepositories = useCallback(
    (now: number, cacheKey: string, repositoryId: number | undefined): boolean => {
      const current = repositoriesCache.current[cacheKey]
      if (repositoryId && !current?.repositories.find(repo => repo.id === repositoryId)) return true
      return current == null || now - current.lastFetched > FETCH_REPOS_CACHE_TIMEOUT
    },
    [],
  )

  const updateCache = useCallback((cacheKey: string, repositories: Array<SuggestedRepository>, lastFetched: number) => {
    const cache = repositoriesCache.current
    repositoriesCache.current = {...cache, [cacheKey]: {...cache[cacheKey], lastFetched, repositories}}
  }, [])

  const suggestRepositories = useCallback(
    async (args?: SuggestedRepositoriesFnArgs) => {
      const {repositoryId, onlyWithIssueTypes = false, milestone} = args || {}
      const now = Date.now()
      const cacheKey = getCacheKey(onlyWithIssueTypes, milestone)

      if (!shouldFetchRepositories(now, cacheKey, repositoryId)) {
        const cachedRepositories = repositoriesCache.current[cacheKey]?.repositories
        if (cachedRepositories && cachedRepositories.length > 0) {
          return cachedRepositories
        }
      }

      const response = await apiGetRepositories({
        memexNumber: projectNumber,
        repositoryId,
        onlyWithIssueTypes,
        milestone,
      })

      updateCache(cacheKey, response.repositories, now)

      return response.repositories
    },
    [shouldFetchRepositories, projectNumber, updateCache],
  )

  const clearCachedSuggestions = useCallback(() => {
    repositoriesCache.current = initialCache
  }, [])

  const contextValue: RepositoriesContextType = useMemo<RepositoriesContextType>(
    () => ({
      suggestRepositories,
      repositoriesCache,
      clearCachedSuggestions,
    }),
    [suggestRepositories, clearCachedSuggestions],
  )
  return <RepositoriesContext.Provider value={contextValue}>{children}</RepositoriesContext.Provider>
})
