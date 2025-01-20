import {useContext} from 'react'

import {RepositoriesContext} from './repositories-state-provider'

/**
 * This hook provides components with four things:
 *
 * clearCachedSuggestions: a function which nulls the cache timeout,
 * causing suggestRepositories to fetch from the server on its next call
 *
 * searchRepositories: a function which fetches a list of repositories from
 * the server which match a query string
 *
 * suggestRepositories: a function which will populate a list of repositories
 * either from the local cache or from the server.
 *
 * repositoriesCache: A reference to the current set of repositories stored
 * in the provider.
 * WARNING: this is only used for tests currently, and the application should
 * invoke `suggestRepositories` which handles refreshing or returning the
 * cached values.
 *
 */
export const useRepositories = () => {
  const context = useContext(RepositoriesContext)
  if (!context) {
    throw new Error('useRepositories must be used within a RepositoriesStateProvider')
  }

  const {suggestRepositories, repositoriesCache, clearCachedSuggestions} = context

  return {
    clearCachedSuggestions,
    suggestRepositories,
    repositoriesCache,
  }
}
