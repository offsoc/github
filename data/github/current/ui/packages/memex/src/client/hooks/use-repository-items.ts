import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useRef, useState} from 'react'

import {apiSearchRepositoryItems} from '../api/repository/api-search-repository-items'
import type {RepositoryItem} from '../api/repository/contracts'
import {useProjectNumber} from '../state-providers/memex/use-project-number'
import {useApiRequest} from './use-api-request'

const SHORT_DEBOUNCE_DELAY_MS = 200

type TSearchRepositoryItemsRequest = {repositoryId: number; query: string; memexNumber?: number}
type TSearchRepositoryItemsResult = Array<RepositoryItem>

/**
 * Exposes data that allows a consumer to search items (issues and pull requests)
 * for a particular repository.
 *
 * searchRepositoryItems - An async function that can be used to issue a search request.
 * searchRepositorItemsResult - Returns a status object that wraps the results of the search request.
 */
export const useRepositoryItems = (setLoading: (isLoading: boolean) => void, options?: {limit?: number}) => {
  const [items, setItems] = useState<Array<RepositoryItem> | null>(null)
  const [finishedFetchingRepoItems, setFinishedFetchingRepoItems] = useState<boolean>(false)
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()
  const previousQuery = useRef<string | undefined>()
  const {projectNumber: existingMemexNumber} = useProjectNumber()

  const searchRequest = useCallback(
    async ({repositoryId, query, memexNumber}: TSearchRepositoryItemsRequest) => {
      const response = await apiSearchRepositoryItems(repositoryId, query, memexNumber, options?.limit)
      return response.issuesAndPulls
    },
    [options?.limit],
  )

  const {perform: searchRepositoryItems, status: searchRepositoryItemsResult} = useApiRequest<
    TSearchRepositoryItemsRequest,
    void,
    TSearchRepositoryItemsResult
  >({request: searchRequest})

  const refresh = useCallback(
    async (repositoryId: number, query: string, force = false) => {
      setFinishedFetchingRepoItems(false)
      const trimmedQuery = query.trim()
      const shouldRefresh = force || previousQuery.current === undefined || previousQuery.current !== trimmedQuery
      let result = undefined

      if (shouldRefresh) {
        if (!force) setLoading(true)
        if (debouncedSearch.current) debouncedSearch.current.cancel()

        debouncedSearch.current = debounce(async () => {
          await searchRepositoryItems({repositoryId, memexNumber: existingMemexNumber, query: trimmedQuery})
          if (searchRepositoryItemsResult.current.status === 'succeeded') {
            setItems(searchRepositoryItemsResult.current.data)
            setFinishedFetchingRepoItems(true)
          }
          if (!force) setLoading(false)
        }, SHORT_DEBOUNCE_DELAY_MS)

        result = debouncedSearch.current()
      }

      previousQuery.current = trimmedQuery
      result ||= Promise.resolve()

      return result
    },
    [searchRepositoryItems, existingMemexNumber, searchRepositoryItemsResult, setLoading],
  )

  const removeItem = useCallback(
    (itemToRemove: RepositoryItem): void => {
      if (items) {
        setItems(items.filter(item => item.id !== itemToRemove.id))
      }
    },
    [items, setItems],
  )

  const removeItems = useCallback(
    (itemNumbersToRemove: Set<number>): void => {
      setItems(
        suggestedItems =>
          suggestedItems && suggestedItems.filter(itemModel => !itemNumbersToRemove.has(itemModel.number)),
      )
    },
    [setItems],
  )

  return {
    items,
    removeItem,
    removeItems,
    refresh,
    finishedFetchingRepoItems,
    setFinishedFetchingRepoItems,
  }
}
